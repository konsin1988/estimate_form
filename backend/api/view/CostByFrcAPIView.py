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



class CostByFrcAPIView(APIView):
    """ /api/costs/?frc_owner=XXX """
    def get(self, request):
        frc_owner = request.GET.get("frc_owner")
        if not frc_owner:
            return Response({"detail": "frc_owner required"}, status=400)
        
        year = datetime.now().year
        estimate_dt = datetime.now().date().replace(day=1)
        estimate_date = datetime.strftime(estimate_dt, "%Y-%m-%d")

        # dates
        dates = get_dates()

        # frc_mapping
        qs = CostFrcMappingModel.objects.using('fin').filter(frc=frc_owner)
        ser = CostFrcMappingSerializer(qs, many=True)
        frc_mapping = pd.json_normalize(ser.data)

        # consolidation mapping 
        qs = CostConsolidateMappingModel.objects.using('fin')
        ser = CostConsolidateMappingSerializer(qs, many=True)
        consolidate_mapping = pd.json_normalize(ser.data)

        frc_cons = (
            frc_mapping
            .merge(consolidate_mapping, how="left", on="type_1c")
            .rename(columns={"cons_type": "group", "type_1c": "subgroup"})
            [["group", "subgroup"]]
        ) 


        # plan
        qs = ( 
            CostPlanModel.objects.using('fin')
            .filter(frc_owner=frc_owner, date_dt__year=year)
            .annotate(
                month_date = TruncMonth("date_dt"),
                      )
            .values("month_date", "cost_consolidation", "cost_1c")
            .annotate(
                month_amount=Sum("amount"),
            )
            .order_by("month_date")
        )
        ser = CostPlanSerializer(qs, many=True)

        if len(ser.data) > 0:
            plan = ( 
                pd.json_normalize(ser.data)
                .rename(columns={
                    "cost_consolidation": "group", 
                    "cost_1c": "subgroup",
                    "month_amount": "amount",
                    "month_date": "date_dt",
                    })
                [['date_dt', 'group', 'subgroup', 'amount']]
            )
        else: 
            plan = pd.DataFrame(columns=['date_dt', 'group', 'subgroup', 'amount'])

        plan = (
            dates['plan']
            .merge(frc_cons, how='cross')
            .merge(plan, how='left', on=['date_dt', 'group', 'subgroup'])
            .assign(
                amount = lambda x: x['amount'].astype('float64').fillna(0),
                source = 'План',
                is_editable=0,
                id=None,
            )
            .rename(columns={'date_dt': 'month'})
            [['id', 'month', 'month_name', 'source', 'group', 'subgroup', 'amount', 'is_editable']]
        )
        

        
        # estimate 
        qs = ( 
            CostEstModel.objects.using('fin')
                .filter(frc_owner=frc_owner, date_dt__year=year, estimate_date=estimate_date)
                .values(
                        'id', 'date_dt', 
                        'cons_type', 'type_1c' 
                    )
                .annotate(
                    amount=Coalesce(F('amount'), 0, output_field=DecimalField()),
                )
        )
        ser = CostEstSerializer(qs, many=True)

        est = (
            pd.json_normalize(ser.data)
            .rename(columns={
                "cons_type": "group",
                "type_1c": "subgroup",
            })
            [['id', 'date_dt', 'group', 'subgroup', 'amount']]
        )

        est = (
            dates['est']
            .merge(frc_cons, how='cross')
            .merge(est, how='left', on=['date_dt', 'group', 'subgroup'])
            .assign(
                amount = lambda x: x['amount'].astype('float64').fillna(0),
                source = 'Прогноз',
                is_editable=is_editable(),
            )
            .rename(columns={'date_dt': 'month'})
            [['id', 'month', 'month_name', 'source', 'group', 'subgroup', 'amount', 'is_editable']]
        )


        # fact
        qs = (
            CostFactModel.objects.using('fin')
            .filter(frc_owner=frc_owner, date_dt__year=year)
            .annotate(
                month_date = TruncMonth("date_dt"),
                      )
            .values("month_date", "cons_type", "type_1c")
            .annotate(
                month_amount=Sum("amount"),
            )
            .order_by("month_date")
        )
        ser = CostFactSerializer(qs, many=True)
        
        if len(ser.data) > 0:
            fact = (
                pd.json_normalize(ser.data)
                .rename(columns={
                    "cons_type": "group",
                    "type_1c": "subgroup",
                    "month_amount": "amount",
                    "month_date": "date_dt",
                })
                [['date_dt', 'group', 'subgroup', 'amount']]
            )
        else:
            fact = pd.DataFrame(columns=['date_dt', 'group', 'subgroup', 'amount'])

        fact = (
            dates['fact']
            .merge(frc_cons, how='cross')
            .merge(fact, how='left', on=['date_dt', 'group', 'subgroup'])
            .assign(
                amount = lambda x: x['amount'].astype('float64').fillna(0),
                source = 'Факт',
                is_editable=0,
                id=None,
            )
            .rename(columns={'date_dt': 'month'})
            [['id', 'month', 'month_name', 'source', 'group', 'subgroup', 'amount', 'is_editable']]
        )


        res = (
            pd.concat([plan, est, fact])
            .sort_values(['group', 'subgroup', 'month', 'source'])
            #.query('(group == "Административные расходы") and (subgroup == "2.1.4. 25. Материальные затраты")')
        )
        
        return Response(res.to_dict(orient="records"))
