"""
Django settings for energy_backend project.
"""

from pathlib import Path
import os
from dotenv import load_dotenv
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# -------------------
# SECURITY
# -------------------

SECRET_KEY = os.getenv("SECRET_KEY", "unsafe-default-key")
DEBUG = True

ALLOWED_HOSTS = ["*"]

# -------------------
# APPLICATIONS
# -------------------

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
     'rest_framework.authtoken',
    "corsheaders",
    "rest_framework",

    'energy_api',
]
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ]
}

# -------------------
# MIDDLEWARE
# -------------------

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',

    # Required for static files on Railway
    'whitenoise.middleware.WhiteNoiseMiddleware',

    "corsheaders.middleware.CorsMiddleware",

    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOW_ALL_ORIGINS = True

ROOT_URLCONF = 'energy_backend.urls'

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

WSGI_APPLICATION = 'energy_backend.wsgi.application'

# -------------------
# DATABASE (SQLite only — no external DB)
# -------------------

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# -------------------
# PASSWORD VALIDATION
# -------------------

AUTH_PASSWORD_VALIDATORS = []

# -------------------
# INTERNATIONALIZATION
# -------------------

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# -------------------
# STATIC FILES FOR RAILWAY
# -------------------

# STATIC FILES FOR RAILWAY
# -------------------

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# -------------------
# MEDIA FILES (For user uploads like screenshots)
# -------------------
# This is the public URL prefix for accessing media files
MEDIA_URL = '/media/' 

# This is the absolute path to the directory where media files will be stored.
# It will resolve to: /path/to/enlite-project/enlite-main/media/
MEDIA_ROOT = BASE_DIR / 'media' 

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
