import json
import os

from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings

from sp_shop.models import Product  

class Command(BaseCommand):
    help = "Importe les produits depuis le fichier products.json"

    def handle(self, *args, **kwargs):
        json_path = os.path.join(os.path.dirname(__file__), '..', '..', 'products.json')
        json_path = os.path.abspath(json_path)

        if not os.path.exists(json_path):
            self.stdout.write(self.style.ERROR(f"Fichier introuvable : {json_path}"))
            return

        with open(json_path, encoding='utf-8') as f:
            products = json.load(f)

        for item in products:
            product, created = Product.objects.get_or_create(
                name=item['name'],
                defaults={
                    'description': item['description'],
                    'price': item['price'],
                    'category': item['category'],
                    'stock': item['stock'],
                    'available': item.get('available', True),
                    'size': item.get('size', ''),
                }
            )

            image_filename = item.get('image')
            if image_filename:
                image_path = os.path.join(settings.MEDIA_ROOT, 'product_images', image_filename)
                if os.path.exists(image_path):
                    with open(image_path, 'rb') as img_file:
                        product.image.save(image_filename, File(img_file), save=True)

            self.stdout.write(self.style.SUCCESS(
                f"{'Créé' if created else 'Déjà existant'} : {product.name}"
            ))
