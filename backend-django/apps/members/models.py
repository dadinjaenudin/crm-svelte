"""
Members models
"""
from django.db import models
from django.core.validators import EmailValidator, RegexValidator


class Member(models.Model):
    """
    CRM Member model
    """
    TIER_CHOICES = [
        ('Bronze', 'Bronze'),
        ('Silver', 'Silver'),
        ('Gold', 'Gold'),
        ('Platinum', 'Platinum'),
    ]
    
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    ]
    
    # Custom ID format (MEM-001, MEM-002, etc.)
    id = models.CharField(
        max_length=50,
        primary_key=True,
        editable=False,
        help_text='Auto-generated member ID'
    )
    
    name = models.CharField(max_length=255, help_text='Full name of the member')
    
    email = models.EmailField(
        unique=True,
        validators=[EmailValidator()],
        help_text='Email address (must be unique)'
    )
    
    phone = models.CharField(
        max_length=50,
        validators=[
            RegexValidator(
                regex=r'^[\d\s\+\-\(\)]+$',
                message='Phone number must contain only digits, spaces, +, -, (, )'
            )
        ],
        help_text='Phone number'
    )
    
    address = models.TextField(blank=True, default='', help_text='Full address')
    
    join_date = models.DateField(help_text='Date when member joined')
    
    total_points = models.IntegerField(
        default=0,
        help_text='Total accumulated points'
    )
    
    tier_level = models.CharField(
        max_length=20,
        choices=TIER_CHOICES,
        default='Bronze',
        help_text='Membership tier level'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Active',
        help_text='Member status'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'members'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone']),
            models.Index(fields=['tier_level']),
            models.Index(fields=['status']),
            models.Index(fields=['join_date']),
            models.Index(fields=['-total_points']),
        ]
        verbose_name = 'Member'
        verbose_name_plural = 'Members'
    
    def __str__(self):
        return f"{self.id} - {self.name}"
    
    def save(self, *args, **kwargs):
        """Generate custom ID if not exists"""
        if not self.id:
            # Get last member ID and increment
            last_member = Member.objects.all().order_by('id').last()
            if last_member:
                # Extract number from last ID (MEM-001 -> 001)
                last_number = int(last_member.id.split('-')[1])
                new_number = last_number + 1
            else:
                new_number = 1
            
            # Format: MEM-001, MEM-002, etc.
            self.id = f'MEM-{new_number:03d}'
        
        super().save(*args, **kwargs)
    
    @property
    def points_to_next_tier(self):
        """Calculate points needed for next tier"""
        tier_thresholds = {
            'Bronze': 500,
            'Silver': 1000,
            'Gold': 2500,
            'Platinum': float('inf')
        }
        
        if self.tier_level == 'Platinum':
            return 0
        
        current_threshold = tier_thresholds.get(self.tier_level, 0)
        return max(0, current_threshold - self.total_points)
