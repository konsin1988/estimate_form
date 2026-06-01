from rest_framework import serializers
from .models import ( RevenuePlan2025, 
                     RevenueEst2025, 
                     RevenueFact, 
                     RevenueUsers, 
                     RevenueEstLog,
                     CostEstModel,
                     CostPlanModel,
                     CostFactModel,
                     )

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
        fields = ["frc", "user", "login", "is_revenue", "is_cost", "is_dup"]

class EstLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevenueEstLog 
        fields = ["user", "login", "frc", "is_revenue", "is_cost"]

    def create(self, validated_data):
        return RevenueEstLog.objects.using('fin').create(**validated_data)

class CostEstSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostEstModel 
        fields= ["id", "date_dt", "estimate_date", "frc", "cons_type", "type_1c", "frc_owner", "amount"]

class CostPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostPlanModel 
        fields= ["id", "date_dt", "frc", "cost_consolidation", "cost_1c", "frc_owner", "amount"]

class CostFactSerializer(serializers.Serializer):
    month_date = serializers.DateField() 
    frc = serializers.CharField()
    cons_type = serializers.CharField()
    type_1c = serializers.CharField()
    frc_owner = serializers.CharField()
    month_amount = serializers.DecimalField(max_digits=12, decimal_places=2)

