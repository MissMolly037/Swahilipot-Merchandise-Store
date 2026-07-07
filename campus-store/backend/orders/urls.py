from django.urls import path
from .views import OrderListCreateView, OrderDetailView, OrderReceiptView

urlpatterns = [
    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/<int:pk>/receipt/', OrderReceiptView.as_view(), name='order-receipt'),
]