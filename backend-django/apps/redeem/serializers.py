"""
Redeem serializers
"""
from rest_framework import serializers
from .models import RedeemTransaction
from apps.members.serializers import MemberListSerializer
from apps.vouchers.serializers import VoucherListSerializer


class RedeemTransactionSerializer(serializers.ModelSerializer):
    """Redeem transaction serializer"""
    member_name = serializers.CharField(source='member.name', read_only=True)
    member_email = serializers.EmailField(source='member.email', read_only=True)
    voucher_code = serializers.CharField(source='voucher.code', read_only=True)
    voucher_name = serializers.CharField(source='voucher.name', read_only=True)
    
    class Meta:
        model = RedeemTransaction
        fields = [
            'id', 'member', 'member_name', 'member_email',
            'voucher', 'voucher_code', 'voucher_name',
            'points_cost', 'status',
            'redeem_date', 'used_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'redeem_date', 'created_at', 'updated_at', 'points_cost']
    
    def validate(self, data):
        """Validate redemption"""
        member = data.get('member')
        voucher = data.get('voucher')
        
        if member and voucher:
            # Check member points
            if member.total_points < voucher.points_cost:
                raise serializers.ValidationError({
                    "member": "Insufficient points for redemption"
                })
            
            # Check voucher availability
            if not voucher.is_available:
                raise serializers.ValidationError({
                    "voucher": "Voucher is not available"
                })
            
            # Check stock
            if voucher.stock <= 0:
                raise serializers.ValidationError({
                    "voucher": "Voucher is out of stock"
                })
        
        return data


class RedeemTransactionListSerializer(serializers.ModelSerializer):
    """Simplified redeem transaction serializer for list"""
    member_id = serializers.CharField(source='member.id', read_only=True)
    member_name = serializers.CharField(source='member.name', read_only=True)
    voucher_code = serializers.CharField(source='voucher.code', read_only=True)
    
    class Meta:
        model = RedeemTransaction
        fields = [
            'id', 'member_id', 'member_name', 'voucher_code',
            'points_cost', 'status', 'redeem_date'
        ]


class RedeemStatisticsSerializer(serializers.Serializer):
    """Redeem statistics serializer"""
    total_redeems = serializers.IntegerField()
    pending_redeems = serializers.IntegerField()
    completed_redeems = serializers.IntegerField()
    used_redeems = serializers.IntegerField()
    cancelled_redeems = serializers.IntegerField()
    total_points_redeemed = serializers.IntegerField()
