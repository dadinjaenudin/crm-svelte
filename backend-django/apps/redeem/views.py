"""
Redeem views
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Sum
from django.utils import timezone
from django_filters import rest_framework as filters

from .models import RedeemTransaction
from .serializers import (
    RedeemTransactionSerializer,
    RedeemTransactionListSerializer,
    RedeemStatisticsSerializer
)


class RedeemTransactionFilter(filters.FilterSet):
    """Filter for redeem transactions"""
    member = filters.CharFilter(field_name='member__id')
    voucher = filters.NumberFilter(field_name='voucher__id')
    status = filters.ChoiceFilter(choices=RedeemTransaction.STATUS_CHOICES)
    date_from = filters.DateTimeFilter(field_name='redeem_date', lookup_expr='gte')
    date_to = filters.DateTimeFilter(field_name='redeem_date', lookup_expr='lte')
    
    class Meta:
        model = RedeemTransaction
        fields = ['member', 'voucher', 'status', 'date_from', 'date_to']


class RedeemTransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Redeem Transaction CRUD operations
    """
    queryset = RedeemTransaction.objects.select_related('member', 'voucher').all()
    serializer_class = RedeemTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = RedeemTransactionFilter
    
    def get_serializer_class(self):
        """Use different serializer for list view"""
        if self.action == 'list':
            return RedeemTransactionListSerializer
        return RedeemTransactionSerializer
    
    def list(self, request, *args, **kwargs):
        """List all redeem transactions with filters"""
        queryset = self.filter_queryset(self.get_queryset())
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'count': queryset.count()
        })
    
    def create(self, request, *args, **kwargs):
        """Create new redeem transaction"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response({
            'success': True,
            'message': 'Redemption successful',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, *args, **kwargs):
        """Get redeem transaction detail"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        """Update redeem transaction status"""
        instance = self.get_object()
        new_status = request.data.get('status')
        
        if new_status == 'Used' and not instance.used_date:
            instance.used_date = timezone.now()
        
        instance.status = new_status
        instance.save()
        
        serializer = self.get_serializer(instance)
        
        return Response({
            'success': True,
            'message': 'Redeem status updated successfully',
            'data': serializer.data
        })
    
    @action(detail=True, methods=['post'], url_path='mark-used')
    def mark_used(self, request, pk=None):
        """Mark redemption as used"""
        instance = self.get_object()
        instance.status = 'Used'
        instance.used_date = timezone.now()
        instance.save()
        
        serializer = self.get_serializer(instance)
        
        return Response({
            'success': True,
            'message': 'Redemption marked as used',
            'data': serializer.data
        })
    
    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        """Cancel redemption"""
        instance = self.get_object()
        
        if instance.status not in ['Pending', 'Completed']:
            return Response({
                'success': False,
                'message': 'Cannot cancel this redemption'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Refund points and stock
        instance.member.total_points += instance.points_cost
        instance.member.save()
        
        instance.voucher.stock += 1
        instance.voucher.save()
        
        instance.status = 'Cancelled'
        instance.save()
        
        serializer = self.get_serializer(instance)
        
        return Response({
            'success': True,
            'message': 'Redemption cancelled successfully',
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get redeem transaction statistics"""
        transactions = RedeemTransaction.objects.all()
        
        # Filter by member if provided
        member_id = request.query_params.get('member')
        if member_id:
            transactions = transactions.filter(member__id=member_id)
        
        stats = {
            'total_redeems': transactions.count(),
            'pending_redeems': transactions.filter(status='Pending').count(),
            'completed_redeems': transactions.filter(status='Completed').count(),
            'used_redeems': transactions.filter(status='Used').count(),
            'cancelled_redeems': transactions.filter(status='Cancelled').count(),
            'total_points_redeemed': transactions.exclude(status='Cancelled').aggregate(
                total=Sum('points_cost'))['total'] or 0
        }
        
        serializer = RedeemStatisticsSerializer(stats)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
