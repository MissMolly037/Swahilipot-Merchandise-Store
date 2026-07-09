from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price', 'subtotal_display')

    def subtotal_display(self, obj):
        return f"KSh {obj.subtotal:.2f}"
    subtotal_display.short_description = 'Subtotal'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'full_name', 'total_price', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'full_name', 'email', 'phone_number')
    readonly_fields = ('created_at', 'updated_at', 'total_price', 'delivery_fee')
    list_editable = ('status',)
    inlines = [OrderItemInline]
    date_hierarchy = 'created_at'
