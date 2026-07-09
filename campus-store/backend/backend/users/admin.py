from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'full_name', 'student_id', 'is_staff', 'created_at')
    list_filter = ('is_staff', 'is_active')
    search_fields = ('username', 'email', 'full_name', 'student_id')
    fieldsets = UserAdmin.fieldsets + (
        ('Account Info', {'fields': ('full_name', 'student_id', 'phone_number', 'delivery_location')}),
    )
