from django.urls import path
from . import views

urlpatterns = [
    path("products", views.products, name="products"),
    path("add_item", views.add_item, name="add_item"),
    path('product_in_cart', views.product_in_cart, name='product_in_cart'),
    path("get_cart", views.get_cart, name="get_cart"),
    path("get_cart_stat", views.get_cart_stat, name="get_cart_stat"),
    path("update_quantity", views.update_quantity, name="update_quantity"),
    path("remove_item", views.remove_item, name="remove_item"),
    path("create_order", views.create_order, name="create_order"),
    path('order/<int:order_id>', views.order_details, name='order-details'),
    path('order/<int:order_id>/status/', views.update_order_status, name='update_order_status'),
    path("get_username", views.get_username, name="get_username"),
    path("associate_cart_to_user/", views.associate_cart_to_user, name="associate_cart_to_user"),
    path('associate_user_to_order/', views.associate_user_to_order, name='associate_user_to_order'),
    path('register/', views.register, name='register'),
    path('profile/', views.profile, name='profile'), 
    path('user/orders/', views.get_user_orders, name='get_user_orders'),








]