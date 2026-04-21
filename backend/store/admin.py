"""
GrainBazar Admin — COMPLETE VERSION
Admin manages everything from http://localhost:8000/admin/
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Customer, Category, Product, Order, OrderItem, Review


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ['name', 'description']
    search_fields = ['name']


class OrderItemInline(admin.TabularInline):
    """Show order items inside the Order detail page"""
    model  = OrderItem
    extra  = 0
    readonly_fields = ['product', 'quantity', 'price', 'get_subtotal']

    def get_subtotal(self, obj):
        return f"PKR {obj.get_subtotal():,.0f}"
    get_subtotal.short_description = "Subtotal"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display    = ['name', 'category', 'price', 'stock_quantity', 'created_at']
    list_filter     = ['category']
    search_fields   = ['name']
    list_editable   = ['price', 'stock_quantity']  # Edit inline from list view


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display  = ['name', 'email', 'phone', 'created_at']
    search_fields = ['name', 'email']
    readonly_fields = ['created_at']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display    = ['id', 'get_customer_name', 'get_customer_email',
                       'total_amount', 'payment_method', 'status', 'order_date']
    list_filter     = ['status', 'payment_method']
    search_fields   = ['customer__name', 'customer__email']
    list_editable   = ['status']           # Admin updates status directly from list
    readonly_fields = ['total_amount', 'order_date']
    inlines         = [OrderItemInline]    # See all items inside the order

    def get_customer_name(self, obj):
        return obj.customer.name
    get_customer_name.short_description = "Customer"

    def get_customer_email(self, obj):
        return obj.customer.email
    get_customer_email.short_description = "Email"


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display  = ['product', 'customer', 'rating', 'created_at']
    list_filter   = ['rating']
    search_fields = ['product__name', 'customer__name']


# Customize admin site header
admin.site.site_header  = "🌾 GrainBazar Admin"
admin.site.site_title   = "GrainBazar"
admin.site.index_title  = "Store Management"
