"""
Store URL Routes — COMPLETE VERSION
"""
from django.urls import path
from . import views

urlpatterns = [
    # Categories
    path('categories/', views.category_list, name='category-list'),

    # Products (renamed from /grains/ to match proposal)
    path('products/',          views.product_list,    name='product-list'),
    path('products/<int:pk>/', views.product_detail,  name='product-detail'),

    # Reviews
    path('products/<int:pk>/reviews/', views.product_reviews, name='product-reviews'),

    # Orders — history/ MUST be listed before the generic orders/ route
    path('orders/history/', views.order_history, name='order-history'),
    path('orders/',         views.place_order,   name='place-order'),
]
