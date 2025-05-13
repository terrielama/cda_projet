from django.contrib import admin
from .models import Product, Cart, CartItem, Order, OrderItem

# Enregistrement des modèles dans l'admin Django
admin.site.register([Product, CartItem, Order, OrderItem])

@admin.register(Cart)  # Utilisation du décorateur pour enregistrer Cart
class CartAdmin(admin.ModelAdmin):
    list_display = ('cart_code', 'user_display', 'paid', 'created_at', 'modified_at')

    # Méthode pour afficher l'utilisateur ou "invité"
    def user_display(self, obj):
        return obj.user.username if obj.user else "invité"
    user_display.short_description = 'Utilisateur'  # Changer l'intitulé de la colonne
