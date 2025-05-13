from django.contrib import admin
from .models import Product, Cart, CartItem, Order, OrderItem

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'category', 'available')
    list_filter = ('category', 'available')
    search_fields = ('name',)

    def image_preview(self, obj):
        if obj.image:
            return f"<img src='{obj.image.url}' width='50' height='50' />"
        return "Aucune image"
    image_preview.allow_tags = True
    image_preview.short_description = 'Aperçu'

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('cart_code', 'user_display', 'paid', 'created_at', 'modified_at')

    def user_display(self, obj):
        return obj.user.username if obj.user else "invité"
    user_display.short_description = 'Utilisateur'

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_display', 'status', 'cart_code_display', 'payment_method', 'created_at', 'updated_at')

    def user_display(self, obj):
        return obj.user.username if obj.user else "invité"
    user_display.short_description = 'Utilisateur'

    def cart_code_display(self, obj):
        return obj.cart.cart_code if obj.cart else "Aucun panier"
    cart_code_display.short_description = 'Code Panier'

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'cart_code_display', 'quantity')

    def product_name(self, obj):
        return obj.product.name
    product_name.short_description = 'Produit'

    def cart_code_display(self, obj):
        return obj.cart.cart_code if obj.cart else "Aucun panier"
    cart_code_display.short_description = 'Code Panier'

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'order_id_display', 'quantity')

    def product_name(self, obj):
        return obj.product.name
    product_name.short_description = 'Produit'

    def order_id_display(self, obj):
        return f"Commande #{obj.order.id}" if obj.order else "Aucune commande"
    order_id_display.short_description = 'Commande'
