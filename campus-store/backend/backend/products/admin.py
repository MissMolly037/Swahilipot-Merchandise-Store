from django.contrib import admin
from .models import Product, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'product_count', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)

    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Products'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock', 'is_featured', 'is_new_arrival', 'created_at')
    list_filter = ('category', 'is_featured', 'is_new_arrival')
    search_fields = ('name', 'description')
    list_editable = ('price', 'stock', 'is_featured', 'is_new_arrival')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('name', 'description', 'category', 'image')}),
        ('Pricing & Inventory', {'fields': ('price', 'stock')}),
        ('Display Options', {'fields': ('is_featured', 'is_new_arrival')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
