from django.db import models

class RevenueUsers(models.Model):
    id = models.IntegerField(blank=True, primary_key=True, unique=True)
    frc = models.CharField(blank=True, null=True)
    user = models.CharField(blank=True, null=True)
    email = models.CharField(blank=True, null=True)
    login = models.CharField(blank=True, null=True)
    is_revenue = models.IntegerField(blank=True, null=True)
    is_cost = models.IntegerField(blank=True, null=True)
    is_dup = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return self.login

    class Meta:
        managed = False
        db_table = 'frc_user'

class RevenueEst2025(models.Model):
    id = models.IntegerField(blank=True, 
                             primary_key=True, 
                            unique=True
                             )
    company = models.CharField(blank=True, null=True)
    date_dt = models.DateField(blank=True, null=True)
    estimate_date = models.DateField(blank=True, null=True)
    frc = models.CharField(blank=True, null=True)
    est_amount = models.DecimalField(max_digits=40, decimal_places=2, blank=True, null=True)
    hcl_amount = models.DecimalField(max_digits=40, decimal_places=2, blank=True, null=True)
    contr_amount = models.DecimalField(max_digits=40, decimal_places=2, blank=True, null=True)

    def __str__(self):
        return self.company

    class Meta:
        managed = False
        db_table = "revenue_est_2025"


class RevenueFact(models.Model):
    id = models.IntegerField(blank=True, 
                             primary_key=True, 
                            unique=True
                             )
    date_dt = models.DateTimeField(blank=True, null=True)
    c_agent = models.CharField(blank=True, null=True)
    contract = models.CharField(blank=True, null=True)
    doc = models.CharField(blank=True, null=True)
    division = models.CharField(blank=True, null=True)
    frc = models.CharField(blank=True, null=True)
    nom_g = models.CharField(blank=True, null=True)
    div_frc = models.CharField(blank=True, null=True)
    nom_frc = models.CharField(blank=True, null=True)
    amount = models.DecimalField(max_digits=30, decimal_places=2, blank=True, null=True)

    def __str__(self):
        return self.doc

    class Meta:
        managed = False
        db_table = 'revenue_fact'


class RevenuePlan2025(models.Model):
    id = models.IntegerField(blank=True, 
                             primary_key=True, 
                            unique=True
                             )
    company = models.CharField(blank=True, null=True) 
    date_dt = models.DateField(blank=True, null=True)
    frc = models.CharField(blank=True, null=True)
    amount = models.DecimalField(max_digits=30, decimal_places=2, blank=True, null=True)

    def __str__(self):
        return self.company

    class Meta:
        managed = False
        db_table = 'revenue_plan_2025'

class RevenueEstLog(models.Model):
    user = models.CharField(blank=False, null=False)
    login = models.CharField(blank=False, null=False)
    frc = models.CharField(blank=False, null=False)
    is_revenue = models.IntegerField(blank=True, default=0)
    is_cost = models.IntegerField(blank=True, default=0)
    
    def __str__(self):
        return self.user

    class Meta:
        managed = False
        db_table = 'revenue_est_log'


class CostEstModel(models.Model):
    id = models.IntegerField(
            blank=True, 
            primary_key=True, 
            unique=True,
            )
    company = models.CharField(blank=True, null=True)
    date_dt = models.DateField(blank=True, null=True)
    estimate_date = models.DateField(blank=True, null=True)
    frc = models.CharField(blank=True, null=True)
    cons_type = models.CharField(blank=True, null=True)
    type_1c = models.CharField(blank=True, null=True)
    frc_owner = models.CharField(blank=True, null=True)
    amount = models.DecimalField(max_digits=40, decimal_places=2, blank=True, null=True)

    def __str__(self):
        return self.company

    class Meta:
        managed = False
        db_table = "cost_est"


# ---------------------------------------------------------------
class CostPlanModel(models.Model):
    id = models.IntegerField(
            blank=True, 
            primary_key=True, 
            unique=True,
            )
    company = models.CharField(blank=True, null=True)
    date_dt = models.DateField(blank=True, null=True)
    frc = models.CharField(blank=True, null=True)
    cost_level = models.CharField(blank=True, null=True)
    cost_consolidation = models.CharField(blank=True, null=True)
    cost_economic = models.CharField(blank=True, null=True)
    cost_1c = models.CharField(blank=True, null=True)
    amount = models.DecimalField(max_digits=40, decimal_places=2, blank=True, null=True)
    frc_owner = models.CharField(blank=True, null=True)
    frc_spender = models.CharField(blank=True, null=True)

    def __str__(self):
        return self.company

    class Meta:
        managed = False
        db_table = "cost_plan_2025"

# ---------------------------------------------------------------
class CostFactModel(models.Model):
    id = models.IntegerField(
            blank=True, 
            primary_key=True, 
            unique=True,
            )
    date_dt = models.DateField(blank=True, null=True)
    division = models.CharField(blank=True, null=True)
    frc = models.CharField(blank=True, null=True)
    cons_type = models.CharField(blank=True, null=True)
    type_1c = models.CharField(blank=True, null=True)
    frc_owner = models.CharField(blank=True, null=True)
    amount = models.DecimalField(max_digits=40, decimal_places=2, blank=True, null=True)

    def __str__(self):
        return self.company

    class Meta:
        managed = False
        db_table = "cost_fact"

