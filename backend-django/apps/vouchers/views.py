"""
Vouchers views
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Sum
from django_filters import rest_framework as filters

from .models import Voucher
from .serializers import VoucherSerializer, VoucherListSerializer, VoucherStatisticsSerializer


class VoucherFilter(filters.FilterSet):
    """Filter for vouchers"""
    search = filters.CharFilter(method='filter_search')
    type = filters.ChoiceFilter(choices=Voucher.TYPE_CHOICES)
    status = filters.ChoiceFilter(choices=Voucher.STATUS_CHOICES)
    min_points = filters.NumberFilter(field_name='points_cost', lookup_expr='gte')
    max_points = filters.NumberFilter(field_name='points_cost', lookup_expr='lte')
    
    class Meta:
        model = Voucher
        fields = ['type', 'status', 'search', 'min_points', 'max_points']
    
    def filter_search(self, queryset, name, value):
        """Search across multiple fields"""
        return queryset.filter(
            Q(code__icontains=value) |
            Q(name__icontains=value) |
            Q(description__icontains=value)
        )


class VoucherViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Voucher CRUD operations
    """
    queryset = Voucher.objects.all()
    serializer_class = VoucherSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = VoucherFilter
    
    def get_serializer_class(self):
        """Use different serializer for list view"""
        if self.action == 'list':
            return VoucherListSerializer
        return VoucherSerializer
    
    def list(self, request, *args, **kwargs):
        """List all vouchers with filters"""
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
        """Create new voucher"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response({
            'success': True,
            'message': 'Voucher created successfully',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, *args, **kwargs):
        """Get voucher detail"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        """Update voucher"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'message': 'Voucher updated successfully',
            'data': serializer.data
        })
    
    def destroy(self, request, *args, **kwargs):
        """Delete voucher"""
        instance = self.get_object()
        self.perform_destroy(instance)
        
        return Response({
            'success': True,
            'message': 'Voucher deleted successfully'
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get voucher statistics"""
        vouchers = Voucher.objects.all()
        
        stats = {
            'total_vouchers': vouchers.count(),
            'active_vouchers': vouchers.filter(status='Active').count(),
            'total_stock': vouchers.aggregate(total=Sum('stock'))['total'] or 0,
            'by_type': dict(
                vouchers.values('type').annotate(count=Count('id')).values_list('type', 'count')
            )
        }
        
        serializer = VoucherStatisticsSerializer(stats)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
