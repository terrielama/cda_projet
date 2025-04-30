from django.db import models
from django.utils.text import slugify
from django.conf import settings  # settings est utilisé pour référencer des paramètres globaux du projet, comme le modèle utilisateur
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _

# Create your models here.

#----------- Définition du modèle Product --------

#----------- Définition du modèle Category --------

class Category(models.Model):
    name = models.CharField(max_length=191, unique=True)

    def __str__(self):
        return self.name
    
#----------- Définition du modèle Product --------
class Product(models.Model):
# Définition des catégories possibles avec un tuple de tuples (valeur stockée, valeur affichée)
    CATEGORY = (("Boards" , "BOARDS"),
                ("Trucks" , "TRUCKS"),
                ("Grips" , "GRIPS"),
                ("Roues" , "ROUES"),
                ("Sweats" , "SWEATS"),
                ("vestes", "VESTES"),
                ("Chaussures" , "CHAUSSURES"),
                ("Bonnets" , "BONNETS"),
                ("Ceintures" , "CEINTURES"),

    )

    name = models.CharField(max_length=191, unique=True)
     # Slug généré automatiquement à partir du nom, peut être vide ou null
    slug = models.SlugField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='', null=False, default='default-image.png')  # Ajouter une image par défaut ici
    category = models.CharField(max_length=191, choices=CATEGORY, blank=True, null=True)
    stock = models.PositiveIntegerField(default=0)  
    description = models.TextField(blank=True, null=True)  
    available = models.BooleanField(default=True)  
    created_at = models.DateTimeField(auto_now_add=True)  

 # Représentation textuelle d'un produit dans l'admin, etc.
    def __str__(self):
        return self.name

# Surcharge de la méthode save pour générer un slug unique
    def save(self, *args, **kwargs):
         # Si le slug n'existe pas, on en crée un à partir du nom
        if not self.slug:
            self.slug = slugify(self.name)
            unique_slug = self.slug
            counter = 1 
         # Vérifie si un produit avec ce slug existe déjà
            if Product.objects.filter(slug=unique_slug).exists():
            # Si oui, on ajoute un compteur pour le rendre unique
                unique_slug = f'{self.slug}-{counter}'
                counter += 1
            self.slug = unique_slug
 # Appelle la méthode save originale pour enregistrer le produit
        super().save(*args, **kwargs)



#----------- Définition du modèle Cart (Panier) ------------

class Cart(models.Model):
    cart_code = models.CharField(max_length=11, unique=True)
   
  # settings.AUTH_USER_MODEL permet de référencer dynamiquement le modèle User personnalisé défini dans les settings.py
  # on_delete pour que si  l'utilisateur est supprimé, son panier l'est aussi
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True)
 
  # Indique si le panier a été payé. Par défaut, c'est False (non payé).
    paid = models.BooleanField(default=False)
  # Date de création automatique du panier. auto_now_add le remplit à la création.
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
  # Date de dernière modification.
    modified_at = models.DateTimeField(auto_now=True, blank=True, null=True)

    def __str__(self):
        return self.cart_code


#----------- Définition du modèle CartItem ( Les produits qui sont dans le panier ) ----

class CartItem(models.Model):
  # Référence au panier auquel l'article appartient
  # related_name='items'  Permet d'accéder aux articles depuis un panier via   cart.items.all()
  # on_delete=models.CASCADE supprime les articles si le panier est supprimé
    cart= models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)  
 
  # Référence au produit ajouté au panier 
  # on_delete=models.CASCADE  supprime l'entrée si le produit est supprimé
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
 
  # Quantité du produit dans le panier. Par défaut : 1
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in cart {self.cart.id}"
    
# ----------- Définition du modèle Order --------------------

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'En attente'),
        ('completed', 'Complétée'),
        ('cancelled', 'Annulée'),
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    cart = models.ForeignKey(Cart, related_name='orders', on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)  # Utiliser AUTH_USER_MODEL
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    payment_method = models.CharField(max_length=20, choices=[('card', 'Carte Bancaire'), ('paypal', 'PayPal')], default='card')


    def __str__(self):
        cart_code = self.cart.cart_code if self.cart else "No cart"
        return f"Order #{self.id} - Cart Code: {cart_code}"

#----------- Définition du modèle OrderItem --------------------

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} - {self.quantity} items"
