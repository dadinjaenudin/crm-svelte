"""
Points views
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum
from django_filters import rest_framework as filters

from .models import PointTransaction
from .serializers import (
    PointTransactionSerializer,
    PointTransactionListSerializer,
    PointStatisticsSerializer
)


class PointTransactionFilter(filters.FilterSet):
    """Filter for point transactions"""
    member = filters.CharFilter(field_name='member__id')
    transaction_type = filters.ChoiceFilter(choices=PointTransaction.TRANSACTION_TYPE_CHOICES)
    date_from = filters.DateTimeFilter(field_name='transaction_date', lookup_expr='gte')
    date_to = filters.DateTimeFilter(field_name='transaction_date', lookup_expr='lte')
    
    class Meta:
        model = PointTransaction
        fields = ['member', 'transaction_type', 'date_from', 'date_to']


class PointTransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Point Transaction CRUD operations
    """
    queryset = PointTransaction.objects.select_related('member').all()
    serializer_class = PointTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = PointTransactionFilter
    
    def get_serializer_class(self):
        """Use different serializer for list view"""
        if self.action == 'list':
            return PointTransactionListSerializer
        return PointTransactionSerializer
    
    def list(self, request, *args, **kwargs):
        """List all point transactions with filters"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Pagination
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
        """Create new point transaction"""
        # Add created_by from authenticated user
        data = request.data.copy()
        data['created_by'] = request.user.username
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response({
            'success': True,
            'message': 'Point transaction created successfully',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, *args, **kwargs):
        """Get point transaction detail"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get point transaction statistics"""
        transactions = PointTransaction.objects.all()
        
        # Filter by member if provided
        member_id = request.query_params.get('member')
        if member_id:
            transactions = transactions.filter(member__id=member_id)
        
        stats = {
            'total_earned': transactions.filter(transaction_type='earn').aggregate(
                total=Sum('points'))['total'] or 0,
            'total_redeemed': abs(transactions.filter(transaction_type='redeem').aggregate(
                total=Sum('points'))['total'] or 0),
            'total_expired': abs(transactions.filter(transaction_type='expire').aggregate(
                total=Sum('points'))['total'] or 0),
            'total_adjusted': transactions.filter(transaction_type='adjustment').aggregate(
                total=Sum('points'))['total'] or 0,
            'net_points': transactions.aggregate(total=Sum('points'))['total'] or 0,
            'total_transactions': transactions.count()
        }
        
        serializer = PointStatisticsSerializer(stats)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'], url_path='member/(?P<member_id>[^/.]+)')
    def member_transactions(self, request, member_id=None):
        """Get all transactions for a specific member"""
        transactions = self.get_queryset().filter(member__id=member_id)
        serializer = self.get_serializer(transactions, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': transactions.count()
        })
