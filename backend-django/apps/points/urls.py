"""
Points URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PointTransactionViewSet

router = DefaultRouter()
router.register(r'', PointTransactionViewSet, basename='point')

urlpatterns = [
    path('', include(router.urls)),
]
