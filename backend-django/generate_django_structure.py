#!/usr/bin/env python3
"""
Django CRM Backend Structure Generator
This script creates the complete Django project structure
"""

import os
import sys

# Base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Directory structure
STRUCTURE = {
    'crm_backend': {
        '__init__.py': '',
        'settings.py': 'SETTINGS_CONTENT',
        'urls.py': 'URLS_CONTENT',
        'wsgi.py': 'WSGI_CONTENT',
        'asgi.py': 'ASGI_CONTENT',
    },
    'apps': {
        '__init__.py': '',
        'members': {
            '__init__.py': '',
            'models.py': 'MEMBER_MODELS',
            'serializers.py': 'MEMBER_SERIALIZERS',
            'views.py': 'MEMBER_VIEWS',
            'urls.py': 'MEMBER_URLS',
            'admin.py': 'MEMBER_ADMIN',
            'tests.py': '',
            'migrations': {
                '__init__.py': '',
            }
        },
        'points': {
            '__init__.py': '',
            'models.py': 'POINT_MODELS',
            'serializers.py': 'POINT_SERIALIZERS',
            'views.py': 'POINT_VIEWS',
            'urls.py': 'POINT_URLS',
            'admin.py': 'POINT_ADMIN',
            'tests.py': '',
            'migrations': {
                '__init__.py': '',
            }
        },
        'vouchers': {
            '__init__.py': '',
            'models.py': 'VOUCHER_MODELS',
            'serializers.py': 'VOUCHER_SERIALIZERS',
            'views.py': 'VOUCHER_VIEWS',
            'urls.py': 'VOUCHER_URLS',
            'admin.py': 'VOUCHER_ADMIN',
            'tests.py': '',
            'migrations': {
                '__init__.py': '',
            }
        },
        'redeem': {
            '__init__.py': '',
            'models.py': 'REDEEM_MODELS',
            'serializers.py': 'REDEEM_SERIALIZERS',
            'views.py': 'REDEEM_VIEWS',
            'urls.py': 'REDEEM_URLS',
            'admin.py': 'REDEEM_ADMIN',
            'tests.py': '',
            'migrations': {
                '__init__.py': '',
            }
        },
        'authentication': {
            '__init__.py': '',
            'models.py': 'AUTH_MODELS',
            'serializers.py': 'AUTH_SERIALIZERS',
            'views.py': 'AUTH_VIEWS',
            'urls.py': 'AUTH_URLS',
            'admin.py': 'AUTH_ADMIN',
            'tests.py': '',
            'migrations': {
                '__init__.py': '',
            }
        },
    },
    'utils': {
        '__init__.py': '',
        'cache.py': 'CACHE_UTILS',
        'pagination.py': 'PAGINATION_UTILS',
        'permissions.py': 'PERMISSIONS',
        'exceptions.py': 'EXCEPTIONS',
    },
    'config': {
        '__init__.py': '',
        'redis.py': 'REDIS_CONFIG',
        'celery.py': 'CELERY_CONFIG',
    }
}

def create_structure(base_path, structure):
    """Recursively create directory structure"""
    for name, content in structure.items():
        path = os.path.join(base_path, name)
        
        if isinstance(content, dict):
            # Create directory
            os.makedirs(path, exist_ok=True)
            print(f"📁 Created directory: {path}")
            # Recursively create subdirectories
            create_structure(path, content)
        else:
            # Create file
            with open(path, 'w') as f:
                if content and content != '':
                    f.write(f"# {name}\n# Content placeholder: {content}\n")
                else:
                    f.write('')
            print(f"📄 Created file: {path}")

def main():
    print("=" * 70)
    print("🚀 Django CRM Backend Structure Generator")
    print("=" * 70)
    print()
    
    # Create structure
    create_structure(BASE_DIR, STRUCTURE)
    
    print()
    print("=" * 70)
    print("✅ Django project structure created successfully!")
    print("=" * 70)
    print()
    print("📝 Next steps:")
    print("   1. cd backend-django")
    print("   2. python3 -m venv venv")
    print("   3. source venv/bin/activate")
    print("   4. pip install -r requirements.txt")
    print("   5. python manage.py makemigrations")
    print("   6. python manage.py migrate")
    print("   7. python manage.py runserver")
    print()

if __name__ == '__main__':
    main()
