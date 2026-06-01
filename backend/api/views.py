from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import CreateAPIView
from django.db.models import Max, Sum, Q, F, DecimalField
from django.db.models.functions import TruncMonth, Coalesce
from datetime import datetime, date, timedelta
from .models import ( RevenuePlan2025, 
                     RevenueEst2025, 
                     RevenueFact, 
                     RevenueUsers, 
                     RevenueEstLog,
                     CostEstModel,
                     CostPlanModel,
                     CostFactModel,
                     )
from .serializers import ( PlanSerializer, 
                          EstSerializer, 
                          UserSerializer, 
                          EstLogSerializer,
                          CostEstSerializer,
                          CostPlanSerializer,
                          CostFactSerializer,
                          )
from .utils import decrypt_param
from django.db import transaction
from django.db.models.functions import Extract
from dateutil.relativedelta import relativedelta
import logging

import calendar

from django.http import JsonResponse
from django.db import connections
from django.conf import settings
import redis

logger = logging.getLogger(__name__)

def health(request):
    return JsonResponse({"status": "ok"})

class PlanByFrcAPIView(APIView):
    """
    Возвращает список планов для текущего года для данного frc.
    GET /api/plan/?frc=XXX
    """
    def get(self, request):
        frc = request.GET.get("frc")
        year = datetime.now().year
        if not frc:
            return Response({"detail": "frc required"}, status=400)
        qs = RevenuePlan2025.objects.filter(frc=frc, date_dt__year=year).using('fin')
        ser = PlanSerializer(qs, many=True)
        return Response(ser.data)

class FrcByUser(APIView):
    def get(self, request):
        user = request.GET.get("user")
        user = decrypt_param(user)
        if user:
            qs = RevenueUsers.objects.filter(login=user).using('fin')
            ser = UserSerializer(qs, many=True)
            return Response(ser.data)
        else:
            return Response([])

class FrcList(APIView):
    def get(self, request):
        frc = RevenueEst2025.objects.values('frc').distinct().using('fin')
        res = []
        for rec in frc:
            res.append(rec['frc'])
        return Response(res)

class EstByFrcAPIView(APIView):
    """
    Возвращает по frc данные прогноза: для каждого месяца берём запись с максимальным estimate_date (если есть)
    GET /api/est/?frc=XXX
    """
    def get(self, request):
        frc = request.GET.get("frc")
        year = datetime.now().year
        cur_date = datetime.strftime(datetime.now().date() - relativedelta(months=1), "%Y-%m-01")
        cur_month = datetime.now().month
        if not frc:
            return Response({"detail": "frc required"}, status=400)

        # Найдём для каждого месяца максимальную estimate_date, затем возьмём записи с этой estimate_date
        qs = RevenueEst2025.objects.filter(frc=frc, date_dt__year=year).using('fin')
        # Group by month of date_dt
        month_map = {}  # month (1..12) -> record with max estimate_date
        result = {}
        for rec in qs:
            if (rec.estimate_date == rec.date_dt) or (rec.estimate_date.month == cur_month):
                est_am_value = rec.est_amount if rec.est_amount else 0
                hcl_am_value = rec.hcl_amount if rec.hcl_amount else 0
                contr_am_value = rec.contr_amount if rec.contr_amount else 0
                sum_amount = est_am_value + hcl_am_value + contr_am_value
                result[rec.date_dt.month] = {
                        'id': rec.id,
                        'company': rec.company,
                        'date_dt': rec.date_dt,
                        'estimate_date': rec.estimate_date,
                        'frc': rec.frc,
                        'sum_amount': sum_amount,
                        "est_amount": rec.est_amount,
                        "hcl_amount": rec.hcl_amount,
                        "contr_amount": rec.contr_amount
                        }
        return Response(result)

class FactByFrcAPIView(APIView):
    def get(self, request):
        frc = request.GET.get("frc")
        year = datetime.now().year
        cur_month = datetime.now().month
        if not frc:
            return Response({"detail": "frc required"}, status=400)

        qs = (
            RevenueFact.objects.filter(frc=frc, date_dt__year=year)
            .annotate(month = Extract("date_dt", "month"))
            .values("month")
            .annotate(month_amount=Sum("amount"))
            .order_by("month")
            .using('fin')
        )
        # Group by month of date_dt
        result = {}
        for rec in qs:
            result[rec["month"]] = rec 

        return Response(result)


class SaveEstimatesAPIView(APIView):
    def put(self, request):
        id = request.data.get("id")
        field = request.data.get("field")
        field_value = request.data.get("field_value")
        obj_qs = RevenueEst2025.objects.filter(id=id).using('fin')
        obj_qs.update_or_create(
                defaults = {f"{field}": field_value }
                )
        result = {
                "response": request.data, 
                "status": status.HTTP_201_CREATED
                }
        return Response(result)

class SaveEstLog(CreateAPIView):
    queryset = RevenueEstLog.objects.all()
    serializer_class = EstLogSerializer 

class CostEstByFrcAPIView(APIView):  
    """ Get all estimate data from table "cost_est" by frc. /api/costest?frc_owner=XXX """ 
    def get(self, request):
        frc_owner = request.GET.get("frc_owner")
        if not frc_owner:
            return Response({"detail": "frc_owner required"}, status=400)

        year = datetime.now().year
        cur_date = datetime.strftime(datetime.now().date() - relativedelta(months=1), "%Y-%m-01")
        cur_month = datetime.now().month

        qs = ( 
            CostEstModel.objects.using('fin')
                .filter(frc_owner=frc_owner, date_dt__year=year)
                .filter(Q(estimate_date=F('date_dt')) | Q(estimate_date__month=cur_month))
                .values(
                        'id', 'date_dt', 'estimate_date', 'frc', 
                        'cons_type', 'type_1c', 'frc_owner'
                    )
                .annotate(amount=Coalesce(F('amount'), 0, output_field=DecimalField()))
        )
        ser = CostEstSerializer(qs, many=True)
        return Response(ser.data)


class CostFactByFrcAPIView(APIView):
    """ /cost/fact/?frc_owner=XXX """
    def get(self, request):
        frc_owner = request.GET.get("frc_owner")
        if not frc_owner:
            return Response({"detail": "frc_owner required"}, status=400)

        year = datetime.now().year
        cur_month = datetime.now().month

        qs = (
            CostFactModel.objects.filter(frc_owner=frc_owner, date_dt__year=year)
            .annotate(
                month = Extract("date_dt", "month"),
                month_date = TruncMonth("date_dt"),
                      )
            .values("month_date", "frc", "cons_type", "type_1c", "frc_owner")
            .annotate(month_amount=Sum("amount"))
            .order_by("month")
            .using('fin')
        )
        ser = CostFactSerializer(qs, many=True)
        return Response(ser.data)


class CostPlanByFrcAPIView(APIView):
    """ /cost/plan/?frc_owner=XXX """
    def get(self, request):
        frc_owner = request.GET.get("frc_owner")
        if not frc_owner:
            return Response({"detail": "frc_owner required"}, status=400)
        
        year = datetime.now().year
        qs = CostPlanModel.objects.filter(frc_owner=frc_owner, date_dt__year=year).using('fin')
        ser = CostPlanSerializer(qs, many=True)
        return Response(ser.data)
