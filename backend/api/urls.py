from django.urls import path
from api.views import *
from api.view.CostsViews import CostByFrcAPIView, CostEstSaveAPIView
from api.view.CostDupAPIView import CostDupAPIView
from api.view.RevenueViews import RevenueByFrcAPIView, RevenueSaveAPIView
from api.view.LogViews import UpsertVisitedLogsView, UpsertUpdatedLogsView 
from api.view.ExcelDupImportView import ExcelDupImportAPIView 

urlpatterns = [
    path("health/", health, name='health_check'),
    path("api/plan/", PlanByFrcAPIView.as_view(), name="api-plan"),
    path("api/est/", EstByFrcAPIView.as_view(), name="api-est"),
    path("api/est/save/", SaveEstimatesAPIView.as_view(), name="revenue-api-save"),
    path("api/frc/list/", FrcList.as_view(), name="frc-list"),
    path("api/fact/", FactByFrcAPIView.as_view(), name="api-fact"),
    path("api/frc/by_user/", FrcByUser.as_view(), name='frc-by-user'),
    path("api/est/log/", SaveEstLog.as_view(), name="est-log"),
    path("api/costs/", CostByFrcAPIView.as_view(), name="costs-by-frc"),
    path("api/costs/dup/", CostDupAPIView.as_view(), name="costs-dup"),
    path("api/cost/save/", CostEstSaveAPIView.as_view(), name="cost-est-save"),
    path("api/revenue/", RevenueByFrcAPIView.as_view(), name="revenue-by-frc"),
    path("api/revenue/save/", RevenueSaveAPIView.as_view(), name="revenue-save"),

    path("api/logs/visited/", UpsertVisitedLogsView.as_view(), name="save-visited-logs"),
    path("api/logs/updated/", UpsertUpdatedLogsView.as_view(), name="save-updated-logs"),

    path("api/import/dup/", ExcelDupImportAPIView.as_view(), name="dup-excel-import"),
]
