"""
Vouchers serializers
"""
from rest_framework import serializers
from .models import Voucher


class VoucherSerializer(serializers.ModelSerializer):
    """Voucher serializer"""
    is_available = serializers.ReadOnlyField()
    days_until_expiry = serializers.ReadOnlyField()
    
    class Meta:
        model = Voucher
        fields = [
            'id', 'code', 'name', 'description', 'type',
            'discount_value', 'points_cost', 'stock',
            'start_date', 'end_date', 'status',
            'is_available', 'days_until_expiry',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_code(self, value):
        """Validate code uniqueness on update"""
        instance = self.instance
        if instance and Voucher.objects.exclude(pk=instance.pk).filter(code=value).exists():
            raise serializers.ValidationError("Voucher code already exists")
        elif not instance and Voucher.objects.filter(code=value).exists():
            raise serializers.ValidationError("Voucher code already exists")
        return value
    
    def validate(self, data):
        """Validate date range"""
        if 'start_date' in data and 'end_date' in data:
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError({
                    "end_date": "End date must be after start date"
                })
        return data


class VoucherListSerializer(serializers.ModelSerializer):
    """Simplified voucher serializer for list"""
    is_available = serializers.ReadOnlyField()
    
    class Meta:
        model = Voucher
        fields = [
            'id', 'code', 'name', 'type', 'points_cost',
            'stock', 'status', 'is_available', 'end_date'
        ]


class VoucherStatisticsSerializer(serializers.Serializer):
    """Voucher statistics serializer"""
    total_vouchers = serializers.IntegerField()
    active_vouchers = serializers.IntegerField()
    total_stock = serializers.IntegerField()
    by_type = serializers.DictField()
