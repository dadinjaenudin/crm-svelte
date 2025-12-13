"""
Points transaction models
"""
from django.db import models
from django.core.exceptions import ValidationError
from apps.members.models import Member


class PointTransaction(models.Model):
    """
    Point transaction model
    """
    TRANSACTION_TYPE_CHOICES = [
        ('earn', 'Earn'),
        ('redeem', 'Redeem'),
        ('expire', 'Expire'),
        ('adjustment', 'Adjustment'),
    ]
    
    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='point_transactions',
        help_text='Member associated with this transaction'
    )
    
    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_TYPE_CHOICES,
        help_text='Type of point transaction'
    )
    
    points = models.IntegerField(help_text='Number of points (positive or negative)')
    
    description = models.TextField(
        blank=True,
        default='',
        help_text='Description of the transaction'
    )
    
    transaction_date = models.DateTimeField(
        auto_now_add=True,
        help_text='Date and time of transaction'
    )
    
    created_by = models.CharField(
        max_length=50,
        blank=True,
        default='',
        help_text='Username of who created this transaction'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'point_transactions'
        ordering = ['-transaction_date']
        indexes = [
            models.Index(fields=['member']),
            models.Index(fields=['transaction_type']),
            models.Index(fields=['-transaction_date']),
        ]
        verbose_name = 'Point Transaction'
        verbose_name_plural = 'Point Transactions'
    
    def __str__(self):
        return f"{self.member.id} - {self.transaction_type} - {self.points} pts"
    
    def clean(self):
        """Validate transaction"""
        if self.transaction_type == 'redeem' and self.points > 0:
            raise ValidationError("Redeem transactions must have negative points")
        elif self.transaction_type == 'earn' and self.points < 0:
            raise ValidationError("Earn transactions must have positive points")
    
    def save(self, *args, **kwargs):
        """Save and update member points"""
        self.clean()
        
        is_new = self.pk is None
        
        # Save the transaction first
        super().save(*args, **kwargs)
        
        # Update member points only for new transactions
        if is_new:
            self.member.total_points += self.points
            
            # Ensure points don't go negative
            if self.member.total_points < 0:
                self.member.total_points = 0
            
            # Update tier based on points
            self.update_member_tier()
            
            self.member.save()
    
    def update_member_tier(self):
        """Update member tier based on total points"""
        points = self.member.total_points
        
        if points >= 2500:
            self.member.tier_level = 'Platinum'
        elif points >= 1000:
            self.member.tier_level = 'Gold'
        elif points >= 500:
            self.member.tier_level = 'Silver'
        else:
            self.member.tier_level = 'Bronze'
