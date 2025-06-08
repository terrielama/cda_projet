from django.db import models
from django.utils.text import slugify
from django.conf import settings  # settings est utilisé pour référencer des paramètres globaux du projet, comme le modèle utilisateur
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _
import uuid
from django.shortcuts import get_object_or_404



#----------- Définition du modèle Category --------

class Category(models.Model):
    name = models.CharField(max_length=191, unique=True)

    def __str__(self):
        return self.name
    
# ----- Taille de produit ------------

class Size(models.Model):
    name = models.CharField(max_length=10)

#----------- Définition du modèle Product --------


class Product(models.Model):
    CATEGORY = (
        ("Boards", "BOARDS"),
        ("Trucks", "TRUCKS"),
        ("Grips", "GRIPS"),
        ("Roues", "ROUES"),
        ("Sweats", "SWEATS"),
        ("Chaussures", "CHAUSSURES"),
        ("Bonnets", "BONNETS"),
        ("Ceintures", "CEINTURES"),
    )

    name = models.CharField(max_length=191, unique=True)
    slug = models.SlugField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', null=False, default='products/default-image.png')
    category = models.CharField(max_length=50, choices=CATEGORY, default="Boards")
    stock = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True, null=True)
    available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    sizes = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Gestion du slug unique
        if not self.slug:
            base_slug = slugify(self.name)
            unique_slug = base_slug
            counter = 1
            while Product.objects.filter(slug=unique_slug).exists():
                unique_slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = unique_slug

        # Gestion automatique des tailles selon catégorie
        cat = self.category.lower()
        if cat == 'boards':
            self.sizes = ["7.5", "7.75", "8.0", "8.25", "8.5"]
        elif cat == 'chaussures':
            self.sizes = ["38", "39", "40", "41", "42", "43", "44"]
        elif cat == 'sweats':
            self.sizes = ["XS", "S", "M", "L", "XL"]
        else:
            self.sizes = []

        super().save(*args, **kwargs)

    def decrement_stock(self, quantity):
        if self.stock >= quantity:
            self.stock -= quantity
            if self.stock == 0:
                self.available = False
            self.save()
        else:
            raise ValueError("Stock insuffisant pour ce produit.")




#------- Définition du modèle Favori ---------

class Favorite(models.Model):
    session_code = models.CharField(max_length=100, db_index=True, help_text="Code de session pour identifier les favoris d'un utilisateur anonyme.")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="favorites")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('session_code', 'product')
        verbose_name = "Favori"
        verbose_name_plural = "Favoris"

    def __str__(self):
        return f"Favori - Produit {self.product_id} | Session {self.session_code}"


#----------- Définition du modèle Cart (Panier) ------------

class Cart(models.Model):
    cart_code = models.CharField(max_length=11)

    # settings.AUTH_USER_MODEL permet de référencer dynamiquement le modèle User personnalisé défini dans settings.py
    # on_delete pour que si l'utilisateur est supprimé, son panier l'est aussi
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True)
    
    items = models.ManyToManyField('CartItem', related_name='carts', blank=True)



    # Indique si le panier a été payé. Par défaut, c'est False (non payé).
    paid = models.BooleanField(default=False)

    # Date de création automatique du panier.
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    # Date de dernière modification.
    modified_at = models.DateTimeField(auto_now=True, blank=True, null=True)

    def __str__(self):
        user_display = self.user.username if self.user else "invité"
        return f"Panier {self.cart_code} - {user_display}"

#----------- Définition du modèle CartItem ( Les produits qui sont dans le panier ) ----

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='cart_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    size = models.CharField(max_length=10, null=True, blank=True)

    def __str__(self):
        return f"{self.quantity} x {self.product.name} (taille {self.size}) dans le panier {self.cart.id}"

# ----------- Définition du modèle Order --------------------
def generate_tracking_code():
    return str(uuid.uuid4())


class Order(models.Model):
    STATUS_CHOICES = (
        ('attente', 'En attente'),
        ('expédié', 'Expédié'),
        ('livrée', 'Livrée'),
    )

    PAYMENT_METHOD_CHOICES = [
    ('CB', 'Carte bancaire'),
    ('PP', 'PayPal'),
    ]


    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='attente')
    cart = models.ForeignKey('Cart', related_name='orders', on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    # # Infos client
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)

    # Paiement et tracking
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='' 
    )
    tracking_code = models.CharField(
    max_length=100,
    default=generate_tracking_code,
    editable=False,
    null=False,
    blank=False,
    unique=True,
    )


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        cart_code = self.cart.cart_code if self.cart else "No cart"
        return f"Order #{self.id} - Cart Code: {cart_code}"

    @property
    def total_price(self):
        # Calcul du total à partir des items liés
        return sum(item.total_price for item in self.items.all())

#----------- Définition du modèle OrderItem --------------------

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # prix unitaire

    def __str__(self):
        return f"{self.product.name} - {self.quantity} items"

    @property
    def total_price(self):
        # Prix total par item (quantité * prix unitaire)
        return self.price * self.quantity
