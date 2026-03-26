import os
from celery import Celery
from celery.schedules import crontab

# Django ayarlarını Celery'ye tanıtıyoruz
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('diet_management_system')

# Ayarları 'CELERY_' önekiyle settings.py içinden okuyacak
app.config_from_object('django.conf:settings', namespace='CELERY')

# Uygulamalardaki tasks.py dosyalarını otomatik bulur
app.autodiscover_tasks()

# ZAMANLAYICI (CRON) BURADA TANIMLANIR
app.conf.beat_schedule = {
    'check-assignments-every-midnight': {
        'task': 'apps.diets.tasks.check_ended_assignments_task',
        'schedule': crontab(hour=0, minute=0),
    },
}