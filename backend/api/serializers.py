from rest_framework import serializers
from .models import RevenuePlan2025, RevenueEst2025, RevenueFact, RevenueUsers

class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevenuePlan2025
        fields = ["date_dt", "frc", "amount"]

class EstSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevenueEst2025
        fields = ["id", "company", "date_dt", "estimate_date", "frc", "est_amount", "hcl_amount", "contr_amount"]

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevenueUsers
        fields = ["frc", "user", "login"]
