from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Product, Cart, CartItem, Order, OrderItem
from .serializers import ProductSerializer, CartItemSerializer, CartSerializer, SimpleCartSerializer, OrderSerializer
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenBlacklistView
from rest_framework_simplejwt.tokens import RefreshToken



# ----- View des produits --------------
@api_view(["GET"])
def products(request):
    products = Product.objects.all()  # Récupère tous les produits
    serializer = ProductSerializer(products, many=True)  # Sérialise les produits
    return Response(serializer.data)

# ----- View pour ajouter un produit à un panier -----
@api_view(["POST"])
def add_item(request):
    try:
        cart_code = request.data.get("cart_code")
        product_id = request.data.get("product_id")

        cart, created = Cart.objects.get_or_create(cart_code=cart_code)  # Crée ou récupère un panier
        product = Product.objects.get(id=product_id)  # Récupère le produit
        cartitem, created = CartItem.objects.get_or_create(cart=cart, product=product)  # Crée un item de panier

        cartitem.quantity = 1  # Définit la quantité à 1
        cartitem.save()  # Sauvegarde l'item

        serializer = CartItemSerializer(cartitem)  # Sérialise l'item du panier
        return Response({"data": serializer.data, "message": "Cart item created successfully"}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

# ----- View pour récupérer les produits dans le panier --------
@api_view(["GET"])
def product_in_cart(request):
    cart_code = request.query_params.get("cart_code")
    product_id = request.query_params.get("product_id")

    try:
        cart = Cart.objects.get(cart_code=cart_code)
        product = Product.objects.get(id=product_id)
        
        product_exists_in_cart = CartItem.objects.filter(cart=cart, product=product).exists()
        
        return Response({'product_in_cart': product_exists_in_cart})
    except Cart.DoesNotExist:
        return Response({"error": "Panier introuvable"}, status=status.HTTP_404_NOT_FOUND)
    except Product.DoesNotExist:
        return Response({"error": "Produit introuvable"}, status=status.HTTP_404_NOT_FOUND)


# ----- View du panier --------
@api_view(["GET"])
@permission_classes([AllowAny])  # Permet l'accès à tous
def get_cart(request):
    cart_code = request.GET.get("cart_code")  # Récupère le code du panier depuis les paramètres

    if not cart_code:
        return Response({"error": "cart_code manquant"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        cart = Cart.objects.get(cart_code=cart_code)  # Récupère le panier par son code
    except Cart.DoesNotExist:
        return Response({"error": "Panier introuvable"}, status=status.HTTP_404_NOT_FOUND)

    # Si l'utilisateur est authentifié et que le panier n'a pas encore d'utilisateur, on l'associe à l'utilisateur actuel
    if request.user.is_authenticated and cart.user is None:
        cart.user = request.user
        cart.save()

    serializer = CartSerializer(cart)  # Sérialise le panier
    return Response(serializer.data)

# ----- View pour récupérer le statut du panier ------
@api_view(["GET"])
def get_cart_stat(request):
    cart_code = request.query_params.get("cart_code")
    cart = Cart.objects.get(cart_code=cart_code, paid=False)  # Récupère le panier non payé
    serializer = SimpleCartSerializer(cart)
    return Response(serializer.data)

# ----- View pour mettre à jour la quantité d'un produit ------
@api_view(["POST"])
def update_quantity(request):
    item_id = request.data.get("item_id")
    delta = int(request.data.get("delta", 0))

    try:
        item = CartItem.objects.get(id=item_id)  # Récupère l'item du panier par son ID
        item.quantity = max(1, item.quantity + delta)  # Met à jour la quantité (minimum 1)
        item.save()
        return Response({"message": "Quantité mise à jour"})
    except CartItem.DoesNotExist:
        return Response({"error": "Article non trouvé"}, status=404)

# ----- View pour supprimer un article du panier ------
@api_view(["POST"])
def remove_item(request):
    item_id = request.data.get("item_id")
    try:
        CartItem.objects.get(id=item_id).delete()  # Supprime l'item du panier
        return Response({"message": "Article supprimé du panier"})
    except CartItem.DoesNotExist:
        return Response({"error": "Article introuvable"}, status=404)

# ----- View pour créer une commande ------------
@api_view(["POST"])
def create_order(request):
    cart_code = request.data.get('cart_code')
    if not cart_code:
        return JsonResponse({"error": "Code de panier manquant"}, status=400)

    try:
        cart = Cart.objects.get(cart_code=cart_code)

        # Si l'utilisateur est authentifié, associer la commande à cet utilisateur
        if request.user.is_authenticated:
            order = Order.objects.create(cart=cart, user=request.user)
        else:
            order = Order.objects.create(cart=cart)  # Si invité, laisser user à None

        # Ajouter les articles du panier à la commande
        for item in cart.items.all():
            order_item = OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )

        return JsonResponse({"message": "Commande créée avec succès", "order_id": order.id})
    except Cart.DoesNotExist:
        return JsonResponse({"error": "Panier non trouvé"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# ----- View pour afficher les détails de la commande ------------
@api_view(["GET"])
def order_details(request, order_id):
    try:
        order = Order.objects.get(id=order_id)  # Récupère la commande par son ID
    except Order.DoesNotExist:
        return Response({"error": "Commande non trouvée"}, status=status.HTTP_404_NOT_FOUND)

    # Structure les données de la commande
    order_data = {
        "id": order.id,
        "status": order.status,
        "cart_code": order.cart.cart_code if order.cart else "No cart",
        "user": order.user.username if order.user else "Invité",  # Affiche le nom d'utilisateur si disponible
        "created_at": order.created_at,
        "updated_at": order.updated_at,
        "payment_method": order.payment_method,
    }

    # Ajoute les articles de la commande
    order_items = [
        {
            "product_name": item.product.name,
            "quantity": item.quantity,
            "price": item.product.price,
            "total_price": item.quantity * item.product.price
        }
        for item in order.cart.items.all()
    ]
    
    return Response({"order": order_data, "items": order_items}, status=status.HTTP_200_OK)

# ----- View pour mettre à jour le statut d'une commande ------
@api_view(["PUT"])
def update_order_status(request, order_id):
    try:
        order = Order.objects.get(id=order_id)  # Récupère la commande par son ID
    except Order.DoesNotExist:
        return Response({"error": "Commande non trouvée"}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get("status")  # Récupère le nouveau statut

    if new_status not in dict(Order.STATUS_CHOICES):  # Vérifie que le statut est valide
        return Response({"error": "Statut invalide"}, status=status.HTTP_400_BAD_REQUEST)

    order.status = new_status  # Met à jour le statut
    order.save()  # Sauvegarde la commande

    return Response({"message": f"Statut de la commande mis à jour en {new_status}"}, status=status.HTTP_200_OK)

# ----- View pour récupérer le nom de l'utilisateur connecté ------


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_username(request):
    return JsonResponse({'first_name': request.user.first_name})
