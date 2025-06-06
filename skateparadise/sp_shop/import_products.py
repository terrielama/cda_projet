import json
import os
from django.core.files import File
from django.conf import settings
from .models import Product

def import_products_from_json():
    json_path = os.path.join(os.path.dirname(__file__), 'products.json')

    with open(json_path, encoding='utf-8') as f:
        products = json.load(f)

    for item in products:
        image_path = os.path.join(settings.MEDIA_ROOT, 'product_images', item['image'])

        product = Product(
        name=item['name'],
        description=item['description'],
        price=item['price'],
        category=item['category'],
        stock=item['stock'],
        available=item.get('available', True),
        size=item.get('size', '')  # si le champ existe
    )


        if os.path.exists(image_path):
            with open(image_path, 'rb') as img_file:
                product.image.save(item['image'], File(img_file), save=True)
        else:
            product.save()
