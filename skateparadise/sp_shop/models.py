from django.db import models
from django.utils.text import slugify

# Create your models here.

# Définition du modèle Product
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
    image = models.ImageField(upload_to="img")
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
