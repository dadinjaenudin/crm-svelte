"""
Redeem transaction models
"""
from django.db import models
from django.core.exceptions import ValidationError
from apps.members.models import Member
from apps.vouchers.models import Voucher


class RedeemTransaction(models.Model):
    """
    Redeem transaction model
    """
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
        ('Used', 'Used'),
    ]
    
    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='redeem_transactions',
        help_text='Member who redeemed the voucher'
    )
    
    voucher = models.ForeignKey(
        Voucher,
        on_delete=models.CASCADE,
        related_name='redeem_transactions',
        help_text='Voucher being redeemed'
    )
    
    points_cost = models.IntegerField(help_text='Points used for this redemption')
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Pending',
        help_text='Status of redemption'
    )
    
    redeem_date = models.DateTimeField(
        auto_now_add=True,
        help_text='Date and time of redemption'
    )
    
    used_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Date and time when voucher was used'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'redeem_transactions'
        ordering = ['-redeem_date']
        indexes = [
            models.Index(fields=['member']),
            models.Index(fields=['voucher']),
            models.Index(fields=['status']),
            models.Index(fields=['-redeem_date']),
        ]
        verbose_name = 'Redeem Transaction'
        verbose_name_plural = 'Redeem Transactions'
    
    def __str__(self):
        return f"{self.member.id} - {self.voucher.code} - {self.status}"
    
    def clean(self):
        """Validate redemption"""
        if hasattr(self, 'member') and hasattr(self, 'voucher'):
            # Check if member has enough points
            if self.member.total_points < self.voucher.points_cost:
                raise ValidationError("Insufficient points for redemption")
            
            # Check if voucher is available
            if not self.voucher.is_available:
                raise ValidationError("Voucher is not available for redemption")
            
            # Check voucher stock
            if self.voucher.stock <= 0:
                raise ValidationError("Voucher is out of stock")
    
    def save(self, *args, **kwargs):
        """Save and update related records"""
        self.clean()
        
        is_new = self.pk is None
        
        # Set points_cost from voucher if not set
        if not self.points_cost:
            self.points_cost = self.voucher.points_cost
        
        # Save the transaction first
        super().save(*args, **kwargs)
        
        # Update member points and voucher stock only for new transactions
        if is_new and self.status in ['Completed', 'Pending']:
            # Deduct points from member
            self.member.total_points -= self.points_cost
            self.member.save()
            
            # Decrease voucher stock
            self.voucher.stock -= 1
            self.voucher.save()
