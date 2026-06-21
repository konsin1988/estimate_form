from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import CreateAPIView
from django.db.models import Max, Sum, Q, F, DecimalField, Value, CharField
from django.db.models.functions import TruncMonth, Coalesce
from datetime import datetime
import pandas as pd
from api.models import *
from api.serializers import *
from api.utils import *


class RevenueByFrcAPIView(APIView):
    """ /api/revenue/?frc=XXX """
    def get(self, request):
        frc = request.GET.get("frc")
        if not frc:
            return Response({"detail": "frc required"}, status=400)

        year = datetime.now().year
        estimate_dt = datetime.now().date().replace(day=1)
        estimate_date = datetime.strftime(estimate_dt, "%Y-%m-%d")

        # dates
        dates = get_dates()
        
        # plan
        qs = ( 
            RevenuePlanModel.objects.using('fin')
            .filter(frc=frc, date_dt__year=year)
            .annotate(
                month_date = TruncMonth("date_dt"),
                      )
            .values("month_date")
            .annotate(
                month_amount=Sum("amount"),
            )
            .order_by("month_date")
        )
        ser = RevenuePlanSerializer(qs, many=True)


        if len(ser.data) > 0:
            plan = ( 
                pd.json_normalize(ser.data)
                .rename(columns={
                    "month_amount": "amount",
                    "month_date": "date_dt",
                    })
                [['date_dt', 'amount']]
            )
        else: 
            plan = pd.DataFrame(columns=['date_dt', 'amount'])
        

        plan = (
            dates['plan']
            .merge(plan, how='left', on=['date_dt'])
            .assign(
                amount = lambda x: x['amount'].astype('float64').fillna(0),
                source = 'План',
                group = "Выручка",
                subgroup = None,
                is_editable=0,
                id=None,
            )
            .rename(columns={'date_dt': 'month'})
            [['id', 'month', 'month_name', 'source', 'group', 'subgroup', 'amount', 'is_editable']]
        )
        

        # estimate 
        qs = ( 
            RevenueEstModel.objects.using('fin')
                .filter(frc=frc, estimate_date=estimate_date)
                .values(
                        'id', 'date_dt', 
                    )
                .annotate(
                    est_amount=Coalesce(F('est_amount'), 0, output_field=DecimalField()),
                    hcl_amount=Coalesce(F('hcl_amount'), 0, output_field=DecimalField()),
                    contr_amount=Coalesce(F('contr_amount'), 0, output_field=DecimalField()),
                )
                .order_by("date_dt")
        )
        ser = RevenueEstSerializer(qs, many=True)
        

        if len(ser.data) > 0:
            est = (
                pd.json_normalize(ser.data)
            )
        else:
            est = pd.DataFrame(columns=['id', 'date_dt', 'est_amount', 'hcl_amount', 'contr_amount'])

        est = (
            dates['est']
            .merge(est, how='left', on=['date_dt'])
            .assign(
                id = lambda x: x['id'].fillna(0), # hardcode
                est_amount = lambda x: x['est_amount'].fillna(0).astype('float64'),
                hcl_amount = lambda x: x['hcl_amount'].fillna(0).astype('float64'),
                contr_amount = lambda x: x['contr_amount'].fillna(0).astype('float64'),
                source = 'Прогноз',
                group='Выручка',
                is_editable=is_editable(),
            )
            .rename(columns={'date_dt': 'month'})
            #[['id', 'month', 'month_name', 'source', 'group', 'amount', 'is_editable']]
        )
        cols = ['id', 'month', 'month_name', 'source', 'group', 'is_editable']
        est = ( 
            pd
               .melt(
                est,
                id_vars=cols,
                value_vars=[col for col in est.columns if col not in cols],
                var_name='subgroup',
                value_name='amount'
            )
               .assign(subgroup = lambda x: x['subgroup'].apply(lambda x: subgroup_to_ru(x)))
            [['id', 'month', 'month_name', 'source', 'group', 'subgroup', 'amount', 'is_editable']]
        )

        # fact
        qs = (
            RevenueFactModel.objects.using('fin')
            .filter(frc=frc, date_dt__year=year)
            .annotate(
                month_date = TruncMonth("date_dt"),
                      )
            .values("month_date")
            .annotate(
                month_amount=Sum("amount"),
            )
        )
        ser = RevenueFactSerializer(qs, many=True)

        if len(ser.data) > 0:
            fact = (
                pd.json_normalize(ser.data)
                .rename(columns={
                    "month_amount": "amount",
                    "month_date": "date_dt",
                })
                [['date_dt', 'amount']]
            )
        else:
            fact = pd.DataFrame(columns=['date_dt', 'amount'])
        

        fact = (
            dates['fact']
            .merge(fact, how='left', on=['date_dt'])
            .assign(
                amount = lambda x: x['amount'].astype('float64').fillna(0),
                source = 'Факт',
                is_editable=0,
                id=None,
                group="Выручка",
                subgroup=None,
            )
            .rename(columns={'date_dt': 'month'})
            [['id', 'month', 'month_name', 'source', 'group', 'subgroup', 'amount', 'is_editable']]
        )
        
        res = (
            pd.concat([plan, est, fact])
            .sort_values(['month', 'source'])
        )
        
        return Response(res.to_dict(orient="records"))


class RevenueSaveAPIView(APIView):
    def put(self, request):
        id = request.data.get("id")
        field = subgroup_to_en(request.data.get("field"))
        value = request.data.get("value")
        print(f"{field}, {value}, {id}")
        obj_qs = RevenueEst2025.objects.filter(id=id).using('fin')
        obj_qs.update_or_create(
                defaults = {f"{field}": value }
                )
        result = {
                "response": request.data, 
                "status": status.HTTP_201_CREATED
                }
        return Response(result)
