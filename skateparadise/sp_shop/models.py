from django.db import models, IntegrityError
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

class Sizes(models.Model):
    name = models.CharField(max_length=10)


# ------ Définition du modèle de produit --------



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
    description = models.TextField(blank=True, null=True)
    marque = models.TextField(blank=True, null=True)
    available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    sizes = models.JSONField(default=list, blank=True)
    stock = models.IntegerField(default=0)

    def save(self, *args, **kwargs):
        is_new = self.pk is None  # Création ou modification

        # Création slug unique (uniquement si vide)
        if not self.slug:
            base_slug = slugify(self.name)
            unique_slug = base_slug
            counter = 1
            while Product.objects.filter(slug=unique_slug).exists():
                unique_slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = unique_slug

        # Définir tailles selon catégorie uniquement à la création
        if is_new:
            cat = (self.category or "").lower()
            if cat == 'boards':
                sizes_list = ["7.75", "8.0", "8.25"]
            elif cat == 'chaussures':
                sizes_list = ["39", "40", "41"]
            elif cat == 'sweats':
                sizes_list = ["S", "M", "L"]
            else:
                sizes_list = []
            self.sizes = sizes_list
        else:
            sizes_list = self.sizes  # Pour utiliser plus bas dans le code

        # Sauvegarde pour générer la PK avant d’accéder aux relations
        super().save(*args, **kwargs)

        # Mise à jour de la disponibilité (après sauvegarde)
        self.update_availability(update=False)

        # Création des tailles liées si produit nouveau
        if is_new:
            for sizes in sizes_list:
                ProductSize.objects.get_or_create(product=self, sizes=sizes, defaults={'stock': self.stock})

        # Mise à jour finale de la disponibilité en base
        self.update_availability(update=True)


    @property
    def total_stock(self):
        return sum(size.stock for size in self.product_sizes.all())


    def update_availability(self, update=True):
        # Si pas encore de pk, ne rien faire (évite erreur)
        if not self.pk:
            return

        if self.product_sizes.exists():
            has_stock = self.product_sizes.filter(stock__gt=0, available=True).exists()
            self.available = has_stock
        else:
            self.available = self.stock > 0

        if update:
            # Mise à jour du champ available en base, sans save() pour éviter récursion
            Product.objects.filter(pk=self.pk).update(available=self.available)


# ------ Définition du modèle de la taille de produit lié au stock --------

class ProductSize(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_sizes')
    size = models.CharField(max_length=10)
    stock = models.IntegerField(default=0)
    available = models.BooleanField(default=True)

    class Meta:
        unique_together = ('product', 'size')

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Mise à jour de la disponibilité du produit après modification
        self.product.update_availability(update=True)

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
        # Mise à jour de la disponibilité du produit après suppression
        self.product.update_availability(update=True)





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
    cart = models.ForeignKey(
        'Cart',
        on_delete=models.CASCADE,
        related_name='cart_items'
    )
    product = models.ForeignKey(
        'Product',
        on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField(default=1)
    size = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        help_text="Taille sélectionnée pour ce produit (ex: S, M, L, 42, etc.)"
    )

    def __str__(self):
        size_display = self.size if self.size else "non spécifiée"
        return f"{self.quantity} x {self.product.name} (taille {size_display}) dans le panier {self.cart.id}"

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
    size = models.CharField(max_length=10, blank=True, null=True)

    def __str__(self):
        size_text = f" (taille {self.size})" if self.size else ""
        return f"{self.product.name} - {self.quantity} item(s){size_text}"

    @property
    def total_price(self):
        # Prix total par item (quantité * prix unitaire)
        return self.price * self.quantity
