from django.urls import path
from . import views

urlpatterns = [
    # Produits
    path('products/<int:id>/suggestions/', views.product_suggestions, name='product_suggestions'),
    path('products/random/', views.random_products, name='random_products'),
    path('products/search/', views.search_products, name='search_products'),
    path('products/<str:category>/', views.product_list_by_category, name='products-by-category'),
    path('products/', views.products, name='products'),
    path('product/<int:pk>/', views.product_detail, name='product_detail'),
    

    # Panier
    path('add_item', views.add_item, name='add_item'),
    path('product_in_cart', views.product_in_cart, name='product_in_cart'),
    path('get_cart', views.get_cart, name='get_cart'),
    path('get_cart_stat', views.get_cart_stat, name='get_cart_stat'),
    path('update_quantity', views.update_quantity, name='update_quantity'),
    path('remove_item', views.remove_item, name='remove_item'),
    path('associate_cart_to_user/', views.associate_cart_to_user, name='associate_cart_to_user'),
    path('decrease_item', views.decrease_item, name='decrease_item'),
    path('increase_item', views.increase_item, name='increase_item'),


    # Commandes
    path('create_order', views.create_order, name='create_order'),
    path('order/<int:order_id>/', views.order_details, name='order-details'),
    path('order/<int:order_id>/status/', views.update_order_status, name='update_order_status'),
    path('order/<int:order_id>/update_client_info/', views.update_client_info, name='update_client_info'),
    path('order/tracking/<int:order_id>/', views.get_order_by_id, name='get_order_by_id'),
    path('associate_user_to_order/', views.associate_user_to_order, name='associate_user_to_order'),

    # Utilisateur
    path('register/', views.register, name='register'),
    path('profile/', views.profile, name='profile'),
    path('get_username', views.get_username, name='get_username'),
    path('user/orders/', views.get_user_orders, name='get_user_orders'),

    # Favoris
    path('favorites/', views.favorite_list_create_view, name='favorite-list-create'),
    path('favorites/<int:pk>/', views.favorite_delete_view, name='favorite-delete'),

    # Assistance
    path('contact/', views.contact_message_view, name='contact-message'),
]
