from rest_framework import serializers
from .models import *


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


class RevenuePlanSerializer(serializers.Serializer):
    month_date = serializers.DateField() 
    month_amount = serializers.DecimalField(max_digits=12, decimal_places=2)

class RevenueEstSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevenueEst2025
        fields = ["id", "date_dt", "est_amount", "hcl_amount", "contr_amount"]

class RevenueFactSerializer(serializers.Serializer):
    month_date = serializers.DateField() 
    month_amount = serializers.DecimalField(max_digits=12, decimal_places=2)


class CostEstSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostEstModel 
        fields= ["id", "date_dt", "cons_type", "type_1c", "amount"]

class CostDupEstSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    date_dt = serializers.DateField() 
    type_1c = serializers.CharField()
    frc = serializers.CharField()
    cons_type = serializers.CharField()
    type_1c = serializers.CharField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)

class CostPlanSerializer(serializers.Serializer):
    month_date = serializers.DateField() 
    cost_1c = serializers.CharField()
    cost_consolidation = serializers.CharField()
    month_amount = serializers.DecimalField(max_digits=12, decimal_places=2)

class CostDupPlanSerializer(CostPlanSerializer):
    frc_display = serializers.CharField()

class CostFactSerializer(serializers.Serializer):
    month_date = serializers.DateField() 
    cons_type = serializers.CharField()
    type_1c = serializers.CharField()
    month_amount = serializers.DecimalField(max_digits=12, decimal_places=2)

class CostDupFactSerializer(CostFactSerializer):
    frc_display = serializers.CharField()


class CostFrcMappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostFrcMappingModel
        fields= ["type_1c", "frc"]

class CostConsolidateMappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostConsolidateMappingModel
        fields= ["type_1c", "cons_type"]

class CostDupMappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostDupMappingModel
        fields= ["type_1c", "division", "cons_type"]

class FrcIndexSerializer(serializers.ModelSerializer):
    class Meta:
        model = FrcIndexModel 
        fields= ["frc"]
