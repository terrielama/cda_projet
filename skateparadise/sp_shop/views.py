from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view # Permet de créer des vues API basées sur des fonctions
from .models import Product, Cart, CartItem
from .serializers import ProductSerializer,  CartItemSerializer , CartSerializer , SimpleCartSerializer
from rest_framework.response import Response # Utilisé pour retourner des réponses HTTP dans l'API

# Create your views here.

# ----- View des produits --------------

# Vue API qui gère uniquement les requêtes GET
@api_view(["GET"])  # Ce décorateur permet de limiter les types de requêtes HTTP acceptées (ici uniquement GET)
def products(request):
    # Récupère tous les produits de la base de données
    products = Product.objects.all()
     # Sérialise la liste des produits pour pouvoir la retourner en JSON
    serializer = ProductSerializer(products, many=True)
    # Retourne la réponse sous forme de JSON avec les données des produits
    return Response(serializer.data)




# ----- View pour ajouter un produit à un panier -----

@api_view(["POST"])  # Accepte uniquement les requêtes POST
def add_item(request):
    try:
        # Récupère les données du corps de la requête
        cart_code = request.data.get("cart_code")
        product_id = request.data.get("product_id")

        # Récupère ou crée un panier à partir du cart_code
        cart, created = Cart.objects.get_or_create(cart_code=cart_code)

        # Récupère le produit à partir de son ID
        product = Product.objects.get(id=product_id)

        # Récupère ou crée une ligne de panier pour ce produit dans ce panier
        cartitem, created = CartItem.objects.get_or_create(cart=cart, product=product)

        # Initialise la quantité à 1 (écrase si déjà existant)
        cartitem.quantity = 1
        cartitem.save()

        # Sérialise l'objet CartItem pour le renvoyer
        serializer = CartItemSerializer(cartitem)

        # ✅ CORRECTION : il manquait un return ici !
        return Response({"data": serializer.data, "message": "Cart item created successfully"}, status=201)

    except Exception as e:
        # En cas d'erreur, retourne un message d'erreur avec un code 400 (Bad Request)
        return Response({"error": str(e)}, status=400)
    
    
# ----- View des produits du panier --------

@api_view(["GET"])  
def product_in_cart(request):
    # Récupère le code du panier depuis les paramètres de la requête (ex: ?cart_code=ABC123)
    cart_code = request.query_params.get("cart_code")
    
    # Récupère l'ID du produit depuis les paramètres de la requête (ex: ?product_id=5)
    product_id = request.query_params.get("product_id")

    # Récupère l'objet Cart correspondant au cart_code fourni
    cart = Cart.objects.get(cart_code=cart_code)

    # Récupère l'objet Product correspondant à l'ID fourni
    product = Product.objects.get(id=product_id)

    # Vérifie si un CartItem existe avec ce panier et ce produit
    product_exists_in_cart = CartItem.objects.filter(cart=cart, product=product).exists()

    # Renvoie une réponse JSON avec un booléen indiquant si le produit est dans le panier
    return Response({'product_in_cart': product_exists_in_cart})


# ----- View du panier --------
# récupérer toutes les informations d’un panier (produits, quantités, total, etc.) en fonction d’un cart_code.

@api_view(["GET"])
def get_cart(request):
    # Récupère le cart_code depuis les paramètres de la requête GET (ex: ?cart_code=XYZ123)
    cart_code = request.GET.get("cart_code")

    # Si aucun cart_code n’est fourni, retourne une erreur 400 (Bad Request)
    if not cart_code:
        return Response({"error": "cart_code manquant"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Essaie de récupérer le panier correspondant au cart_code
        cart = Cart.objects.get(cart_code=cart_code)
    except Cart.DoesNotExist:
        # Si aucun panier n’est trouvé, retourne une erreur 404 (Not Found)
        return Response({"error": "Panier introuvable"}, status=status.HTTP_404_NOT_FOUND)

    # Sérialise le panier trouvé pour renvoyer ses données en JSON
    serializer = CartSerializer(cart)

    # Renvoie les données du panier avec un statut 200 (OK)
    return Response(serializer.data)



# ----- View des infos basiques du panier ------

@api_view(["GET"])  
def get_cart_stat(request):
    # Récupère le cart_code depuis les paramètres de la requête (ex: ?cart_code=XYZ123)
    cart_code = request.query_params.get("cart_code")

    # Récupère le panier correspondant au cart_code et qui n’a pas encore été payé
    # Si aucun panier n'est trouvé, cela lèvera automatiquement une exception (à sécuriser si besoin)
    cart = Cart.objects.get(cart_code=cart_code, paid=False)

    # Sérialise le panier en utilisant le serializer simplifié (qui contient seulement l'id, le cart_code, et le nombre d’articles)
    serializer = SimpleCartSerializer(cart)

    # Renvoie les données sérialisées du panier
    return Response(serializer.data)




@api_view(["POST"])
def update_quantity(request):
    item_id = request.data.get("item_id")
    delta = int(request.data.get("delta", 0))

    try:
        item = CartItem.objects.get(id=item_id)
        item.quantity = max(1, item.quantity + delta)
        item.save()
        return Response({"message": "Quantité mise à jour"})
    except CartItem.DoesNotExist:
        return Response({"error": "Article non trouvé"}, status=404)



# ----- Supprimer un article du panier ------

@api_view(["POST"])
def remove_item(request):
    item_id = request.data.get("item_id")
    try:
        CartItem.objects.get(id=item_id).delete()
        return Response({"message": "Article supprimé du panier"})
    except CartItem.DoesNotExist:
        return Response({"error": "Article introuvable"}, status=404)
