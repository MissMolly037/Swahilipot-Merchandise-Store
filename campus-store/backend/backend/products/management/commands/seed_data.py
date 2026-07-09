"""
Management command to seed the database with sample SPH merchandise data.

Usage:
    python manage.py seed_data
    python manage.py seed_data --flush   # clears existing data first
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from products.models import Category, Product

User = get_user_model()

CATEGORIES = [
    {'name': 'T-Shirts', 'slug': 't-shirts', 'description': 'SPH branded tees for everyday wear'},
    {'name': 'Hoodies', 'slug': 'hoodies', 'description': 'Premium hoodies and sweatshirts'},
    {'name': 'Tote Bags', 'slug': 'tote-bags', 'description': 'Eco-friendly tote bags'},
    {'name': 'Caps & Hats', 'slug': 'caps-hats', 'description': 'Caps, beanies and bucket hats'},
    {'name': 'Accessories', 'slug': 'accessories', 'description': 'Stickers, pins and wristbands'},
    {'name': 'Shoes', 'slug': 'shoes', 'description': 'SPH branded footwear'},
]

PRODUCTS = [
    # T-Shirts
    {
        'name': 'SPH Classic Logo Tee',
        'description': 'The iconic Swahilipot Hub logo on a premium 100% cotton tee. Comfortable, durable, and perfect for daily wear. Available in navy and black.',
        'price': '1200.00',
        'stock': 50,
        'category_slug': 't-shirts',
        'is_featured': True,
        'is_new_arrival': False,
    },
    {
        'name': 'SPH Coastal Vibes Tee',
        'description': "Inspired by the beauty of Mombasa's coastline. A relaxed-fit tee with a stunning coastal graphic on the back.",
        'price': '1350.00',
        'stock': 30,
        'category_slug': 't-shirts',
        'is_featured': False,
        'is_new_arrival': True,
    },
    {
        'name': 'SPH Community Tee',
        'description': 'Wear your community pride. This tee features the SPH community motto printed on the chest. Unisex cut.',
        'price': '1100.00',
        'stock': 45,
        'category_slug': 't-shirts',
        'is_featured': True,
        'is_new_arrival': False,
    },
    {
        'name': 'SPH Tech Hub Tee',
        'description': 'For the builders and makers. A sleek minimal tee celebrating the SPH tech community.',
        'price': '1250.00',
        'stock': 20,
        'category_slug': 't-shirts',
        'is_featured': False,
        'is_new_arrival': True,
    },
    # Hoodies
    {
        'name': 'SPH Premium Hoodie',
        'description': 'Stay warm in style. Our heavyweight hoodie is crafted from 80% cotton and 20% polyester fleece. Features a kangaroo pocket and embroidered SPH logo.',
        'price': '3500.00',
        'stock': 25,
        'category_slug': 'hoodies',
        'is_featured': True,
        'is_new_arrival': True,
    },
    {
        'name': 'SPH Zip-Up Hoodie',
        'description': 'Versatile zip-up hoodie with the SPH emblem. Perfect for Mombasa evenings or air-conditioned offices.',
        'price': '3800.00',
        'stock': 15,
        'category_slug': 'hoodies',
        'is_featured': False,
        'is_new_arrival': True,
    },
    {
        'name': 'SPH Lightweight Sweatshirt',
        'description': 'A lighter take on the classic hoodie. Perfect for transitional weather. Crew-neck style with ribbed cuffs.',
        'price': '2500.00',
        'stock': 35,
        'category_slug': 'hoodies',
        'is_featured': True,
        'is_new_arrival': False,
    },
    # Tote Bags
    {
        'name': 'SPH Canvas Tote Bag',
        'description': 'Sturdy canvas tote bag with the SPH logo. Perfect for groceries, books, or beach trips. 100% organic cotton canvas.',
        'price': '900.00',
        'stock': 60,
        'category_slug': 'tote-bags',
        'is_featured': True,
        'is_new_arrival': False,
    },
    {
        'name': 'SPH Large Shopper Tote',
        'description': 'Extra-large capacity tote for the go-getter. Reinforced handles and inner pocket. Features a bold SPH print.',
        'price': '1200.00',
        'stock': 40,
        'category_slug': 'tote-bags',
        'is_featured': False,
        'is_new_arrival': True,
    },
    {
        'name': 'SPH Drawstring Bag',
        'description': 'Lightweight drawstring gym bag. Ideal for workouts, beach days, or quick trips. Water-resistant nylon material.',
        'price': '750.00',
        'stock': 55,
        'category_slug': 'tote-bags',
        'is_featured': False,
        'is_new_arrival': False,
    },
    # Caps
    {
        'name': 'SPH Embroidered Cap',
        'description': 'Classic 6-panel cap with embroidered SPH logo. Adjustable strap for a perfect fit. Available in black and navy.',
        'price': '1500.00',
        'stock': 40,
        'category_slug': 'caps-hats',
        'is_featured': True,
        'is_new_arrival': False,
    },
    {
        'name': 'SPH Bucket Hat',
        'description': 'Stay shaded in coastal style. A reversible bucket hat with SPH branding on both sides.',
        'price': '1300.00',
        'stock': 20,
        'category_slug': 'caps-hats',
        'is_featured': False,
        'is_new_arrival': True,
    },
    {
        'name': 'SPH Beanie',
        'description': 'Cosy knit beanie for cool evenings. Features a subtle embroidered SPH badge on the cuff.',
        'price': '850.00',
        'stock': 30,
        'category_slug': 'caps-hats',
        'is_featured': False,
        'is_new_arrival': False,
    },
    # Accessories
    {
        'name': 'SPH Sticker Pack',
        'description': 'A pack of 10 high-quality vinyl stickers featuring SPH logos, icons, and coastal motifs. Weatherproof and durable.',
        'price': '350.00',
        'stock': 100,
        'category_slug': 'accessories',
        'is_featured': False,
        'is_new_arrival': True,
    },
    {
        'name': 'SPH Enamel Pin Set',
        'description': 'Set of 3 collectible enamel pins. Each pin represents a different SPH community pillar: Tech, Art, and Music.',
        'price': '600.00',
        'stock': 75,
        'category_slug': 'accessories',
        'is_featured': True,
        'is_new_arrival': True,
    },
    {
        'name': 'SPH Wristband',
        'description': 'Silicone wristband with the SPH motto engraved. A subtle way to show your community pride.',
        'price': '250.00',
        'stock': 120,
        'category_slug': 'accessories',
        'is_featured': False,
        'is_new_arrival': False,
    },
    # Shoes
    {
        'name': 'SPH Canvas Sneakers',
        'description': 'Classic canvas sneakers with the SPH logo on the tongue and heel. Vulcanized rubber sole. Unisex sizing.',
        'price': '4500.00',
        'stock': 15,
        'category_slug': 'shoes',
        'is_featured': True,
        'is_new_arrival': True,
    },
    {
        'name': 'SPH Slides',
        'description': 'Comfortable EVA foam slides with the SPH wordmark embossed on the strap. Perfect for beach or casual use.',
        'price': '1800.00',
        'stock': 25,
        'category_slug': 'shoes',
        'is_featured': False,
        'is_new_arrival': True,
    },
]


class Command(BaseCommand):
    help = 'Seeds the database with SPH merchandise sample data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--flush',
            action='store_true',
            help='Delete all existing products and categories before seeding',
        )

    def handle(self, *args, **options):
        if options['flush']:
            self.stdout.write('Flushing existing products and categories...')
            Product.objects.all().delete()
            Category.objects.all().delete()

        # Create categories
        self.stdout.write('Creating categories...')
        category_map = {}
        for cat_data in CATEGORIES:
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={
                    'name': cat_data['name'],
                    'description': cat_data['description'],
                }
            )
            category_map[cat_data['slug']] = cat
            status = 'Created' if created else 'Already exists'
            self.stdout.write(f'  {status}: {cat.name}')

        # Create products
        self.stdout.write('Creating products...')
        created_count = 0
        for prod_data in PRODUCTS:
            category = category_map.get(prod_data['category_slug'])
            _, created = Product.objects.get_or_create(
                name=prod_data['name'],
                defaults={
                    'description': prod_data['description'],
                    'price': prod_data['price'],
                    'stock': prod_data['stock'],
                    'category': category,
                    'is_featured': prod_data['is_featured'],
                    'is_new_arrival': prod_data['is_new_arrival'],
                }
            )
            if created:
                created_count += 1
                self.stdout.write(f'  Created: {prod_data["name"]}')

        # Create superuser if not exists
        if not User.objects.filter(username='admin').exists():
            self.stdout.write('Creating superuser (admin / admin1234)...')
            User.objects.create_superuser(
                username='admin',
                email='admin@swahilipot.org',
                password='admin1234',
                full_name='SPH Administrator',
            )
            self.stdout.write(self.style.SUCCESS('  Superuser created: admin / admin1234'))
        else:
            self.stdout.write('  Superuser "admin" already exists')

        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Seeding complete: {len(CATEGORIES)} categories, {created_count} new products'
        ))
        