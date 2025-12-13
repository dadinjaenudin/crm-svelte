"""
Vouchers models
"""
from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone


class Voucher(models.Model):
    """
    Voucher model for rewards
    """
    TYPE_CHOICES = [
        ('discount', 'Discount'),
        ('cashback', 'Cashback'),
        ('freebie', 'Freebie'),
    ]
    
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Expired', 'Expired'),
    ]
    
    code = models.CharField(
        max_length=50,
        unique=True,
        help_text='Unique voucher code'
    )
    
    name = models.CharField(
        max_length=255,
        help_text='Voucher name'
    )
    
    description = models.TextField(
        blank=True,
        default='',
        help_text='Detailed description of the voucher'
    )
    
    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default='discount',
        help_text='Type of voucher'
    )
    
    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text='Discount value (percentage or amount)'
    )
    
    points_cost = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text='Points required to redeem this voucher'
    )
    
    stock = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text='Available stock'
    )
    
    start_date = models.DateField(help_text='Voucher validity start date')
    
    end_date = models.DateField(help_text='Voucher validity end date')
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Active',
        help_text='Voucher status'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vouchers'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['status']),
            models.Index(fields=['start_date', 'end_date']),
            models.Index(fields=['points_cost']),
        ]
        verbose_name = 'Voucher'
        verbose_name_plural = 'Vouchers'
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    def save(self, *args, **kwargs):
        """Auto-update status based on dates"""
        today = timezone.now().date()
        
        if self.end_date < today:
            self.status = 'Expired'
        elif self.start_date > today:
            self.status = 'Inactive'
        
        super().save(*args, **kwargs)
    
    @property
    def is_available(self):
        """Check if voucher is available for redemption"""
        today = timezone.now().date()
        return (
            self.status == 'Active' and
            self.stock > 0 and
            self.start_date <= today <= self.end_date
        )
    
    @property
    def days_until_expiry(self):
        """Calculate days until voucher expires"""
        today = timezone.now().date()
        if self.end_date < today:
            return 0
        return (self.end_date - today).days
