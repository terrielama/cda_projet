from django.shortcuts import render
from rest_framework.decorators import api_view # Permet de créer des vues API basées sur des fonctions
from .models import Product
from .serializers import ProductSerializer
from rest_framework.response import Response # Utilisé pour retourner des réponses HTTP dans l'API

# Create your views here.

# Vue API qui gère uniquement les requêtes GET
@api_view(["GET"])  # Ce décorateur permet de limiter les types de requêtes HTTP acceptées (ici uniquement GET)
def products(request):
    # Récupère tous les produits de la base de données
    products = Product.objects.all()
     # Sérialise la liste des produits pour pouvoir la retourner en JSON
    serializer = ProductSerializer(products, many=True)
    # Retourne la réponse sous forme de JSON avec les données des produits
    return Response(serializer.data)
