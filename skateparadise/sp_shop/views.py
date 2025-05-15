from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Product, Cart, CartItem, Order, OrderItem, User
from .serializers import ProductSerializer, CartItemSerializer, CartSerializer, SimpleCartSerializer, OrderSerializer, UserRegisterSerializer
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework.exceptions import NotFound
import traceback


#----- View pour creer un user (Register) ------

@api_view(["POST"])
def register(request):
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ----- View des produits --------------
@api_view(["GET"])
def products(request):
    products = Product.objects.all()  # Récupère tous les produits
    serializer = ProductSerializer(products, many=True)  # Sérialise les produits
    return Response(serializer.data)

# ----- Ajouter un produit au panier -----

@api_view(['POST'])
@permission_classes([AllowAny])
def add_item(request):
    item_id = request.data.get('item_id')
    quantity = int(request.data.get('quantity', 1))

    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
    else:
        cart_code = request.data.get('cart_code')
        if not cart_code:
            return Response({'error': 'cart_code requis pour les utilisateurs non connectés'}, status=400)
        cart, _ = Cart.objects.get_or_create(cart_code=cart_code)

    # Ajout de l'item
    try:
        product = Product.objects.get(id=item_id)
    except Product.DoesNotExist:
        return Response({'error': 'Produit non trouvé'}, status=404)

    cart_item, created = CartItem.objects.get_or_create(
        cart=cart, product=product,
        defaults={'quantity': quantity}
    )

    if not created:
        cart_item.quantity += quantity
        cart_item.save()

    return Response({'message': 'Item ajouté au panier.'}, status=200)

# ----- Vérifier si un produit est dans le panier -----

@api_view(["GET"])
def product_in_cart(request):
    cart_code = request.query_params.get("cart_code")
    product_id = request.query_params.get("product_id")

    if not product_id:
        return Response({"error": "Le product_id est requis."}, status=400)

    try:
        product = Product.objects.get(id=product_id)

        if request.user.is_authenticated:
            cart = Cart.objects.filter(user=request.user, paid=False).first()
        elif cart_code:
            cart = Cart.objects.filter(cart_code=cart_code, user=None, paid=False).first()
        else:
            return Response({'product_in_cart': False})

        if not cart:
            return Response({'product_in_cart': False})

        exists = CartItem.objects.filter(cart=cart, product=product).exists()
        return Response({'product_in_cart': exists})
    
    except Product.DoesNotExist:
        return Response({'product_in_cart': False})



# ----- Associer un panier anonyme à un utilisateur connecté -----

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def associate_cart_to_user(request):
    try:
        cart_code = request.data.get('cart_code')
        user = request.user

        print("== ASSOCIATE USER ==")
        print(f"Utilisateur connecté : {user} (ID: {user.id})")
        print(f"Cart_code reçu : {cart_code}")

        if not cart_code:
            print("❌ Aucun cart_code fourni.")
            return Response({"error": "Le cart_code est requis."}, status=status.HTTP_400_BAD_REQUEST)

        cart = Cart.objects.filter(cart_code=cart_code, user__isnull=True).first()

        if not cart:
            print(f"❌ Aucun panier anonyme trouvé pour le cart_code {cart_code}")
            return Response({"error": "Aucun panier anonyme trouvé avec ce cart_code."}, status=status.HTTP_404_NOT_FOUND)

        print(f"✅ Panier trouvé : {cart}")
        cart.user = user
        cart.save()
        print(f"✅ Panier {cart.cart_code} associé à {user.username}")

        return Response({"message": "Panier associé avec succès."}, status=status.HTTP_200_OK)

    except Exception as e:
        print("❌ Exception attrapée :")
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ----- Vue pour obtenir les statistiques du panier -----

