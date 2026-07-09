from rest_framework import viewsets, permissions
from .models import TeamMember
from .serializers import TeamMemberSerializer


class TeamMemberViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public, read-only endpoint. Team members are managed from Django admin
    (/admin/team/teammember/) — this just exposes the active ones to the site.
    """
    serializer_class = TeamMemberSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return TeamMember.objects.filter(is_active=True).order_by("order", "name")
