from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from .models import Product, Cart, CartItem, Order, OrderItem
from .serializers import ProductSerializer,  CartItemSerializer , CartSerializer , SimpleCartSerializer, OrderSerializer 
from rest_framework.response import Response # Utilisé pour retourner des réponses HTTP dans l'API
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated


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




# ----- View update les produits dans le panier  ------

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

# ----- Creer une commande ------------
@api_view(["POST"])
def create_order(request):
    cart_code = request.data.get('cart_code')
    if not cart_code:
        return JsonResponse({"error": "Code de panier manquant"}, status=400)

    try:
        # Récupère le panier en fonction du code fourni
        cart = Cart.objects.get(cart_code=cart_code)

        # Crée une nouvelle commande
        order = Order.objects.create(cart=cart)  # Assurez-vous que 'cart' existe dans le modèle Order

        # Ajoute les articles du panier à la commande
        for item in cart.items.all():
            order_item = OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )

        # Renvoie une réponse avec l'ID de la commande
        return JsonResponse({"message": "Commande créée avec succès", "order_id": order.id})

    except Cart.DoesNotExist:
        return JsonResponse({"error": "Panier non trouvé"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ----- Detail de la commande  ------------
@api_view(["GET"])
def order_details(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Commande non trouvée"}, status=status.HTTP_404_NOT_FOUND)

    # Sérialisation des données de la commande
    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_200_OK)

# ----- Status de la commande  ------------

@api_view(["PATCH"])
def update_order_status(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Commande non trouvée"}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get("status")
    if new_status and new_status in dict(Order.STATUS_CHOICES):
        order.status = new_status
        order.save()
        return Response({"status": order.status}, status=status.HTTP_200_OK)
    
    return Response({"error": "Statut invalide"}, status=status.HTTP_400_BAD_REQUEST)

# ----- Connexion  ------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_username(request):
    user = request.user
    return Response({"username": user.username})