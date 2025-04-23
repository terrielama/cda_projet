from django.contrib import admin
from .models import Product, Cart, CartItem

# Enregistrement des modèles dans l'admin Django
admin.site.register([Product, Cart, CartItem])
