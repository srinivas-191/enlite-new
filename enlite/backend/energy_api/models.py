from django.db import models
from django.contrib.auth.models import User

class PredictionHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    building_type = models.CharField(max_length=200)
    total_energy_month_kwh = models.FloatField()
    eui_month_kwh_m2 = models.FloatField(null=True)
    performance_category = models.CharField(max_length=200)
    inputs = models.JSONField()  # full input data from frontend
    is_deleted_by_user = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.building_type}"

# app/models.py  (append to your existing models)
from django.conf import settings
from django.db import models
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class Subscription(models.Model):
    PLAN_CHOICES = [
        ("free", "Free"),
        ("basic", "Basic"),
        ("super", "Super"),
        ("premium", "Premium"),
    ]

    plan = models.CharField(max_length=30, choices=PLAN_CHOICES, default="free")
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="subscription")
    allowed_predictions = models.IntegerField(default=10)
    remaining_predictions = models.IntegerField(default=10)
    active = models.BooleanField(default=False)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def grant_plan(self, plan_name):
        """Set fields according to plan_name (prediction-count plan)."""
        mapping = {
            "basic": 100,
            "super": 300,
            "premium": 500,
        }
        allowed = mapping.get(plan_name.lower(), 10)
        self.plan = plan_name.lower()
        self.allowed_predictions = allowed
        # keep previous used if exists; compute remaining as allowed - used
        # but for simplicity we'll reset remaining to allowed
        self.remaining_predictions = allowed
        self.active = True
        self.start_date = timezone.now()
        # For prediction-count plans we won't set end_date; you can set expiry if desired
        self.end_date = None
        self.save()

    def consume_prediction(self, n=1):
        if self.remaining_predictions is None:
            return
        self.remaining_predictions = max(0, self.remaining_predictions - n)
        self.save()

    def __str__(self):
        return f"{self.user.username} - {self.plan} ({self.remaining_predictions}/{self.allowed_predictions})"


class ManualPaymentRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="manual_requests"
    )

    plan = models.CharField(max_length=64)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # NEW FIELDS (required)
    bank_name = models.CharField(max_length=255, blank=True, null=True)
    txn_id = models.CharField(max_length=255, blank=True, null=True)

    # old txn_ref kept for backward compatibility
    txn_ref = models.CharField(max_length=200, blank=True)

    notes = models.TextField(blank=True)
    screenshot = models.ImageField(upload_to="manual_payments/", null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    admin_note = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="processed_payment_requests"
    )

    def mark_approved(self, admin_user=None):
        from django.utils import timezone
        self.status = "approved"
        self.processed_at = timezone.now()
        self.processed_by = admin_user
        self.save()

    def mark_rejected(self, admin_user=None, note=""):
        from django.utils import timezone
        self.status = "rejected"
        self.processed_at = timezone.now()
        self.processed_by = admin_user
        self.admin_note = note
        self.save()

    def __str__(self):
        return f"{self.user.username} - {self.plan} - {self.status}"
