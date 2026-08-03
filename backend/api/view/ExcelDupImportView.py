from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

import pandas as pd
import logging

from api.models import CostEstModel


class ExcelDupImportAPIView(APIView):

    def post(self, request):

        excel_file = request.FILES.get("file")

        if excel_file is None:
            return Response(
                {
                    "error": "No file uploaded"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


        df = pd.read_excel(excel_file)
        logging.info(df.head(2)) 

        #CostEstModel.objects.using("fin").create(
        #    month="2026-01-01",
        #    source="Прогноз",
        #    group="Test group",
        #    subgroup="Test subgroup",
        #    amount=12345,
        #    is_editable=True,
        #)

        return Response(
            {
                "message": "File received successfully"
            },
            status=status.HTTP_201_CREATED,
        )
