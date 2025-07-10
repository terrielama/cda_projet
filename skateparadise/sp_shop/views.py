from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Product, Cart, CartItem, Order, OrderItem, User, Favorite, ProductSize
from .serializers import ProductSerializer, CartItemSerializer, CartSerializer, SimpleCartSerializer, OrderSerializer, UserRegisterSerializer, OrderUpdateSerializer,  FavoriteSerializer, ContactMessageSerializer
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework.exceptions import NotFound
import traceback
from django.db.models import Q
import random
from django.db.models import F
from django.dispatch import receiver
from django.db import transaction
from django.utils.translation import gettext as _
import bleach

# -- Sécurité : Nettoyer les champs texte ------
def clean_input(text):
    return bleach.clean(text, tags=[], attributes={}, strip=True)

#----- View pour creer un user (Register) ------

@api_view(["POST"])
def register(request):
    data = request.data.copy()
    # Nettoyer les champs texte importants (exemple : username, email)
    if 'username' in data:
        data['username'] = clean_input(data['username'])
    if 'email' in data:
        data['email'] = clean_input(data['email'])

    serializer = UserRegisterSerializer(data=data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        except Exception:
            return Response({"error": "Erreur serveur lors de la création de l'utilisateur."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
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

    print("Données reçues:", request.data)  
    
    if not item_id:
        return Response({'error': "L'ID du produit est requis."}, status=400)
    
    try:
        quantity_to_add = int(request.data.get('quantity', 1))
        if quantity_to_add <= 0:
            raise ValueError
    except (TypeError, ValueError):
        return Response({'error': 'Quantité invalide.'}, status=400)

    try:
        product = Product.objects.get(id=item_id)
    except Product.DoesNotExist:
        return Response({'error': 'Produit non trouvé.'}, status=404)

    # Si produit a des tailles, size est obligatoire
    if product.sizes and not size:
        return Response({'error': 'Le champ size est requis pour ce produit.'}, status=400)

    # Récupération du panier
    if request.user.is_authenticated:
        # Suppression de paid=False
        cart, _ = Cart.objects.get_or_create(user=request.user)  
    else:
        if not cart_code:
            return Response({'error': 'cart_code requis pour les utilisateurs non connectés'}, status=400)
        # Suppression de paid=False
        cart = Cart.objects.filter(cart_code=cart_code).first()
        if not cart:
            cart = Cart.objects.create(cart_code=cart_code, user=None)

    # Cherche s'il y a déjà cet item dans le panier
    existing_item = CartItem.objects.filter(cart=cart, product=product, size=size).first()
    current_qty_in_cart = existing_item.quantity if existing_item else 0

    # --- GESTION STOCK PAR TAILLE ---
    if size:
        try:
            product_size = ProductSize.objects.get(product=product, size=size)
        except ProductSize.DoesNotExist:
            return Response({'error': 'Taille non trouvée pour ce produit.'}, status=400)

        new_total_qty = current_qty_in_cart + quantity_to_add

        # Vérification stock disponible (le stock actuel doit être au moins quantity_to_add)
        if quantity_to_add > product_size.stock:
            return Response({'error': f'Stock insuffisant pour la taille {size} : {product_size.stock} disponible.'}, status=400)

        # Mise à jour du panier
        if existing_item:
            existing_item.quantity = new_total_qty
            existing_item.save()
        else:
            CartItem.objects.create(cart=cart, product=product, size=size, quantity=quantity_to_add)

        # Mise à jour du stock dans ProductSize
        product_size.stock -= quantity_to_add
        product_size.save()

    else:
        # Produit sans taille : on vérifie le stock global produit
        new_total_qty = current_qty_in_cart + quantity_to_add
        if quantity_to_add > product.stock:
            return Response({'error': f'Stock insuffisant : {product.stock} disponible.'}, status=400)

        if existing_item:
            existing_item.quantity = new_total_qty
            existing_item.save()
        else:
            CartItem.objects.create(cart=cart, product=product, size=None, quantity=quantity_to_add)

        product.stock -= quantity_to_add
        product.save()

    return Response({'message': 'Item ajouté au panier.'}, status=200)


@api_view(["GET"])
def product_in_cart(request):
    cart_code = request.query_params.get("cart_code")
    product_id = request.query_params.get("product_id")
    size = request.query_params.get("size")  # Ajout du filtre taille

    if not product_id:
        return Response({"error": "Le product_id est requis."}, status=400)

    try:
        product = Product.objects.get(id=product_id)

        if request.user.is_authenticated:
            # Suppression de paid=False
            cart = Cart.objects.filter(user=request.user).first()
        elif cart_code:
            # Suppression de paid=False
            cart = Cart.objects.filter(cart_code=cart_code, user=None).first()
        else:
            return Response({'quantity': 0})

        if not cart:
            return Response({'quantity': 0})

        # Filtrer sur taille si taille donnée
        if size:
            cart_item = CartItem.objects.filter(cart=cart, product=product, size=size).first()
        else:
            cart_item = CartItem.objects.filter(cart=cart, product=product).first()

        if cart_item:
            return Response({'quantity': cart_item.quantity})
        else:
            return Response({'quantity': 0})

    except Product.DoesNotExist:
        return Response({'quantity': 0})




# ----- Associer un panier anonyme à un utilisateur connecté -----

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def associate_cart_to_user(request):
    cart_code = request.data.get('cart_code')
    if not cart_code:
        return Response({"error": "Cart code manquant"}, status=400)

    try:
        cart = Cart.objects.get(cart_code=cart_code)
        cart.user = request.user
        cart.save()
        return Response({"message": "Panier associé à l'utilisateur"})
    except Cart.DoesNotExist:
        return Response({"error": "Panier non trouvé"}, status=404)

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


    cart = Cart.objects.filter(cart_code=cart_code).first()

    if not cart:
        return Response({"error": "Panier vide ou inexistant"}, status=404)

    # Si l'utilisateur est connecté et que le panier n'est pas encore lié à un utilisateur
    if request.user.is_authenticated and cart.user is None:
        cart.user = request.user
        cart.save()

    serializer = CartSerializer(cart)
    return Response(serializer.data)

# ---------  Diminuer la quantité d’un article (Stock)  ---------------

@api_view(['POST'])
@permission_classes([AllowAny])
def decrease_item(request):
    item_id = request.data.get('item_id')
    if not item_id:
        return Response({'error': 'ID requis'}, status=400)

    try:
        item = CartItem.objects.get(id=item_id)
    except CartItem.DoesNotExist:
        return Response({'error': 'Article introuvable'}, status=404)

    # Réajuster le stock du produit
    if item.size:
        try:
            product_size = ProductSize.objects.get(product=item.product, size=item.size)
            product_size.stock += 1
            product_size.save()
        except ProductSize.DoesNotExist:
            return Response({'error': 'Taille non trouvée.'}, status=400)
    else:
        item.product.stock += 1
        item.product.save()

    # Réduire la quantité ou supprimer l’article du panier
    if item.quantity > 1:
        item.quantity -= 1
        item.save()
    else:
        item.delete()

    # Mise à jour de la disponibilité du produit
    item.product.update_availability()

    return Response({
        'message': 'Quantité diminuée',
        'produit': item.product.name,
        'taille': item.size if item.size else None,
        'quantité_restante': item.quantity if item.id else 0
    }, status=200)


# --------- Augmenter la quantité d’un article (Stock)  ---------------

@api_view(['POST'])
@permission_classes([AllowAny])
def increase_item(request):
    item_id = request.data.get('item_id')
    if not item_id:
        return Response({'error': 'ID requis'}, status=400)

    try:
        item = CartItem.objects.get(id=item_id)
    except CartItem.DoesNotExist:
        return Response({'error': 'Article introuvable'}, status=404)

    # Vérification du stock disponible
    if item.size:
        try:
            product_size = ProductSize.objects.get(product=item.product, size=item.size)
            if product_size.stock < 1:
                return Response({'error': 'Stock insuffisant pour cette taille.'}, status=400)
            product_size.stock -= 1
            product_size.save()
        except ProductSize.DoesNotExist:
            return Response({'error': 'Taille non trouvée.'}, status=400)
    else:
        if item.product.stock < 1:
            return Response({'error': 'Stock insuffisant pour ce produit.'}, status=400)
        item.product.stock -= 1
        item.product.save()

    # Augmenter la quantité
    item.quantity += 1
    item.save()

    # Mise à jour de la disponibilité
    item.product.update_availability()

    return Response({
        'message': 'Quantité augmentée',
        'produit': item.product.name,
        'taille': item.size if item.size else None,
        'quantité_totale': item.quantity
    }, status=200)


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
    if not cart_code:
        return Response({"error": "Code de panier manquant"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        cart = Cart.objects.get(cart_code=cart_code)

        with transaction.atomic():
            order = Order.objects.create(
                cart=cart,
                user=request.user if request.user.is_authenticated else None
            )

            for item in cart.cart_items.select_related('product').all():
                product = item.product
                product.refresh_from_db()

                if product.stock < item.quantity:
                    raise ValueError(f"Stock insuffisant pour {product.name} (disponible : {product.stock})")

                # Mise à jour atomique du stock
                product.stock = F('stock') - item.quantity
                product.save()
                product.refresh_from_db()

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item.quantity,
                    price=product.price,
                    size=item.size
                )

                if product.stock == 0:
                    product.available = False
                    product.save()

            return Response({
                "message": "Commande créée avec succès",
                "order_id": order.id
            }, status=status.HTTP_201_CREATED)

    except Cart.DoesNotExist:
        return Response({"error": "Panier non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except ValueError as ve:
        return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": "Erreur serveur: " + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --------------- Assossier commande a un user ------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def associate_user_to_order(request):
    order_id = request.data.get('orderId')
    user = request.user

    print("== ASSOCIATE USER ==")
    print(f"User connecté : {user}")
    print(f"orderId reçu : {order_id}")

    if not order_id:
        return Response({"error": "orderId manquant dans la requête"}, status=status.HTTP_400_BAD_REQUEST)

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
                "size": item.size  
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
                "size": item.size  
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

    order.status = new_status  
    order.save() 

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
        return Response({"error": "Commande introuvable"}, status=status.HTTP_404_NOT_FOUND)

    serializer = OrderUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        print(serializer.errors)  
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data

    order.first_name = data['first_name']
    order.last_name = data['last_name']
    order.address = data['address']
    order.phone = data['phone']
    order.payment_method = data['payment_method']

    order.save()

    return Response({"message": "Commande mise à jour avec succès"})

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


# -------- Contact Assistance ---------------
User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def contact_message_view(request):
    serializer = ContactMessageSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data.get('email')
        user = None
        if email:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                pass
        if user:
            serializer.save(user=user)
        else:
            serializer.save()
        return Response({'success': 'Message reçu !'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)