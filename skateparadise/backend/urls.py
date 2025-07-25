"""
URL configuration for skateparadise project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from sp_shop.views import profile
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Vue personnalisée pour les erreurs 404
def custom_404_view(request, exception):
    return JsonResponse({'error': 'Not Found'}, status=404)

# Vue personnalisée pour les erreurs 500
def custom_500_view(request):
    return JsonResponse({'error': 'Erreur serveur interne'}, status=500)

urlpatterns = [
    path('admin/', admin.site.urls),
    path("", include("sp_shop.urls")),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("profile/", profile, name="profile"),
]

# Fichiers médias en mode développement
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Handlers personnalisés
handler404 = custom_404_view
handler500 = custom_500_view
