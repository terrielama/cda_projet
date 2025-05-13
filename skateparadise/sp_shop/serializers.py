from rest_framework import serializers
from .models import Product, Cart, CartItem, Order, OrderItem

# Serializer les models permet de convertir les objets Product en JSON (et vice versa) pour les API.

# -----  Serializer pour le modèle Product --------

class ProductSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product  # Spécifie le modèle lié à ce serializer
        fields = [ "id", "name", "slug", "image", "description", "category", "price"]

    def get_image(self, obj):
        # Retourne l'URL de l'image ou None si elle n'existe pas
        if obj.image:
            return obj.image.url
        return None

# ------ Serializer pour le modèle CartItem  ---------

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)   # Serializes the associated Product
    total =  serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()    # Getting the image from the product

    class Meta:
        model = CartItem  # Serializer for CartItem
        fields = [ "id", "quantity", "product", "total", "image"]

    def get_total(self, cartitem):
        # Calculates the total price for this cart item
        price = cartitem.product.price * cartitem.quantity
        return price
    
    def get_image(self, obj):
        # Returns the product image URL (not the CartItem image)
        if obj.product.image:
            return obj.product.image.url  # Get image from the related Product object
        return None


# ------ Serializer pour le modèle   ---------

class SimpleCartSerializer(serializers.ModelSerializer):
    num_of_items = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "cart_code", "num_of_items"]

    def get_num_of_items(self, cart):
        return sum([item.quantity for item in cart.items.all()])


# ------ Serializer pour le modèle Cart ---------

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(read_only=True, many=True)  # Sérialise les items du panier
    sum_total = serializers.SerializerMethodField()  # Champ pour calculer le total
    num_of_items = serializers.SerializerMethodField()  # Champ pour calculer le nombre d'articles

    class Meta:
        model = Cart
        fields = ["id", "cart_code", "items", "sum_total", "num_of_items", "created_at", "modified_at"]

    # Méthode pour calculer le total du panier
    def get_sum_total(self, cart):
        # Récupère les items du panier et calcule le total
        items = cart.items.all()
        total = sum([item.product.price * item.quantity for item in items])
        return total
    
    # Méthode pour calculer le nombre total d'articles dans le panier
    def get_num_of_items(self, cart):
        # Récupère les items du panier et calcule le nombre total d'articles
        items = cart.items.all()
        total = sum([item.quantity for item in items])
        return total
   
# ------ Serializer pour le modèle OrderItem (produit d'une commande) ---------

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name')
    product_price = serializers.DecimalField(source='price', max_digits=10, decimal_places=2)
    product_image = serializers.ImageField(source='product.image', required=False)  # Si l'image existe
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['product_name', 'quantity', 'product_price', 'product_image', 'total_price']

    def get_total_price(self, obj):
        return obj.price * obj.quantity



# ------ Serializer pour le modèle Order (commande) ---------

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.SerializerMethodField()
    payment_method = serializers.CharField()

    class Meta:
        model = Order
        fields = ['id', 'user', 'status', 'payment_method', 'created_at', 'updated_at', 'items']

    def get_user(self, obj):
        if obj.user:
            return {
                "username": obj.user.username,
                "first_name": obj.user.first_name or "Non renseigné",  # Valeur par défaut si first_name est None
                "last_name": obj.user.last_name or "Non renseigné",  # Valeur par défaut si last_name est None
                "email": obj.user.email or "Non renseigné",  # Valeur par défaut si email est None
            }
        return {
            "username": "Invité",
            "first_name": "Invité",
            "last_name": "Non renseigné",
            "email": "Non renseigné",
        }


