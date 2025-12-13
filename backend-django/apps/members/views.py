"""
Members views
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Sum
from django_filters import rest_framework as filters

from .models import Member
from .serializers import MemberSerializer, MemberListSerializer, MemberStatisticsSerializer


class MemberFilter(filters.FilterSet):
    """Filter for members"""
    search = filters.CharFilter(method='filter_search')
    tier_level = filters.ChoiceFilter(choices=Member.TIER_CHOICES)
    status = filters.ChoiceFilter(choices=Member.STATUS_CHOICES)
    min_points = filters.NumberFilter(field_name='total_points', lookup_expr='gte')
    max_points = filters.NumberFilter(field_name='total_points', lookup_expr='lte')
    
    class Meta:
        model = Member
        fields = ['tier_level', 'status', 'search', 'min_points', 'max_points']
    
    def filter_search(self, queryset, name, value):
        """Search across multiple fields"""
        return queryset.filter(
            Q(id__icontains=value) |
            Q(name__icontains=value) |
            Q(email__icontains=value) |
            Q(phone__icontains=value)
        )


class MemberViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Member CRUD operations
    """
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = MemberFilter
    
    def get_serializer_class(self):
        """Use different serializer for list view"""
        if self.action == 'list':
            return MemberListSerializer
        return MemberSerializer
    
    def list(self, request, *args, **kwargs):
        """List all members with filters"""
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
        """Create new member"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response({
            'success': True,
            'message': 'Member created successfully',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, *args, **kwargs):
        """Get member detail"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        """Update member"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'message': 'Member updated successfully',
            'data': serializer.data
        })
    
    def destroy(self, request, *args, **kwargs):
        """Delete member"""
        instance = self.get_object()
        self.perform_destroy(instance)
        
        return Response({
            'success': True,
            'message': 'Member deleted successfully'
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get member statistics"""
        members = Member.objects.all()
        
        stats = {
            'total_members': members.count(),
            'active_members': members.filter(status='Active').count(),
            'inactive_members': members.filter(status='Inactive').count(),
            'by_tier': dict(
                members.values('tier_level').annotate(count=Count('id')).values_list('tier_level', 'count')
            ),
            'total_points': members.aggregate(total=Sum('total_points'))['total'] or 0
        }
        
        serializer = MemberStatisticsSerializer(stats)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
