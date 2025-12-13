from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("energy_api.urls")),
]
if settings.DEBUG:
    # Ensure all three variables are correctly passed
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)