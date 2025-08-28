from django.db import models

class RevenueUsers(models.Model):
    frc = models.CharField(blank=True, null=True)
    user = models.CharField(blank=True, null=True)
    email = models.CharField(blank=True, null=True)
    login = models.CharField(blank=True, 
                             primary_key=True, 
                            unique=True)

    def __str__(self):
        return self.login

    class Meta:
        managed = True
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
