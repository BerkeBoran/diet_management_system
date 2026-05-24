"""Add btree index on Food.name to speed up SEO related-foods queries.

Without this index, the food detail view's `name__istartswith` lookups
were doing full table scans on ~4.4k rows, contributing to slow TTFB
(~1-3s) flagged by Ahrefs. With the index, prefix lookups are O(log n).

Safe migration: just creates an index, does not touch row data.
On 4.4k rows the CREATE INDEX completes in well under a second.
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("foods", "0005_delete_foodtranslation_alter_food_options_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="food",
            name="name",
            field=models.CharField(db_index=True, max_length=255),
        ),
    ]
