# Generated by Django 5.2.1 on 2025-05-29 12:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sp_shop', '0005_product_size'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='payment_method',
            field=models.CharField(choices=[('CB', 'Carte bancaire'), ('PP', 'PayPal')], default='', max_length=20),
        ),
        migrations.AlterField(
            model_name='product',
            name='image',
            field=models.ImageField(default='products/default-image.png', upload_to='products/'),
        ),
    ]
