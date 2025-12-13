"""
Redeem URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RedeemTransactionViewSet

router = DefaultRouter()
router.register(r'', RedeemTransactionViewSet, basename='redeem')

urlpatterns = [
    path('', include(router.urls)),
]
