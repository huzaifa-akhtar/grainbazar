"""
GrainBazar Serializers — COMPLETE VERSION
Converts model objects ↔ JSON for the API.
"""
from rest_framework import serializers
from .models import Customer, Category, Product, Order, OrderItem, Review


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    avg_rating    = serializers.SerializerMethodField()
    review_count  = serializers.SerializerMethodField()

    class Meta:
        model  = Product
        fields = ['id', 'name', 'description', 'price', 'stock_quantity',
                  'image_url', 'category', 'category_name', 'avg_rating',
                  'review_count', 'created_at']

    def get_avg_rating(self, obj):
        reviews = list(obj.reviews.all())
        if not reviews:
            return None
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

    def get_review_count(self, obj):
        return obj.reviews.count()


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Customer
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model  = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    """Used when READING order data (includes nested items)."""
    items           = OrderItemSerializer(many=True, read_only=True)
    customer_name   = serializers.CharField(source='customer.name', read_only=True)
    customer_email  = serializers.CharField(source='customer.email', read_only=True)

    class Meta:
        model  = Order
        fields = ['id', 'customer', 'customer_name', 'customer_email',
                  'order_date', 'total_amount', 'status', 'payment_method',
                  'notes', 'items']


class PlaceOrderSerializer(serializers.Serializer):
    """
    Used when CREATING an order from the frontend cart.
    Accepts flat customer fields + a list of cart items.
    """
    # Customer details
    customer_name    = serializers.CharField(max_length=100)
    customer_email   = serializers.EmailField()
    customer_phone   = serializers.CharField(max_length=20, required=False, allow_blank=True)
    customer_address = serializers.CharField(required=False, allow_blank=True)

    # Payment
    payment_method   = serializers.ChoiceField(choices=['cod', 'paid'], default='cod')
    notes            = serializers.CharField(required=False, allow_blank=True)

    # Cart items: [{ product_id, quantity }, ...]
    items = serializers.ListField(
        child=serializers.DictField()
    )


class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model  = Review
        fields = ['id', 'product', 'customer', 'customer_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['created_at']  # customer is set by the view via save(customer=...)
