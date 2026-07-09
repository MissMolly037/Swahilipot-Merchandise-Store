import io

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer
from products.models import Product
from decimal import Decimal

class OrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.prefetch_related('items__product').all()
        return Order.objects.prefetch_related('items__product').filter(user=user)

    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            total_price = Decimal('0.00')
            order_items_data = []

            for item_data in data['items']:
                try:
                    product = Product.objects.select_for_update().get(id=item_data['product'])
                except Product.DoesNotExist:
                    return Response(
                        {'error': f"Product with id {item_data['product']} not found."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                if product.stock < item_data['quantity']:
                    return Response(
                        {'error': f"Insufficient stock for '{product.name}'. Only {product.stock} left."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                subtotal = product.price * item_data['quantity']
                total_price += subtotal
                order_items_data.append({
                    'product': product,
                    'quantity': item_data['quantity'],
                    'price': product.price,
                })

            delivery_fee = Decimal('5.00')
            order = Order.objects.create(
                user=request.user,
                student_id=data.get('student_id', '') or getattr(request.user, 'student_id', '') or '',
                full_name=data['full_name'],
                email=data['email'],
                phone_number=data['phone_number'],
                delivery_location=data['delivery_location'],
                total_price=total_price + delivery_fee,
                delivery_fee=delivery_fee,
            )

            for item_data in order_items_data:
                OrderItem.objects.create(
                    order=order,
                    product=item_data['product'],
                    quantity=item_data['quantity'],
                    price=item_data['price'],
                )
                item_data['product'].stock -= item_data['quantity']
                item_data['product'].save(update_fields=['stock'])

        response_serializer = OrderSerializer(order, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.prefetch_related('items__product').all()
        return Order.objects.prefetch_related('items__product').filter(user=user)


class OrderReceiptView(APIView):
    """Generates a branded PDF receipt for a single order."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        user = request.user
        queryset = Order.objects.prefetch_related('items__product')
        if not user.is_staff:
            queryset = queryset.filter(user=user)
        order = get_object_or_404(queryset, pk=pk)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            topMargin=28 * mm,
            bottomMargin=20 * mm,
            leftMargin=22 * mm,
            rightMargin=22 * mm,
        )

        primary = colors.HexColor('#1a1a2e')
        muted = colors.HexColor('#6b7280')
        border = colors.HexColor('#e5e7eb')
        status_colors = {
            'pending': colors.HexColor('#f57c00'),
            'processing': colors.HexColor('#1976d2'),
            'shipped': colors.HexColor('#7b1fa2'),
            'delivered': colors.HexColor('#2e7d32'),
            'cancelled': colors.HexColor('#c62828'),
        }

        styles = getSampleStyleSheet()
        brand_style = ParagraphStyle(
            'brand', parent=styles['Title'], alignment=1,
            textColor=primary, fontSize=20, spaceAfter=2,
        )
        sub_style = ParagraphStyle(
            'sub', parent=styles['Normal'], alignment=1,
            textColor=muted, fontSize=9, spaceAfter=18,
        )
        section_style = ParagraphStyle(
            'section', parent=styles['Heading3'],
            textColor=primary, fontSize=10, spaceBefore=16, spaceAfter=6,
        )
        normal = ParagraphStyle('normal', parent=styles['Normal'], fontSize=9.5, textColor=muted, leading=14)
        footnote_style = ParagraphStyle(
            'footnote', parent=styles['Normal'], alignment=1,
            fontSize=8, textColor=muted, spaceBefore=20,
        )

        elements = [
            Paragraph("Swahilipot Hub", brand_style),
            Paragraph("OFFICIAL PAYMENT RECEIPT", sub_style),
        ]

        status_color = status_colors.get(order.status, muted)
        meta_table = Table(
            [
                ["ORDER", "DATE", "STATUS"],
                [
                    f"#{order.id}",
                    order.created_at.strftime("%d %B %Y"),
                    order.status.capitalize(),
                ],
            ],
            colWidths=[55 * mm, 60 * mm, 55 * mm],
        )
        meta_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 8.5),
            ('TEXTCOLOR', (0, 0), (-1, 0), muted),
            ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, 1), 10.5),
            ('TEXTCOLOR', (0, 1), (1, 1), primary),
            ('TEXTCOLOR', (2, 1), (2, 1), status_color),
            ('TOPPADDING', (0, 1), (-1, 1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, 1), 8),
            ('LINEBELOW', (0, 1), (-1, 1), 0.6, border),
        ]))
        elements.append(meta_table)

        elements.append(Paragraph("Delivery Details", section_style))
        elements.append(Paragraph(f"<b><font color='#1a1a2e'>{order.full_name}</font></b>", normal))
        elements.append(Paragraph(order.email, normal))
        elements.append(Paragraph(order.phone_number, normal))
        elements.append(Paragraph(order.delivery_location, normal))

        elements.append(Paragraph("Items", section_style))
        item_rows = [["Item", "Amount"]]
        for item in order.items.all():
            item_rows.append([
                f"{item.product.name} × {item.quantity}",
                f"KSh {item.subtotal:.2f}",
            ])
        items_table = Table(item_rows, colWidths=[120 * mm, 38 * mm])
        items_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 9.5),
            ('TEXTCOLOR', (0, 0), (-1, 0), muted),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#374151')),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('LINEBELOW', (0, 0), (-1, 0), 0.6, border),
            ('TOPPADDING', (0, 1), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 4),
        ]))
        elements.append(items_table)
        elements.append(Spacer(1, 10))

        subtotal = order.total_price - order.delivery_fee
        totals_table = Table(
            [
                ["Subtotal", f"KSh {subtotal:.2f}"],
                ["Delivery Fee", f"KSh {order.delivery_fee:.2f}"],
                ["Total Paid", f"KSh {order.total_price:.2f}"],
            ],
            colWidths=[120 * mm, 38 * mm],
        )
        totals_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, 1), 9.5),
            ('TEXTCOLOR', (0, 0), (-1, 1), muted),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('LINEABOVE', (0, 2), (-1, 2), 0.6, border),
            ('TOPPADDING', (0, 2), (-1, 2), 8),
            ('FONTNAME', (0, 2), (-1, 2), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 2), (-1, 2), 12),
            ('TEXTCOLOR', (0, 2), (-1, 2), primary),
        ]))
        elements.append(totals_table)

        elements.append(Paragraph(
            "This is a system-generated receipt and does not require a signature.",
            footnote_style,
        ))

        doc.build(elements)
        buffer.seek(0)
        return FileResponse(
            buffer,
            as_attachment=True,
            filename=f"receipt-order-{order.id}.pdf",
            content_type='application/pdf',
        )