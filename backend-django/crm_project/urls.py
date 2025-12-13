"""
URL configuration for CRM project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({
        'success': True,
        'message': 'CRM Django API is running',
        'version': '1.0.0',
        'status': 'healthy',
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def root_view(request):
    """API root endpoint"""
    return Response({
        'message': 'Welcome to CRM API',
        'version': '1.0.0',
        'endpoints': {
            'health': '/health',
            'api': '/api',
            'admin': '/admin',
            'docs': '/api/docs',
            'schema': '/api/schema',
        },
    })

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Health check
    path('health', health_check, name='health'),
    path('', root_view, name='root'),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API endpoints
    path('api/auth/', include('apps.authentication.urls')),
    path('api/members/', include('apps.members.urls')),
    path('api/points/', include('apps.points.urls')),
    path('api/vouchers/', include('apps.vouchers.urls')),
    path('api/redeem/', include('apps.redeem.urls')),
]

# Static and media files (development)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
