"""
Management command to seed database with sample data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, timedelta
from apps.members.models import Member
from apps.vouchers.models import Voucher
from apps.points.models import PointTransaction
from apps.redeem.models import RedeemTransaction

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed database with sample CRM data'
    
    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting database seeding...'))
        
        # Create users
        self.create_users()
        
        # Create members
        self.create_members()
        
        # Create vouchers
        self.create_vouchers()
        
        # Create point transactions
        self.create_point_transactions()
        
        # Create redeem transactions
        self.create_redeem_transactions()
        
        self.stdout.write(self.style.SUCCESS('✅ Database seeding completed successfully!'))
    
    def create_users(self):
        """Create default users"""
        self.stdout.write('Creating users...')
        
        # Admin user
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@crm.com',
                password='admin123',
                full_name='Administrator',
                role='admin'
            )
            self.stdout.write(self.style.SUCCESS('✓ Admin user created (admin/admin123)'))
        
        # Staff user
        if not User.objects.filter(username='staff1').exists():
            User.objects.create_user(
                username='staff1',
                email='staff@crm.com',
                password='staff123',
                full_name='Staff Member',
                role='staff'
            )
            self.stdout.write(self.style.SUCCESS('✓ Staff user created (staff1/staff123)'))
    
    def create_members(self):
        """Create sample members"""
        self.stdout.write('Creating members...')
        
        members_data = [
            {
                'name': 'John Doe',
                'email': 'john.doe@email.com',
                'phone': '08123456789',
                'address': 'Jl. Sudirman No. 123, Jakarta Selatan',
                'join_date': date.today() - timedelta(days=180),
                'tier_level': 'Gold',
                'status': 'Active'
            },
            {
                'name': 'Jane Smith',
                'email': 'jane.smith@email.com',
                'phone': '08198765432',
                'address': 'Jl. Asia Afrika No. 45, Bandung',
                'join_date': date.today() - timedelta(days=120),
                'tier_level': 'Silver',
                'status': 'Active'
            },
            {
                'name': 'Bob Johnson',
                'email': 'bob.johnson@email.com',
                'phone': '08111222333',
                'address': 'Jl. Tunjungan No. 78, Surabaya',
                'join_date': date.today() - timedelta(days=60),
                'tier_level': 'Platinum',
                'status': 'Active'
            },
            {
                'name': 'Alice Brown',
                'email': 'alice.brown@email.com',
                'phone': '08122334455',
                'address': 'Jl. Gatot Subroto No. 90, Jakarta Pusat',
                'join_date': date.today() - timedelta(days=30),
                'tier_level': 'Bronze',
                'status': 'Active'
            },
            {
                'name': 'Charlie Wilson',
                'email': 'charlie.wilson@email.com',
                'phone': '08133445566',
                'address': 'Jl. Diponegoro No. 234, Yogyakarta',
                'join_date': date.today() - timedelta(days=200),
                'tier_level': 'Silver',
                'status': 'Inactive'
            }
        ]
        
        for data in members_data:
            member, created = Member.objects.get_or_create(
                email=data['email'],
                defaults=data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Member created: {member.name}'))
    
    def create_vouchers(self):
        """Create sample vouchers"""
        self.stdout.write('Creating vouchers...')
        
        today = date.today()
        vouchers_data = [
            {
                'code': 'DISC50',
                'name': 'Diskon 50%',
                'description': 'Diskon 50% untuk pembelian minimum Rp 100.000',
                'type': 'discount',
                'discount_value': 50.00,
                'points_cost': 500,
                'stock': 100,
                'start_date': today,
                'end_date': today + timedelta(days=90),
                'status': 'Active'
            },
            {
                'code': 'CASH100K',
                'name': 'Cashback Rp 100.000',
                'description': 'Cashback Rp 100.000 untuk pembelian minimum Rp 500.000',
                'type': 'cashback',
                'discount_value': 100000.00,
                'points_cost': 1000,
                'stock': 50,
                'start_date': today,
                'end_date': today + timedelta(days=60),
                'status': 'Active'
            },
            {
                'code': 'FREEGIFT',
                'name': 'Free Gift Special',
                'description': 'Gratis 1 produk pilihan untuk member setia',
                'type': 'freebie',
                'discount_value': 0,
                'points_cost': 750,
                'stock': 30,
                'start_date': today,
                'end_date': today + timedelta(days=30),
                'status': 'Active'
            },
            {
                'code': 'DISC25',
                'name': 'Diskon 25%',
                'description': 'Diskon 25% untuk semua produk',
                'type': 'discount',
                'discount_value': 25.00,
                'points_cost': 250,
                'stock': 200,
                'start_date': today,
                'end_date': today + timedelta(days=120),
                'status': 'Active'
            },
            {
                'code': 'BIRTHDAY50',
                'name': 'Birthday Special 50%',
                'description': 'Voucher spesial ulang tahun - Diskon 50%',
                'type': 'discount',
                'discount_value': 50.00,
                'points_cost': 300,
                'stock': 75,
                'start_date': today,
                'end_date': today + timedelta(days=180),
                'status': 'Active'
            }
        ]
        
        for data in vouchers_data:
            voucher, created = Voucher.objects.get_or_create(
                code=data['code'],
                defaults=data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Voucher created: {voucher.code}'))
    
    def create_point_transactions(self):
        """Create sample point transactions"""
        self.stdout.write('Creating point transactions...')
        
        members = Member.objects.filter(status='Active')
        
        for member in members:
            # Earn points transactions
            PointTransaction.objects.create(
                member=member,
                transaction_type='earn',
                points=500,
                description=f'Welcome bonus for {member.name}',
                created_by='admin'
            )
            
            PointTransaction.objects.create(
                member=member,
                transaction_type='earn',
                points=300,
                description='Purchase bonus',
                created_by='staff1'
            )
            
            self.stdout.write(self.style.SUCCESS(f'✓ Point transactions created for {member.name}'))
    
    def create_redeem_transactions(self):
        """Create sample redeem transactions"""
        self.stdout.write('Creating redeem transactions...')
        
        try:
            member = Member.objects.filter(status='Active').first()
            voucher = Voucher.objects.filter(status='Active', stock__gt=0).first()
            
            if member and voucher:
                RedeemTransaction.objects.create(
                    member=member,
                    voucher=voucher,
                    status='Completed'
                )
                self.stdout.write(self.style.SUCCESS(f'✓ Redeem transaction created for {member.name}'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'⚠ Could not create redeem transaction: {e}'))
