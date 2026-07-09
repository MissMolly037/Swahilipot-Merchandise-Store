from django.db import models


class ContactMessage(models.Model):
    SUBJECT_CHOICES = [
        ("Order Inquiry", "Order Inquiry"),
        ("Returns & Exchanges", "Returns & Exchanges"),
        ("Product Question", "Product Question"),
        ("Wholesale / Partnership", "Wholesale / Partnership"),
        ("Feedback", "Feedback"),
        ("Something Else", "Something Else"),
    ]

    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(
        max_length=40, choices=SUBJECT_CHOICES, default="Something Else"
    )
    message = models.TextField()

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} — {self.subject} ({self.created_at:%Y-%m-%d})"
