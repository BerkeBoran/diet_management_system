from datetime import timedelta
import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent

FATSECRET_CLIENT_ID = os.environ.get('FATSECRET_CLIENT_ID')
FATSECRET_CLIENT_SECRET = os.environ.get('FATSECRET_CLIENT_SECRET')
SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1,diet_backend').split(',')

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')

CORS_ALLOWED_ORIGINS = [o for o in [
    FRONTEND_URL,
    os.environ.get('CORS_EXTRA_ORIGIN', ''),
] if o]

CSRF_TRUSTED_ORIGINS = [o for o in [
    FRONTEND_URL,
    os.environ.get('CORS_EXTRA_ORIGIN', ''),
] if o]


INSTALLED_APPS = [
    'daphne',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.apple',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    'rest_framework_simplejwt.token_blacklist',
    'channels',
    'apps.chat',
    'apps.diets',
    'apps.foods',
    'apps.users',
    'apps.appointments',
    'apps.ai_dietician',
    'apps.subscription',
    'apps.payment',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

ROOT_URLCONF = 'config.urls'
ASGI_APPLICATION = 'config.asgi.application'
WSGI_APPLICATION = 'config.wsgi.application'

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


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'diet_db'),
        'USER': os.environ.get('DB_USER', 'admin'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', 'db'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('redis', 6379)],
        },
    },
}

AUTH_USER_MODEL = 'users.User'
SITE_ID = 1

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'TOKEN_OBTAIN_SERIALIZER': 'apps.users.serializers.auth.CustomTokenObtainPairSerializer',
}

REST_AUTH = {
    'USE_JWT': True,
    'JWT_AUTH_COOKIE': None,
    'JWT_AUTH_REFRESH_COOKIE': None,
    'JWT_AUTH_RETURN_EXPIRATION': True,
    'USER_DETAILS_SERIALIZER': 'apps.users.serializers.auth.CustomUserDetailsSerializer',
    'OLD_PASSWORD_FIELD_ENABLED': True,
}

ACCOUNT_ADAPTER = 'apps.users.adapters.CustomAccountAdapter'
SOCIALACCOUNT_ADAPTER = 'apps.users.adapters.CustomSocialAccountAdapter'


ACCOUNT_LOGIN_METHODS = {'email'}
ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_SIGNUP_FIELDS = ['email*', 'password1*', 'password2*']
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
ACCOUNT_CONFIRM_EMAIL_ON_GET = True
ACCOUNT_EMAIL_CONFIRMATION_EXPIRE_DAYS = 3
ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION = False

EMAIL_BACKEND = os.environ.get('EMAIL_BACKEND', "django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', 'your@gmail.com')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', 'app-password')
DEFAULT_FROM_EMAIL = f"Lifeetics <{EMAIL_HOST_USER}>"

CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL','redis://redis:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND','redis://redis:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'

GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')

IYZICO_API_KEY    = os.environ.get('IYZICO_API_KEY', '')
IYZICO_SECRET_KEY = os.environ.get('IYZICO_SECRET_KEY', '')
IYZICO_BASE_URL   = os.environ.get('IYZICO_BASE_URL', 'https://sandbox-api.iyzipay.com')

# Ödeme sistemi hazır olduğunda True yap
REQUIRE_AI_SUBSCRIPTION = False


GOOGLE_CALLBACK_URL = os.environ.get(
    'GOOGLE_CALLBACK_URL',
    'http://localhost:8000/api/users/social/google/'
)

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': os.environ.get('GOOGLE_CLIENT_ID', ''),
            'secret': os.environ.get('GOOGLE_CLIENT_SECRET', ''),
            'key': '',
        },
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
        'OAUTH_PKCE_ENABLED': True,
    },
    'apple': {
        'APP': {
            'client_id': os.environ.get('APPLE_CLIENT_ID', ''),
            'secret': os.environ.get('APPLE_CLIENT_SECRET', ''),
            'key': os.environ.get('APPLE_KEY_ID', ''),
            'certificate_key': os.environ.get('APPLE_CERTIFICATE_KEY', ''),
        },
        'SCOPE': ['email', 'name'],
    },
}
SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'False') == 'True'
SESSION_COOKIE_SECURE = os.environ.get('SECURE_SSL_REDIRECT', 'False') =='True'
CSRF_COOKIE_SECURE = os.environ.get('SECURE_SSL_REDIRECT', 'False') == 'True'
SECURE_HSTS_SECONDS = 31536000 if os.environ.get('SECURE_SSL_REDIRECT') =='True' else 0
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'


