from django.contrib import admin
from .models import TeamMember


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ("name", "role", "order", "is_active", "updated_at")
    list_editable = ("order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "role", "email")
    ordering = ("order", "name")
    fieldsets = (
        (None, {"fields": ("name", "role", "bio", "photo")}),
        ("Contact & socials", {"fields": ("email", "linkedin_url", "twitter_url")}),
        ("Display", {"fields": ("order", "is_active")}),
    )
