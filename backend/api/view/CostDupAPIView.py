from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import CreateAPIView
from django.db.models import Case, When, Max, Sum, Q, F, DecimalField, Value, CharField
from django.db.models.functions import TruncMonth, Coalesce
from django.db import connections

from datetime import datetime
import pandas as pd
from api.models import *
from api.serializers import *
from api.utils import *


class CostDupAPIView(APIView):
    """ /api/costs/dup"""
    def get(self, request):
        year = datetime.now().year
        estimate_dt = datetime.now().date().replace(day=1)
        estimate_date = datetime.strftime(estimate_dt, "%Y-%m-%d")
        frc_owner = 'Управление персоналом'
        
        # all dates
        dates = get_dates()
        
        # mapping rfc
        query = """
            with dup_frc as (
                select fi.frc from fin.frc_index fi
                where fi.dup_frc is true
            ), dup_mapping as (
                select cdm.type_1c, cdm.division, cdm.cons_type
                from fin.cost_dup_mapping cdm
                where cdm.division in ('ФОТ', 'Страховые взносы', 'Прочие затраты на персонал')
            )
            select cdm.type_1c, cdm.division, cdm.cons_type, fi.frc 
            from dup_mapping cdm
            cross join dup_frc fi
            union all
            select cdm.type_1c, cdm.division, cdm.cons_type, 'Без ЦФО' as frc
            from fin.cost_dup_mapping cdm
            where cdm.division in ('Прочие расходы') 
            """

        with connections['fin'].cursor() as cursor:
            cursor.execute(query)
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()

        mapping_frc = pd.DataFrame(rows, columns=columns)

        mapping_frc = (
            mapping_frc
            .rename(columns={
                "type_1c": "subgroup",
                "cons_type": "group",
            })
            [['group', 'subgroup', 'division', 'frc']]
        )

        without_frc = mapping_frc.query('frc == "Без ЦФО"')['subgroup'].to_list()


        # plan
        qs = ( 
            CostPlanModel.objects.using('fin')
            .filter(frc_owner=frc_owner, date_dt__year=year)
            .annotate(
                month_date = TruncMonth("date_dt"),
                frc_display=Case(
                    When(cost_1c__in=without_frc, then=Value("Без ЦФО")),
                    default="frc",
                    output_field=CharField(),
                )
                      )
            .values("month_date", "frc_display", "cost_consolidation", "cost_1c")
            .annotate(
                month_amount=Sum("amount"),
            )
            .order_by("month_date")
        )
        ser = CostDupPlanSerializer(qs, many=True)

        plan = ( 
            pd.json_normalize(ser.data)
            .rename(columns={
                "cost_consolidation": "group", 
                "cost_1c": "subgroup",
                "month_amount": "amount",
                "month_date": "date_dt",
                "frc_display": "frc",
                })
            [['date_dt', 'frc', 'group', 'subgroup', 'amount']]
        )

        plan = (
            dates['plan']
            .merge(mapping_frc, how='cross')
            .merge(plan, how='left', on=['date_dt', 'frc', 'group', 'subgroup'])
            .assign(
                amount = lambda x: x['amount'].astype('float64').fillna(0),
                source = 'План',
                is_editable=0,
                id=None,
            )
            .rename(columns={'date_dt': 'month'})
            [['id', 'month', 'month_name', 'source', 'division', 'frc', 'subgroup', 'amount', 'is_editable']]
        )
        
        
        # estimate 
        qs = ( 
            CostEstModel.objects.using('fin')
                .filter(frc_owner=frc_owner, date_dt__year=year, estimate_date=estimate_date)
                .values(
                        'id', 'date_dt', "frc",
                        'cons_type', 'type_1c' 
                    )
                .annotate(
                    amount=Coalesce(F('amount'), 0, output_field=DecimalField()),
                )
        )
        ser = CostDupEstSerializer(qs, many=True)

        est = (
            pd.json_normalize(ser.data)
            .rename(columns={
                "cons_type": "group",
                "type_1c": "subgroup",
            })
            [['id', 'date_dt', 'frc', 'group', 'subgroup', 'amount']]
        )

        est = (
            dates['est']
            .merge(mapping_frc, how='cross')
            .merge(est, how='left', on=['date_dt', 'frc', 'group', 'subgroup'])
            .assign(
                amount = lambda x: x['amount'].astype('float64').fillna(0),
                source = 'Прогноз',
                is_editable=is_editable(),
            )
            .rename(columns={'date_dt': 'month'})
            [['id', 'month', 'month_name', 'source', 'division', 'frc', 'subgroup', 'amount', 'is_editable']]
        )


        # fact
        qs = (
            CostFactModel.objects.using('fin')
            .filter(frc_owner=frc_owner, date_dt__year=year)
            .annotate(
                month_date = TruncMonth("date_dt"),
                frc_display=Case(
                    When(type_1c__in=without_frc, then=Value("Без ЦФО")),
                    default="frc",
                    output_field=CharField(),
                )
            )
            .values("month_date", "frc_display", "cons_type", "type_1c")
            .annotate(
                month_amount=Sum("amount"),
            )
            .order_by("month_date")
        )
        ser = CostDupFactSerializer(qs, many=True)
        fact = (
            pd.json_normalize(ser.data)
            .rename(columns={
                "cons_type": "group",
                "type_1c": "subgroup",
                "month_amount": "amount",
                "month_date": "date_dt",
                "frc_display": "frc",
            })
            [['date_dt', 'frc', 'group', 'subgroup', 'amount']]
        )

        fact = (
            dates['fact']
            .merge(mapping_frc, how='cross')
            .merge(fact, how='left', on=['date_dt', 'frc', 'group', 'subgroup'])
            .assign(
                amount = lambda x: x['amount'].astype('float64').fillna(0),
                source = 'Факт',
                is_editable=0,
                id=None,
            )
            .rename(columns={'date_dt': 'month'})
            [['id', 'month', 'month_name', 'source', 'division', 'frc', 'subgroup', 'amount', 'is_editable']]
        )

        res = (
            pd.concat([plan, est, fact])
            .sort_values(['division', 'frc', 'subgroup', 'month', 'source'])
            #.query('(frc == "Информационная безопасность") and (subgroup == "4.11.1. 26. Расходы НПФ")')
        )

        
        return Response(res.to_dict(orient="records"))
