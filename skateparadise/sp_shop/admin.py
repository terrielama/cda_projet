from django.contrib import admin
from .models import Product, Cart, CartItem, Order, OrderItem


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'category', 'stock', 'created_at')
    search_fields = ('name', 'category')
    list_filter = ('category',)
    ordering = ('-created_at',)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('cart_code', 'user_display', 'paid', 'created_at', 'modified_at')
    search_fields = ('cart_code', 'user__username')
    list_filter = ('paid', 'created_at')
    ordering = ('-created_at',)

    def user_display(self, obj):
        return obj.user.username if obj.user else "invité"
    user_display.short_description = 'Utilisateur'


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('product', 'cart', 'quantity')  
    search_fields = ('product__name', 'cart__cart_code')
    list_filter = () 
    autocomplete_fields = ('product', 'cart')
    ordering = () 

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'cart_code_display',
        'user_display',
        'customer_name',
        'get_address',
        'get_phone',
        'payment_method',
        'status',
        'total_order_price',
        'created_at',
    )
    search_fields = (
        'user__username',
        'id',
        'cart__cart_code',
        'first_name',
        'last_name',
        'phone',
    )
    list_filter = ('status', 'payment_method', 'created_at')
    ordering = ('-created_at',)

    def customer_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    customer_name.short_description = 'Client'

    def get_address(self, obj):
        return obj.address
    get_address.short_description = 'Adresse'

    def get_phone(self, obj):
        return obj.phone
    get_phone.short_description = 'Téléphone'

    def user_display(self, obj):
        return obj.user.username if obj.user else "invité"
    user_display.short_description = 'Utilisateur'

    def cart_code_display(self, obj):
        return obj.cart.cart_code if obj.cart else "Aucun panier"
    cart_code_display.short_description = 'Cart Code'

    def total_order_price(self, obj):
        return sum(item.price * item.quantity for item in obj.items.all())
    total_order_price.short_description = 'Total (€)'


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'cart_code_display', 'product', 'quantity', 'price')
    search_fields = ('order__id', 'product__name', 'order__cart__cart_code')
    list_filter = ()
    autocomplete_fields = ('order', 'product')

    def order_id(self, obj):
        return obj.order.id
    order_id.short_description = 'Order ID'
    order_id.admin_order_field = 'order__id'

    def cart_code_display(self, obj):
        return obj.order.cart.cart_code if obj.order.cart else "Aucun panier"
    cart_code_display.short_description = 'Cart Code'
    cart_code_display.admin_order_field = 'order__cart__cart_code'

