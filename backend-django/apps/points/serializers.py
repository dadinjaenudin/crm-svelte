"""
Points serializers
"""
from rest_framework import serializers
from .models import PointTransaction
from apps.members.serializers import MemberListSerializer


class PointTransactionSerializer(serializers.ModelSerializer):
    """Point transaction serializer"""
    member_name = serializers.CharField(source='member.name', read_only=True)
    member_email = serializers.EmailField(source='member.email', read_only=True)
    
    class Meta:
        model = PointTransaction
        fields = [
            'id', 'member', 'member_name', 'member_email',
            'transaction_type', 'points', 'description',
            'transaction_date', 'created_by', 'created_at'
        ]
        read_only_fields = ['id', 'transaction_date', 'created_at']
    
    def validate(self, data):
        """Validate transaction"""
        transaction_type = data.get('transaction_type')
        points = data.get('points')
        
        if transaction_type == 'redeem' and points > 0:
            data['points'] = -abs(points)  # Auto convert to negative
        elif transaction_type == 'earn' and points < 0:
            data['points'] = abs(points)  # Auto convert to positive
        
        return data


class PointTransactionListSerializer(serializers.ModelSerializer):
    """Simplified point transaction serializer for list"""
    member_id = serializers.CharField(source='member.id', read_only=True)
    member_name = serializers.CharField(source='member.name', read_only=True)
    
    class Meta:
        model = PointTransaction
        fields = [
            'id', 'member_id', 'member_name', 'transaction_type',
            'points', 'description', 'transaction_date'
        ]


class PointStatisticsSerializer(serializers.Serializer):
    """Point statistics serializer"""
    total_earned = serializers.IntegerField()
    total_redeemed = serializers.IntegerField()
    total_expired = serializers.IntegerField()
    total_adjusted = serializers.IntegerField()
    net_points = serializers.IntegerField()
    total_transactions = serializers.IntegerField()
