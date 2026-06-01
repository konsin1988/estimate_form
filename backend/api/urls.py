from django.urls import path
from .views import (FrcByUser, 
                    PlanByFrcAPIView, 
                    EstByFrcAPIView, 
                    FactByFrcAPIView, 
                    SaveEstimatesAPIView, 
                    health, 
                    FrcList, 
                    SaveEstLog,
                    CostEstByFrcAPIView,
                    CostPlanByFrcAPIView,
                    CostFactByFrcAPIView,
                    )

urlpatterns = [
    path("health/", health, name='health_check'),
    path("api/plan/", PlanByFrcAPIView.as_view(), name="api-plan"),
    path("api/est/", EstByFrcAPIView.as_view(), name="api-est"),
    path("api/est/save/", SaveEstimatesAPIView.as_view(), name="api-est-save"),
    path("api/frc/list/", FrcList.as_view(), name="frc-list"),
    path("api/fact/", FactByFrcAPIView.as_view(), name="api-fact"),
    path("api/frc/by_user/", FrcByUser.as_view(), name='frc-by-user'),
    path("api/est/log/", SaveEstLog.as_view(), name="est-log"),
    path("api/cost/est/", CostEstByFrcAPIView.as_view(), name="costest"),
    path("api/cost/plan/", CostPlanByFrcAPIView.as_view(), name="costplan"),
    path("api/cost/fact/", CostFactByFrcAPIView.as_view(), name="costfact"),
]
