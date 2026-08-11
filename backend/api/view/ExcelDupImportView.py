from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.db import connections
from django.db.models import Subquery
from decimal import Decimal
from api.models import CostDupMappingModel, CostEstModel

import pandas as pd
from datetime import datetime
import logging

from api.models import CostEstModel
from api.serializers import CostDupMappingSerializer

class ExcelDupImportAPIView(APIView):

    def post(self, request):
        excel_file = request.FILES.get("file")

        if excel_file is None:
            return Response( { "error": "No file uploaded" },
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs = CostDupMappingModel.objects.using('fin').all()
        ser = CostDupMappingSerializer(qs, many=True)

        if len(ser.data) > 0:
            dup_mapping = pd.json_normalize(ser.data)[['type_1c', 'cons_type']]

            # dates
            current_date = datetime.now().date().replace(day=1)
            estimate_date = current_date.strftime("%Y-%m-%d")
            dates = [current_date.replace(month=x).strftime("%Y-%m-%d") for x in range(1, 13)]
            target_dates = [x for x in dates if x >= estimate_date]
            
            # main df from excel
            df = pd.read_excel(excel_file, thousands=',')
            columns = ['group', 'frc', 'type_1c'] + dates + ['total']
            df.columns = columns
            df = (
                pd.melt(
                    df[['group', 'frc', 'type_1c'] + target_dates],
                    id_vars = ['group', 'frc', 'type_1c'],
                    var_name = 'date_dt',
                    value_name = 'amount')
                .assign(
                    estimate_date = estimate_date,
                    company = 'АО "РТ-Техприемка"',
                    frc_owner = "Управление персоналом"
                )
                .merge(dup_mapping, on='type_1c', how='inner')
                [['company', 'date_dt', 'estimate_date', 'frc', 'cons_type', 'type_1c',  'frc_owner', 'amount']]
            )

            df = df.where(pd.notnull(df), None)
            records_to_update = list(df[[
                    'company', 'date_dt', 'estimate_date', 'frc', 
                    'cons_type', 'type_1c', 'frc_owner', 'amount'
            ]].itertuples(index=False, name=None))

            if not records_to_update:
                return

            with connections['fin'].cursor() as cursor:
                # set 0 to amount 
                cursor.execute("""
                    UPDATE fin.cost_est t
                    SET amount = 0.00
                    FROM fin.cost_dup_mapping m
                    WHERE t.type_1c = m.type_1c
                    AND m.division IN ('ФОТ', 'Страховые взносы');
                """)

                cursor.execute("""
                 CREATE TEMP TABLE temp_cost_update (
                     company text,
                     date_dt date,
                     estimate_date date,
                     frc varchar(100),
                     cons_type varchar(100),
                     type_1c varchar(100),
                     frc_owner varchar(100),
                     amount float4
                 );
                """)
            
                insert_query = """
                    INSERT INTO temp_cost_update 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
                """
                cursor.executemany(insert_query, records_to_update)
            
                # 4. Execute a split JOIN UPDATE matching both unique constraint logics
                update_query = """
                    UPDATE fin.cost_est t
                    SET amount = src.amount
                    FROM temp_cost_update src
                    WHERE 
                        t.company IS NOT DISTINCT FROM src.company AND
                        t.date_dt = src.date_dt AND
                        t.estimate_date = src.estimate_date AND
                        t.cons_type IS NOT DISTINCT FROM src.cons_type AND
                        t.type_1c IS NOT DISTINCT FROM src.type_1c AND
                        (
                            -- Branch A: Condition matching cost_idx_null_frc
                            (src.frc IS NULL AND t.frc IS NULL)
                            OR
                            -- Branch B: Condition matching cost_idx_with_frc
                            (src.frc IS NOT NULL AND t.frc = src.frc AND t.frc_owner IS NOT DISTINCT FROM src.frc_owner)
                        );
                """
                cursor.execute(update_query)

                cursor.execute("DROP TABLE IF EXISTS temp_cost_update;")

        return Response(
            {
                "message": "File received successfully"
            },
            status=status.HTTP_201_CREATED,
        )
