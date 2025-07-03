from rest_framework import serializers
from .models import Product, Cart, CartItem, Order, OrderItem, User, Category, Favorite, Sizes, ContactMessage
from main.models import CustomUser  
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
User = get_user_model()  # Récupère dynamiquement le modèle utilisateurCustomUser
import bleach

# Serializer les models permet de convertir les objets Product en JSON (et vice versa) pour les API.
# ------------------------------------------------------------------



# ------- Serializer pour le modèle Register-----------

# La fonction sanitize_text utilise bleach.clean() sans autoriser aucune balise ou attribut HTML.  Cela empêche toute injection XSS.
# Dans create() : néttoyage de tous les champs texte utilisateur.
# La validation assure qDans create(), nettoyage de tous les champs texte utilisateur.
# ue password et confirm_password correspondent.
# set_password() hash le mot de passe proprement avant sauvegarde.
# Le champ confirm_password est write-only, il ne sera pas retourné dans les réponses API.

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

    def sanitize_text(self, text):
        # Supprime toute balise HTML potentiellement dangereuse
        return bleach.clean(text, tags=[], attributes={}, strip=True)

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')

        # Nettoyage des champs sensibles
        validated_data['username'] = self.sanitize_text(validated_data.get('username', ''))
        validated_data['first_name'] = self.sanitize_text(validated_data.get('first_name', ''))
        validated_data['last_name'] = self.sanitize_text(validated_data.get('last_name', ''))
        validated_data['email'] = self.sanitize_text(validated_data.get('email', ''))

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

# -----  Serializer pour le modèle catégorie --------

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

# ------ Serializer pour le modèle taille -----

class SizesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sizes
        fields = ['name']


# -----  Serializer pour le modèle Product --------

class ProductSerializer(serializers.ModelSerializer):
    sizes = serializers.JSONField()
    image = serializers.SerializerMethodField()
    available_sizes = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'image', 'sizes', 'available_sizes',
            'category', 'stock', 'description', 'available','marque'
        ]

    def get_image(self, obj):
        request = self.context.get('request', None)
        if request and obj.image:
            return request.build_absolute_uri(obj.image.url)
        elif obj.image:
            return obj.image.url
        return None

    def get_available_sizes(self, obj):
        # Accès via le related_name 'product_sizes'
        return [
            str(ps.size) for ps in obj.product_sizes.all() if ps.stock > 0
        ]

    

# ------ Serializer pour le modèle Favori  ---------

class FavoriteSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'product']


# ------ Serializer pour le modèle CartItem  ---------

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)   # Serializes the associated Product
    total =  serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()    # Getting the image from the product

    class Meta:
        model = CartItem  # Serializer for CartItem
        fields = [ "id", "quantity", "product", "total", "image", "size"]

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
    num_of_items = serializers.SerializerMethodField() 

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
        fields = ['product_name', 'quantity', 'product_price', 'product_image', 'total_price','size']

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
        fields = [
            'id', 'user', 'status', 'payment_method', 'cart_code', 
            'created_at', 'updated_at', 'items',
            # Ajout des champs client :
            'first_name', 'last_name', 'address', 'phone',
        ]

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


# --- Serializer pour récupérer les données infos  reçues

class OrderUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=True, max_length=100)
    last_name = serializers.CharField(required=True, max_length=100)
    address = serializers.CharField(required=True, max_length=255)
    phone = serializers.CharField(required=True, max_length=20)
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT_METHOD_CHOICES, required=True)




# --- Serializer pour brancher formulaire de contact React au backend ------

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']