@api_view(["GET"])
def get_cart_stat(request):
    cart_code = request.query_params.get("cart_code")
    if not cart_code:
        return Response({"error": "Le cart_code est requis"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Récupérer le panier en fonction du cart_code
        cart = Cart.objects.get(cart_code=cart_code, paid=False)

        # Logique pour obtenir des statistiques (par exemple, le nombre d'articles dans le panier et le total)
        total_items = cart.items.count()  # Nombre d'articles
        total_price = sum(item.product.price * item.quantity for item in cart.items.all())  # Total du prix

        # Retourner les statistiques sous forme de réponse
        return Response({
            "total_items": total_items,
            "total_price": total_price
        })
    
    except Cart.DoesNotExist:
        return Response({"error": "Panier non trouvé"}, status=status.HTTP_404_NOT_FOUND)

# ----- View pour récupérer tous les produits du panier -----

@api_view(["GET"])
@permission_classes([AllowAny])
def get_cart(request):
    cart_code = request.query_params.get("cart_code")

    if request.user.is_authenticated:
        cart = Cart.objects.filter(user=request.user, paid=False).first()
    elif cart_code:
        cart = Cart.objects.filter(cart_code=cart_code, paid=False).first()
    else:
        return Response({"error": "Cart introuvable"}, status=404)

    if not cart:
        return Response({"error": "Cart vide ou inexistant"}, status=404)

    serializer = CartSerializer(cart)  # 👈 C’est ce qui permet d’avoir sum_total
    return Response(serializer.data)

# -----------View du profile d'un user --------
@api_view(['GET'])
def get_profile(request):
    if request.user.is_authenticated:
        return Response({'username': request.user.username})
    else:
        return Response({'detail': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    
# ----- View pour mettre à jour la quantité d'un item -----
@api_view(["PATCH"])
def update_quantity(request):
    try:
        cartitem_id = request.data.get("item_id")
        quantity = request.data.get("quantity")
        quantity = int(quantity)

        if quantity < 1:
            return Response({"error": "La quantité doit être supérieure à zéro."}, status=status.HTTP_400_BAD_REQUEST)

        cartitem = CartItem.objects.get(id=cartitem_id)
        cartitem.quantity = quantity
        cartitem.save()

        serializer = CartItemSerializer(cartitem)
        return Response({"data": serializer.data, "message": "Quantité mise à jour"}, status=status.HTTP_200_OK)
    
    except CartItem.DoesNotExist:
        return Response({"error": "Article non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ----- View pour supprimer un item du panier -----
@api_view(['POST'])  # Assure-toi que la méthode POST est autorisée
def remove_item(request):
    cart_code = request.query_params.get('cart_code')
    item_id = request.data.get('item_id')  # L'ID du produit à supprimer

    try:
        cart_item = CartItem.objects.get(cart__cart_code=cart_code, id=item_id)
        cart_item.delete()
        return Response({"message": "Item removed successfully"}, status=status.HTTP_200_OK)
    except CartItem.DoesNotExist:
        return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

# ----- View pour créer une commande -----
@api_view(["POST"])
def create_order(request):
    cart_code = request.data.get('cart_code')
    if not cart_code:
        return JsonResponse({"error": "Code de panier manquant"}, status=400)

    try:
        # Récupérer le panier en fonction du code
        cart = Cart.objects.get(cart_code=cart_code)

        # Si l'utilisateur est authentifié, associer la commande à cet utilisateur
        if request.user.is_authenticated:
            order = Order.objects.create(cart=cart, user=request.user)
        else:
            order = Order.objects.create(cart=cart)  # Si invité, laisser user à None

        # Ajouter les articles du panier à la commande
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )

        # Retourner une réponse avec l'ID de la commande
        return JsonResponse({"message": "Commande créée avec succès", "order_id": order.id})
    
    except Cart.DoesNotExist:
        # Si le panier n'existe pas, renvoyer une erreur
        return JsonResponse({"error": "Panier non trouvé"}, status=404)
    
    except Exception as e:
        # Gestion des autres erreurs
        return JsonResponse({"error": str(e)}, status=500)
# --------------- Assossier commande a un user ------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def associate_user_to_order(request):
    order_id = request.data.get('orderId')
    user = request.user

    print("== ASSOCIATE USER ==")
    print(f"User connecté : {user}")
    print(f"orderId reçu : {order_id}")

    try:
        order = Order.objects.get(id=order_id)
        print(f"Commande trouvée : {order}")
        order.user = user
        order.save()
        print("Utilisateur associé à la commande")
        return Response({"message": "Utilisateur associé à la commande."}, status=status.HTTP_200_OK)
    except Order.DoesNotExist:
        print("Commande non trouvée")
        return Response({"error": "Commande introuvable"}, status=status.HTTP_404_NOT_FOUND)


# ---- View Profile ------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email
    })

# ----- View pour afficher les détails de la commande -----
@api_view(["GET"])
def order_details(request, order_id):
    try:
        # Récupère la commande par son ID
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Commande non trouvée"}, status=status.HTTP_404_NOT_FOUND)

    # Structure les données de la commande
    order_data = {
        "id": order.id,
        "status": order.status,
        "cart_code": order.cart.cart_code if order.cart else "No cart",  # Affiche le code du panier s'il existe
        "user": {
            "id": order.user.id if order.user else None,  # Ajoute l'ID de l'utilisateur s'il existe
            "username": order.user.username if order.user else "Invité",  # Affiche le nom d'utilisateur ou "Invité"
        } if order.user else {"id": None, "username": "Invité"},  # Gère le cas où il n'y a pas d'utilisateur
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
            "total_price": item.quantity * item.product.price,
            "product_image": item.product.image.url if item.product.image else None  # Ajout de l'image
        }
        for item in order.cart.items.all()  # Récupère tous les articles associés au panier
    ]
    
    return Response({"order": order_data, "items": order_items}, status=status.HTTP_200_OK)

# ----- View pour mettre à jour le statut d'une commande -----
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

# ----- View pour récupérer le nom de l'utilisateur connecté -----
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_username(request):
    return JsonResponse({'first_name': request.user.first_name})
