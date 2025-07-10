from pathlib import Path
import os
from datetime import timedelta
from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent

# Sécurité
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', cast=Csv())

# Applications
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'main',
    'sp_shop',
    'rest_framework',
    'corsheaders',
    'rest_framework.authtoken',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Algorithme pour le hachage des mots de passe
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher', #Algorithme utilisé
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
]

DEBUG = config('DEBUG', default=True, cast=bool)

# FRONTEND_URL est chargé depuis le .env
FRONTEND_URL = config('FRONTEND_URL', default="http://localhost:5173")

# CORS
CORS_ALLOWED_ORIGINS = [FRONTEND_URL] if not DEBUG else [
    FRONTEND_URL,
    "http://localhost:5173",  # autorisé en dev
]

CORS_ALLOW_ALL_ORIGINS = DEBUG  # Autorise toutes les origines uniquement si DEBUG=True
CORS_ALLOW_CREDENTIALS = True   # Nécessaire si on utilise des cookies ou headers d'autorisation



# URLs & WSGI
ROOT_URLCONF = 'backend.urls'
WSGI_APPLICATION = 'backend.wsgi.application'

# Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Base de données
if config('DB_ENGINE') == 'django.db.backends.sqlite3':
    DATABASES = {
        'default': {
            'ENGINE': config('DB_ENGINE'),
            'NAME': BASE_DIR / config('DB_NAME'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': config('DB_ENGINE'),
            'NAME': config('DB_NAME'),
            'USER': config('DB_USER'),
            'PASSWORD': config('DB_PASSWORD'),
            'HOST': config('DB_HOST'),
            'PORT': config('DB_PORT'),
        }
    }

# Authentification
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ]
}

# Configuration des durées de validité des tokens
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),   # Le token d’accès expire après 30 minutes
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),      # Le refresh token est valide pendant 1 jours
    'ROTATE_REFRESH_TOKENS': False,                   # Ne pas changer le refresh token à chaque usage
    'ALGORITHM': 'HS256',                             # Algorithme de chiffrement utilisé
    'AUTH_HEADER_TYPES': ('Bearer',),                 # Type d’en-tête attendu : Bearer <token>
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}



AUTH_USER_MODEL = "main.CustomUser"

# Internationalisation
LANGUAGE_CODE = 'fr'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Fichiers médias et statiques
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
STATIC_URL = 'static/'

# Clé primaire par défaut
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


SECURE_SSL_REDIRECT = False
