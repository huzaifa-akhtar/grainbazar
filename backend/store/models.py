"""
GrainBazar Models — COMPLETE VERSION
Matches the ERD from the proposal (Chapter 4.2):
  Customer, Category, Product, Order, OrderItem, Review
Admin table = Django's built-in User model (no extra table needed)
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


# ─── 1. CUSTOMER ────────────────────────────────────────────────────────────────
class Customer(models.Model):
    """
    Proposal Table 4.2 — Customer Table.
    Stores customer details. No login required — customers identified by email.
    """
    name    = models.CharField(max_length=100)
    email   = models.EmailField(unique=True)          # used to look up order history
    phone   = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.email})"

    class Meta:
        ordering = ['-created_at']


# ─── 2. CATEGORY ────────────────────────────────────────────────────────────────
class Category(models.Model):
    """
    Proposal Table 4.3 — Category Table.
    One Category can have many Products (per ERD).
    Admin manages these from the admin panel.
    """
    name        = models.CharField(max_length=100, unique=True)   # e.g. "Rice", "Wheat"
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']


# ─── 3. PRODUCT (formerly "Grain") ──────────────────────────────────────────────
class Product(models.Model):
    """
    Proposal Table 4.4 — Product Table.
    Renamed from 'Grain' to 'Product' to match the proposal ERD exactly.
    Foreign key to Category (One Category → Many Products).
    """
    name           = models.CharField(max_length=100)
    description    = models.TextField()
    price          = models.DecimalField(max_digits=10, decimal_places=2)   # PKR per kg
    stock_quantity = models.PositiveIntegerField(default=0)
    image_url      = models.URLField(blank=True, null=True)
    category       = models.ForeignKey(
                         Category,
                         on_delete=models.SET_NULL,
                         null=True,
                         related_name='products'
                     )
    created_at     = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.category})"

    class Meta:
        ordering = ['name']


# ─── 4. ORDER ───────────────────────────────────────────────────────────────────
class Order(models.Model):
    """
    Proposal Table 4.5 — Order Table.
    One Customer → Many Orders. One Order → Many OrderItems.
    """
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('confirmed', 'Confirmed'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_CHOICES = [
        ('cod',  'Cash on Delivery'),
        ('paid', 'Paid Online'),     # fake — for demo only
    ]

    customer     = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    order_date   = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default='cod')
    notes        = models.TextField(blank=True)   # customer's special instructions

    def __str__(self):
        return f"Order #{self.id} — {self.customer.name} [{self.status}]"

    class Meta:
        ordering = ['-order_date']


# ─── 5. ORDER ITEM ──────────────────────────────────────────────────────────────
class OrderItem(models.Model):
    """
    Proposal Table 4.6 — Order Items Table.
    One Order can contain many OrderItems (one row per product in the cart).
    This is the CORRECT structure — one Order, many line items.
    """
    order    = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product  = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price    = models.DecimalField(max_digits=10, decimal_places=2)  # price at time of order

    def get_subtotal(self):
        return self.price * self.quantity

    def __str__(self):
        return f"{self.quantity}x {self.product.name} (Order #{self.order.id})"


# ─── 6. REVIEW ──────────────────────────────────────────────────────────────────
class Review(models.Model):
    """
    Proposal Use Case 3.3.8 — Customer Reviews & Ratings.
    A customer can leave one review per product.
    """
    product    = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    customer   = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='reviews')
    rating     = models.PositiveIntegerField(
                     validators=[MinValueValidator(1), MaxValueValidator(5)]
                 )
    comment    = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer.name} → {self.product.name} ({self.rating}★)"

    class Meta:
        # One review per customer per product
        unique_together = ['product', 'customer']
        ordering = ['-created_at']
