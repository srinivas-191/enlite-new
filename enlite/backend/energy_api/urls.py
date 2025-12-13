from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

from .views import (
    # Basic model endpoints
    get_building_types,
    get_defaults,
    predict_energy,

    # Auth
    register_user,
    login_user,

    # User profile
    get_profile,
    update_user,

    # User history
    get_my_history,
    delete_all_history,
    delete_history_item,

    # Subscription & payment
    manual_payment_request,
    my_manual_requests,
    my_subscription,

    # Admin endpoints
    admin_all_history,
    admin_list_users,
    admin_user_history,
    admin_list_manual_requests,
    admin_approve_manual_request,
    admin_reject_manual_request,

    # Plans
    get_plans,
)

urlpatterns = [
    # Model
    path("building-types/", get_building_types),
    path("defaults/", get_defaults),
    path("predict/", predict_energy),

    # Auth
    path("register/", register_user),
    path("login/", login_user),

    # Profile
    path("profile/", get_profile),
    path("user/update/", update_user),

    # User history
    path("history/", get_my_history),
    path("history/delete-all/", delete_all_history),
    path("history/delete/<int:pk>/", delete_history_item),

    # Payment + Subscription
    path("manual-payment-request/", manual_payment_request),
    path("manual-requests/my/", my_manual_requests),
    path("subscription/", my_subscription),

    # Admin
    path("admin/users/", admin_list_users),
    path("admin/user-history/<str:username>/", admin_user_history),
    path("admin/history/", admin_all_history),

    # Admin payment approvals
    path("admin/manual-requests/", admin_list_manual_requests),
    path("admin/manual-requests/<int:pk>/approve/", admin_approve_manual_request),
    path("admin/manual-requests/<int:pk>/reject/", admin_reject_manual_request),
    # Add this new line:
    path('admin/manual-requests/<int:pk>/delete/', views.admin_delete_manual_request),

    # Plans
    path("plans/", get_plans),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
