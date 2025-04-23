from rest_framework import serializers
from .models import Product, Cart, CartItem

# Serializer les models permet de convertir les objets Product en JSON (et vice versa) pour les API.

# -----  Serializer pour le modèle Product --------

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product  # Spécifie le modèle lié à ce serializer
        fields = [ "id", "name", "slug", "image", "description", "category", "price"]



# ------ Serializer pour le modèle CartItem  ---------

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)   # read_only=True signifie qu’on ne peut pas modifier ce champ via l’API avec ce serializer.
    total =  serializers.SerializerMethodField()
    class Meta:
        model = CartItem  # Spécifie le modèle lié à ce serializer
        fields = [ "id", "quantity","product", "total"]

    def get_total(self, cartitem):
        price = cartitem.product.price * cartitem.quantity
        return price

# ------ Serializer pour le modèle   ---------


class SimpleCartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = [ "id", "cart_code","num_of_items"]

    def get_num_of_items(self, cart):
        num_of_items = sum([ item.quantity for item in cart.items.all()])
        return num_of_items




# ------ Serializer pour le modèle Cart ---------

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(read_only=True, many=True)
    sum_total = serializers.SerializerMethodField()
    num_of_items = serializers.SerializerMethodField()
    class Meta:
        model = Cart
        fields = [ "id", "cart_code", "items", "sum_total", "num_of_items", "created_at", "modified_at"]

    def get_sum_total(self, cart):
        items = cart.items.all()
        total = sum([item.product.price * item.quantity for item in items ])
        return total
    
    def get_num_total(self, cart):
        items = cart.items.all()
        total = sum([ item.quantity for item in items ])
        return total
    
    def get_num_of_items(self, cart): 
        items = cart.items.all()
        return sum(item.quantity for item in items)

