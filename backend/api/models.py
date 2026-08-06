from django.db import models


class RttManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(company='АО "РТ-Техприемка"')


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

    objects = models.Manager() # Default manager
    rtt = RttManager()  # Custom manager

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
    company = models.CharField(blank=True, null=True)

    # managers
    objects = models.Manager() # Default manager
    rtt = RttManager()  # Custom manager

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

    # managers
    objects = models.Manager() # Default manager
    rtt = RttManager()  # Custom manager

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


class EstimateLogsModel(models.Model):
    user = models.CharField(max_length=255, db_column='user')
    login = models.CharField(max_length=255)
    frc = models.CharField(max_length=255)
    is_revenue = models.BooleanField(default=False)
    estimate_date = models.DateField(blank=True, null=True)
    last_visited = models.DateTimeField()
    last_updated = models.DateTimeField(null=True, blank=True)
    save_values = models.JSONField(null=True, blank=True)
    
    def __str__(self):
        return self.user

    class Meta:
        managed = False
        db_table = 'estimate_logs'



class RevenuePlanModel(models.Model):
    id = models.IntegerField(blank=True, 
                             primary_key=True, 
                            unique=True
                             )
    date_dt = models.DateField(blank=True, null=True)
    frc = models.CharField(blank=True, null=True)
    amount = models.DecimalField(max_digits=30, decimal_places=2, blank=True, null=True)
    company = models.CharField(blank=True, null=True)

    # managers
    objects = models.Manager() # Default manager
    rtt = RttManager()  # Custom manager

    def __str__(self):
        return self.frc

    class Meta:
        managed = False
        db_table = 'revenue_plan_2025'


class RevenueEstModel(models.Model):
    id = models.IntegerField(blank=True, 
                             primary_key=True, 
                            unique=True
                             )
    date_dt = models.DateField(blank=True, null=True)
    estimate_date = models.DateField(blank=True, null=True)
    frc = models.CharField(blank=True, null=True)
    est_amount = models.DecimalField(max_digits=40, decimal_places=2, blank=True, null=True)
    hcl_amount = models.DecimalField(max_digits=40, decimal_places=2, blank=True, null=True)
    contr_amount = models.DecimalField(max_digits=40, decimal_places=2, blank=True, null=True)
    company = models.CharField(blank=True, null=True)

    # managers
    objects = models.Manager() # Default manager
    rtt = RttManager()  # Custom manager

    def __str__(self):
        return self.company

    class Meta:
        managed = False
        db_table = "revenue_est_2025"

class RevenueFactModel(models.Model):
    id = models.IntegerField(blank=True, 
                             primary_key=True, 
                            unique=True
                             )
    date_dt = models.DateField(blank=True, null=True)
    frc = models.CharField(blank=True, null=True)
    amount = models.DecimalField(max_digits=30, decimal_places=2, blank=True, null=True)
    company = models.CharField(blank=True, null=True)

    # managers
    objects = models.Manager() # Default manager
    rtt = RttManager()  # Custom manager

    def __str__(self):
        return self.doc

    class Meta:
        managed = False
        db_table = 'revenue_fact'



class CostEstModel(models.Model):
    id = models.IntegerField(
            blank=True, 
            primary_key=True, 
            unique=True,
            )
    date_dt = models.DateField(blank=True, null=True)
    estimate_date = models.DateField(blank=True, null=True)
    frc = models.CharField(blank=True, null=True)
    cons_type = models.CharField(blank=True, null=True)
    type_1c = models.CharField(blank=True, null=True)
    frc_owner = models.CharField(blank=True, null=True)
    amount = models.DecimalField(max_digits=40, decimal_places=2, blank=True, null=True)
    company = models.CharField(blank=True, null=True)

    # managers
    objects = models.Manager() # Default manager
    rtt = RttManager()  # Custom manager

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
    date_dt = models.DateField(blank=True, null=True)
    frc = models.CharField(blank=True, null=True)
    cost_consolidation = models.CharField(blank=True, null=True)
    cost_1c = models.CharField(blank=True, null=True)
    amount = models.DecimalField(max_digits=40, decimal_places=2, blank=True, null=True)
    frc_owner = models.CharField(blank=True, null=True)
    company = models.CharField(blank=True, null=True)

    # managers
    objects = models.Manager() # Default manager
    rtt = RttManager()  # Custom manager

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
    company = models.CharField(max_length=255, blank=True, null=True) 

    # managers
    objects = models.Manager() # Default manager
    rtt = RttManager()  # Custom manager

    def __str__(self):
        return self.company

    class Meta:
        managed = False
        db_table = "cost_fact"


class CostFrcMappingModel(models.Model):
    type_1c = models.CharField(blank=True, null=False)
    frc = models.CharField(blank=True, null=False)

    def __str__(self):
        return self.frc

    class Meta:
        managed = False
        db_table = "cost_frc_mapping"


class CostConsolidateMappingModel(models.Model):
    type_1c = models.CharField(blank=True, null=False)
    cons_type = models.CharField(blank=True, null=False)

    def __str__(self):
        return self.frc

    class Meta:
        managed = False
        db_table = "cost_consolidate_mapping"


class CostDupMappingModel(models.Model):
    type_1c = models.CharField(blank=True, null=False)
    division = models.CharField(blank=True, null=False)
    cons_type = models.CharField(blank=True, null=False)

    def __str__(self):
        return self.division

    class Meta:
        managed = False
        db_table = "cost_dup_mapping"

class FrcIndexModel(models.Model):
    frc = models.CharField(blank=True, null=False)
    rev_frc = models.CharField(blank=True, null=False)
    dup_frc = models.CharField(blank=True, null=False)

    def __str__(self):
        return self.division

    class Meta:
        managed = False
        db_table = "frc_index"
