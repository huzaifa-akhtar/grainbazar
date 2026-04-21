"""
GrainBazar API Views — COMPLETE VERSION
Covers the full Happy Path + Reviews + Order History.
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import Customer, Category, Product, Order, OrderItem, Review
from .serializers import (
    CategorySerializer, ProductSerializer, CustomerSerializer,
    OrderSerializer, PlaceOrderSerializer, ReviewSerializer
)


# ════════════════════════════════════════════════════════════
#  CATEGORY ENDPOINTS
# ════════════════════════════════════════════════════════════

@api_view(['GET'])
def category_list(request):
    """GET /api/categories/ — list all grain categories"""
    categories = Category.objects.all()
    return Response(CategorySerializer(categories, many=True).data)


# ════════════════════════════════════════════════════════════
#  PRODUCT ENDPOINTS
# ════════════════════════════════════════════════════════════

@api_view(['GET'])
def product_list(request):
    """
    GET /api/products/
    Optional filters: ?category=<id>  ?search=<term>
    """
    products = Product.objects.select_related('category').prefetch_related('reviews')

    category_id = request.query_params.get('category')
    search      = request.query_params.get('search')

    if category_id:
        products = products.filter(category_id=category_id)
    if search:
        products = products.filter(name__icontains=search)

    return Response(ProductSerializer(products, many=True).data)


@api_view(['GET'])
def product_detail(request, pk):
    """GET /api/products/<id>/ — single product with reviews"""
    try:
        product = Product.objects.select_related('category').prefetch_related('reviews__customer').get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response(ProductSerializer(product).data)


# ════════════════════════════════════════════════════════════
#  ORDER ENDPOINTS  (the Happy Path core)
# ════════════════════════════════════════════════════════════

@api_view(['POST'])
def place_order(request):
    """
    POST /api/orders/
    Body: { customer_name, customer_email, customer_phone, customer_address,
            payment_method, notes, items: [{product_id, quantity}, ...] }

    - Creates or retrieves Customer by email
    - Validates stock for every item
    - Creates Order + OrderItems in one atomic transaction
    - Deducts stock from each Product
    """
    serializer = PlaceOrderSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data  = serializer.validated_data
    items = data.get('items', [])

    if not items:
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

    # ── Validate every item before touching the DB ──
    validated_items = []
    for item in items:
        try:
            product  = Product.objects.get(pk=item['product_id'])
            quantity = int(item['quantity'])
        except (Product.DoesNotExist, KeyError, ValueError):
            return Response({'error': f"Invalid product or quantity in cart"}, status=400)

        if quantity <= 0:
            return Response({'error': f"Quantity must be positive for {product.name}"}, status=400)

        if product.stock_quantity < quantity:
            return Response(
                {'error': f'Only {product.stock_quantity} kg of "{product.name}" left in stock.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        validated_items.append({'product': product, 'quantity': quantity})

    # ── Create everything in one atomic block ──
    with transaction.atomic():
        # Get or create customer by email
        customer, _ = Customer.objects.get_or_create(
            email=data['customer_email'],
            defaults={
                'name':    data['customer_name'],
                'phone':   data.get('customer_phone', ''),
                'address': data.get('customer_address', ''),
            }
        )
        # Update name/phone/address in case they changed
        customer.name    = data['customer_name']
        customer.phone   = data.get('customer_phone', customer.phone)
        customer.address = data.get('customer_address', customer.address)
        customer.save()

        # Calculate total
        total = sum(i['product'].price * i['quantity'] for i in validated_items)

        # Create the Order
        order = Order.objects.create(
            customer       = customer,
            total_amount   = total,
            payment_method = data.get('payment_method', 'cod'),
            notes          = data.get('notes', ''),
        )

        # Create OrderItems and deduct stock
        for i in validated_items:
            OrderItem.objects.create(
                order    = order,
                product  = i['product'],
                quantity = i['quantity'],
                price    = i['product'].price,   # lock price at time of order
            )
            i['product'].stock_quantity -= i['quantity']
            i['product'].save()

    # Re-fetch order with items prefetched so serializer returns full nested response
    order = Order.objects.prefetch_related('items__product').get(pk=order.pk)
    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def order_history(request):
    """
    GET /api/orders/?email=customer@email.com
    Proposal Use Case 3.3.7 — View Order History
    Returns all orders for a customer email.
    """
    email = request.query_params.get('email')
    if not email:
        return Response({'error': 'Provide ?email= parameter'}, status=400)

    try:
        customer = Customer.objects.get(email=email)
    except Customer.DoesNotExist:
        return Response([], status=200)   # No orders yet — return empty list

    orders = Order.objects.filter(customer=customer).prefetch_related('items__product')
    return Response(OrderSerializer(orders, many=True).data)


# ════════════════════════════════════════════════════════════
#  REVIEW ENDPOINTS
# ════════════════════════════════════════════════════════════

@api_view(['GET', 'POST'])
def product_reviews(request, pk):
    """
    GET  /api/products/<id>/reviews/ — list reviews for a product
    POST /api/products/<id>/reviews/ — submit a review
    Body for POST: { customer_email, rating (1-5), comment }
    """
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

    if request.method == 'GET':
        reviews = Review.objects.filter(product=product).select_related('customer')
        return Response(ReviewSerializer(reviews, many=True).data)

    # POST — submit a review
    email = request.data.get('customer_email')
    if not email:
        return Response({'error': 'customer_email is required'}, status=400)

    try:
        customer = Customer.objects.get(email=email)
    except Customer.DoesNotExist:
        return Response({'error': 'Place an order first before leaving a review.'}, status=400)

    # Check if review already exists
    if Review.objects.filter(product=product, customer=customer).exists():
        return Response({'error': 'You have already reviewed this product.'}, status=400)

    serializer = ReviewSerializer(data={
        'product': product.id,
        'rating':  request.data.get('rating'),
        'comment': request.data.get('comment', ''),
    })
    if serializer.is_valid():
        serializer.save(product=product, customer=customer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=400)
