from django.contrib import admin

# Register your models here.

# admin.py
from django.contrib import admin
from .models import ManualPaymentRequest, Subscription

@admin.register(ManualPaymentRequest)
class ManualPaymentRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "plan", "amount", "status", "created_at")
    list_filter = ("status", "plan", "created_at")
    actions = ["approve_requests", "reject_requests"]
    readonly_fields = ("created_at", "processed_at", "processed_by")

    def approve_requests(self, request, queryset):
        for q in queryset:
            q.mark_approved(admin_user=request.user)
            # grant subscription
            sub, _ = Subscription.objects.get_or_create(user=q.user)
            sub.grant_plan(q.plan)
        self.message_user(request, f"Approved {queryset.count()} requests.")
    approve_requests.short_description = "Approve selected requests and grant subscription"

    def reject_requests(self, request, queryset):
        for q in queryset:
            q.mark_rejected(admin_user=request.user, note="Rejected via admin panel")
        self.message_user(request, f"Rejected {queryset.count()} requests.")
    reject_requests.short_description = "Reject selected requests"

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("user", "plan", "active", "remaining_predictions", "allowed_predictions", "start_date")
    search_fields = ("user__username", "plan")
