from django.core.management.base import BaseCommand
from django.db import connections, transaction, IntegrityError
from api.models import RevenueEst2025 
from django.apps import apps
import pandas as pd
import logging
import time
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Update db with reject parallel executions"

    LOCK_KEY = 123456
    LOCK_NAME = "update_db"

    def handle(self, *args, **kwargs):
        db_alias = "fin" 
        year = datetime.now().year
        # month = datetime.now().month
        month = 9
        engine = connections[db_alias].settings_dict["ENGINE"]

        if "postgresql" in engine:
            got_lock = self._pg_try_lock(db_alias)
        else:
            got_lock = self._sqlite_try_lock(db_alias)

        if not got_lock:
            self.stdout.write(self.style.WARNING("Task is already running. Quit"))
            return

        self.stdout.write("Db blocked, update starting...")
        try:
            with transaction.atomic(using=db_alias):
                update_data = [] 
                qs = RevenueEst2025.objects.filter(estimate_date__month=month-1, date_dt__month__gte=month, 
                                                   estimate_date__year=year).using('fin')
                for rec in qs:
                    update_data.append(RevenueEst2025(company=rec.company, date_dt=rec.date_dt,
                                   estimate_date=rec.estimate_date + relativedelta(months=1),
                                   frc=rec.frc,
                                   est_amount=rec.est_amount,
                                   hcl_amount=rec.hcl_amount,
                                   contr_amount=rec.contr_amount)
                                       )
                RevenueEst2025.objects.bulk_create(update_data)
                self.stdout.write(self.style.SUCCESS("Db updated succesfully"))
                logger.info("Db updating done")
        except Exception as e:
            logger.error(f"Updating error: {e}", exc_info=True)
            self.stderr.write(self.style.ERROR(f"Error: {e}"))
        finally:
            if "postgresql" in engine:
                self._pg_unlock(db_alias)
            else:
                self._sqlite_unlock(db_alias)

    # ---------- PostgreSQL advisory lock ----------
    def _pg_try_lock(self, db_alias):
        with connections[db_alias].cursor() as cursor:
            cursor.execute("SELECT pg_try_advisory_lock(%s);", [self.LOCK_KEY])
            return cursor.fetchone()[0]

    def _pg_unlock(self, db_alias):
        with connections[db_alias].cursor() as cursor:
            cursor.execute("SELECT pg_advisory_unlock(%s);", [self.LOCK_KEY])

    # ---------- SQLite fallback ----------
    def _sqlite_try_lock(self, db_alias):
        TaskLock = apps.get_model("myapp", "TaskLock")
        try:
            with transaction.atomic(using=db_alias):
                TaskLock.objects.using(db_alias).create(name=self.LOCK_NAME)
                return True
        except IntegrityError:
            return False

    def _sqlite_unlock(self, db_alias):
        TaskLock = apps.get_model("myapp", "TaskLock")
        TaskLock.objects.using(db_alias).filter(name=self.LOCK_NAME).delete()

