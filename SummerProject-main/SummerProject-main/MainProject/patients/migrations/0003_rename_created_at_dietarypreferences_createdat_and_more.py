# Generated by Django 5.0.6 on 2024-08-02 19:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0002_dietarypreferences'),
    ]

    operations = [
        migrations.RenameField(
            model_name='dietarypreferences',
            old_name='created_at',
            new_name='createdAt',
        ),
        migrations.RenameField(
            model_name='dietarypreferences',
            old_name='gluten_free',
            new_name='glutenFree',
        ),
        migrations.RenameField(
            model_name='dietarypreferences',
            old_name='lactose_free',
            new_name='lactoseFree',
        ),
        migrations.RenameField(
            model_name='dietarypreferences',
            old_name='other_details',
            new_name='otherDetails',
        ),
    ]