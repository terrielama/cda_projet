from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Product, Cart, CartItem, Order, OrderItem, User, Favorite
from .serializers import ProductSerializer, CartItemSerializer, CartSerializer, SimpleCartSerializer, OrderSerializer, UserRegisterSerializer, OrderUpdateSerializer,  FavoriteSerializer
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework.exceptions import NotFound
import traceback
from django.db.models import Q
import random


#----- View pour creer un user (Register) ------

@api_view(["POST"])
def register(request):
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print("Erreur lors de la création de l'utilisateur :")
            print(traceback.format_exc())  # Affiche la stack trace complète
            return Response({"error": "Erreur serveur lors de la création de l'utilisateur."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        print("Serializer non valide :", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

# ----- View des produits --------------
@api_view(["GET"])
def products(request):
    products = Product.objects.select_related('category').all()  # Important !
    serializer = ProductSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
def search_products(request):
    search_query = request.GET.get('search', '').strip()
    if search_query:
        products = Product.objects.filter(name__icontains=search_query)
    else:
        products = Product.objects.none()
    serializer = ProductSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
def product_list_by_category(request, category):
    try:
        search_query = request.GET.get('search', '').strip()

        # Filtrer par catégorie (champ CharField simple, insensible à la casse)
        products = Product.objects.filter(category__iexact=category)

        # Filtrer par nom de produit avec recherche approximative (partielle, insensible à la casse)
        if search_query:
            products = products.filter(name__icontains=search_query)

        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ----- Ajouter un produit au panier -----


@api_view(['POST'])
@permission_classes([AllowAny])
def add_item(request):
    item_id = request.data.get('item_id')
    size = request.data.get('size')
    cart_code = request.data.get('cart_code')

    # Vérification des champs requis
    if not item_id:
        return Response({'error': "L'ID du produit est requis."}, status=400)
    if not size:
        return Response({'error': 'Le champ size est requis.'}, status=400)

    try:
        quantity = int(request.data.get('quantity', 1))
    except (TypeError, ValueError):
        return Response({'error': 'Quantité invalide.'}, status=400)

    # Récupérer ou créer le panier
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user, paid=False)
    else:
        if not cart_code:
            return Response({'error': 'cart_code requis pour les utilisateurs non connectés'}, status=400)

        # Récupère le panier si cart_code existe déjà, sinon le crée
        cart = Cart.objects.filter(cart_code=cart_code).first()
        if not cart:
            cart = Cart.objects.create(cart_code=cart_code, user=None, paid=False)

    # Vérifie que le produit existe
    try:
        product = Product.objects.get(id=item_id)
    except Product.DoesNotExist:
        return Response({'error': 'Produit non trouvé.'}, status=404)

    # Vérifie si le produit (avec la même taille) est déjà dans le panier
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        size=size,
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

    if not cart_code:
        return Response({"error": "Cart code manquant"}, status=400)

    # Essayer de récupérer le panier avec le cart_code
    cart = Cart.objects.filter(cart_code=cart_code, paid=False).first()

    if not cart:
        return Response({"error": "Panier vide ou inexistant"}, status=404)

    # Si l'utilisateur est connecté et que le panier n'est pas encore lié à un utilisateur
    if request.user.is_authenticated and cart.user is None:
        cart.user = request.user
        cart.save()

    serializer = CartSerializer(cart)
    return Response(serializer.data)


# -----------View du profile d'un user --------

@api_view(['GET'])
def get_profile(request):
    if request.user.is_authenticated:
        return Response({'username': request.user.username})
    else:
        return Response({'detail': 'Utilisateur non authentifié'}, status=status.HTTP_401_UNAUTHORIZED)
    
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

@api_view(['POST'])  
def remove_item(request):
    cart_code = request.query_params.get('cart_code')
    item_id = request.data.get('item_id')  # L'ID du produit à supprimer

    try:
        cart_item = CartItem.objects.get(cart__cart_code=cart_code, id=item_id)
        cart_item.delete()
        return Response({"message": "Article retiré du panier avec succès"}, status=status.HTTP_200_OK)
    except CartItem.DoesNotExist:
        return Response({"error": "Article non trouvé"}, status=status.HTTP_404_NOT_FOUND)

# ----- View pour créer une commande -----

@api_view(["POST"])
def create_order(request):
    cart_code = request.data.get('cart_code')
    print(f"Création de la commande pour cart_code: {cart_code}")

    if not cart_code:
        return JsonResponse({"error": "Code de panier manquant"}, status=400)

    try:
        cart = Cart.objects.get(cart_code=cart_code)
        print(f"Panier trouvé avec {cart.cart_items.count()} articles")

        if request.user.is_authenticated:
            order = Order.objects.create(cart=cart, user=request.user)
            print(f"Commande créée avec user id={request.user.id}")
        else:
            order = Order.objects.create(cart=cart)
            print("Commande créée pour invité")

        # Création des OrderItem à partir des CartItem liés au panier
        for item in cart.cart_items.all():
            print(f"Ajout de l'article {item.product.name} x {item.quantity}")
            order_item = OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )
            print(f"OrderItem créé : {order_item}")

        print("Tous les articles ont été ajoutés à la commande.")
        return JsonResponse({"message": "Commande créée avec succès", "order_id": order.id})
    
    except Cart.DoesNotExist:
        print("Panier non trouvé")
        return JsonResponse({"error": "Panier non trouvé"}, status=404)
    
    except Exception as e:
        print(f"Erreur lors de la création de la commande : {e}")
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
@permission_classes([AllowAny])
def order_details(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Commande non trouvée"}, status=status.HTTP_404_NOT_FOUND)

    order_data = {
        "id": order.id,
        "status": order.status,
        "cart_code": order.cart.cart_code if order.cart else "No cart",
        "user": {
            "id": order.user.id,
            "username": order.user.username
        } if order.user else {"id": None, "username": "Invité"},
        "created_at": order.created_at,
        "updated_at": order.updated_at,
        "payment_method": order.payment_method,
    }

    order_items = []

    if order.cart:
        # Utiliser le bon related_name cart_items
        items = order.cart.cart_items.all()
        print(f"Items du panier (cart_code={order.cart.cart_code}): {items}")
        for item in items:
            order_items.append({
                "product_name": item.product.name,
                "quantity": item.quantity,
                "price": float(item.product.price) if hasattr(item.product, 'price') else 0,
                "total_price": float(item.product.price * item.quantity) if hasattr(item.product, 'price') else 0,
                "product_image": item.product.image.url if item.product.image else None,
            })
    else:
        # fallback : récupérer les OrderItems liés à la commande
        items = order.items.all()
        print(f"Items de la commande directement: {items}")
        for item in items:
            order_items.append({
                "product_name": item.product.name,
                "quantity": item.quantity,
                "price": float(item.price),
                "total_price": float(item.price * item.quantity),
                "product_image": item.product.image.url if item.product.image else None,
            })

    print(f"Order {order.id} a {len(order_items)} items retournés.")
    return Response(
        {
            "order": order_data,
            "items": order_items
        },
        status=status.HTTP_200_OK
    )



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
    user = request.user
    return JsonResponse({
        'first_name': user.first_name,
        'last_name': user.last_name
    })


# ----- View de la page Profil utilisateur -----

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_orders(request):
    user = request.user
    orders = Order.objects.filter(user=user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

# --------- View Tracking_code pour un suivis de commande ----------

@api_view(['GET'])
def get_order_by_id(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        serializer = OrderSerializer(order)
        return Response(serializer.data)
    except Order.DoesNotExist:
        return Response({'error': 'Commande introuvable'}, status=status.HTTP_404_NOT_FOUND)



# --------- View Info -------------

@api_view(['POST'])
@permission_classes([AllowAny])
def update_client_info(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = OrderUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        print(serializer.errors)  # Affiche les erreurs dans la console
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data

    order.first_name = data['first_name']
    order.last_name = data['last_name']
    order.address = data['address']
    order.phone = data['phone']
    order.payment_method = data['payment_method']

    order.save()

    return Response({"message": "Order updated successfully"})

# -------- Fav  ------------------

@api_view(['GET', 'POST'])
def favorite_list_create_view(request):
    if request.method == 'GET':
        session_code = request.query_params.get('session_code')
        favorites = Favorite.objects.filter(session_code=session_code)
        serializer = FavoriteSerializer(favorites, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        session_code = request.data.get('session_code')
        data = request.data.copy()
        data['session_code'] = session_code
        serializer = FavoriteSerializer(data=data)
        if serializer.is_valid():
            serializer.save(session_code=session_code)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['DELETE'])
def favorite_delete_view(request, pk):
    session_code = request.query_params.get('session_code')
    try:
        favorite = Favorite.objects.get(pk=pk, session_code=session_code)
    except Favorite.DoesNotExist:
        return Response({"detail": "Favorite not found."}, status=status.HTTP_404_NOT_FOUND)

    favorite.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'detail': 'Produit non trouvé'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ProductSerializer(product)
    return Response(serializer.data)


# ------------ Suggestion de produit  ---------------

@api_view(['GET'])
def product_suggestions(request, id):
    try:
        product = Product.objects.get(id=id)
    except Product.DoesNotExist:
        return Response({"detail": "Produit non trouvé."}, status=status.HTTP_404_NOT_FOUND)
    
    # 1. Cherche produits de la même catégorie (hors le produit courant)
    suggested_products = Product.objects.filter(
        category=product.category
    ).exclude(id=product.id)[:4]

    if suggested_products.count() < 4:
        # Complète avec produits aléatoires hors ceux déjà pris et hors produit actuel
        excluded_ids = list(suggested_products.values_list('id', flat=True)) + [product.id]
        remaining_products = Product.objects.exclude(id__in=excluded_ids)
        remaining_count = remaining_products.count()
        if remaining_count > 0:
            random_needed = 4 - suggested_products.count()
            random_indexes = random.sample(range(remaining_count), min(random_needed, remaining_count))
            random_products = [remaining_products[i] for i in random_indexes]
            suggested_products = list(suggested_products) + random_products

    serializer = ProductSerializer(suggested_products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def random_products(request):
    count = Product.objects.count()
    if count == 0:
        return Response([], status=status.HTTP_200_OK)

    all_products = list(Product.objects.all())
    random_indexes = random.sample(range(count), min(4, count))
    random_products = [all_products[i] for i in random_indexes]

    serializer = ProductSerializer(random_products, many=True)
    return Response(serializer.data)











 