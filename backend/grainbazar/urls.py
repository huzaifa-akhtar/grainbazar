"""
GrainBazar URL Configuration
Maps URL paths to views
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),              # Built-in Django admin panel
    path('api/', include('store.urls')),           # Our store API endpoints
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
