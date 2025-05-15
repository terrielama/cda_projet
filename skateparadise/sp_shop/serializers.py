from rest_framework import serializers
from .models import Product, Cart, CartItem, Order, OrderItem, User
from main.models import CustomUser  
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
User = get_user_model()  # Récupère dynamiquement le modèle utilisateurCustomUser

# Serializer les models permet de convertir les objets Product en JSON (et vice versa) pour les API.
# ------------------------------------------------------------------

# ------- Serializer pour le modèle Register-----------

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'confirm_password', 'first_name', 'last_name', 'email')

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")

        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")

        if 'email' in data and User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Cette adresse email est déjà utilisée.")

        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
        return user
    
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
    items = CartItemSerializer(source='cart_items', many=True, read_only=True)
    sum_total = serializers.SerializerMethodField()
    num_of_items = serializers.SerializerMethodField()  # Champ pour calculer le nombre d'articles

    class Meta:
        model = Cart
        fields = ["id", "cart_code", "items", "sum_total", "num_of_items", "created_at", "modified_at"]

    # Méthode pour calculer le total du panier
    def get_sum_total(self, cart):
        items = cart.cart_items.all()
        total = sum([item.product.price * item.quantity for item in items])
        return total
    
    # Méthode pour calculer le nombre total d'articles dans le panier
    def get_num_of_items(self, cart):
        items = cart.cart_items.all()
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
    cart_code = serializers.CharField(source='cart.cart_code', read_only=True)  # accès via relation cart

    class Meta:
        model = Order
        fields = ['id', 'user', 'status', 'payment_method', 'cart_code', 'created_at', 'updated_at', 'items']

    def get_user(self, obj):
        if obj.user:
            return {
                "username": obj.user.username,
                "first_name": obj.user.first_name or "Non renseigné",
                "last_name": obj.user.last_name or "Non renseigné",
                "email": obj.user.email or "Non renseigné",
            }
        return {
            "username": "Invité",
            "first_name": "Invité",
            "last_name": "Non renseigné",
            "email": "Non renseigné",
        }
    

