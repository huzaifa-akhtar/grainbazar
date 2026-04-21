"""
seed_data.py — Populate the database with sample data for demo/testing.

Run with:  python manage.py shell < store/seed_data.py
"""
from store.models import Category, Product

# ── Categories (matches proposal Table 4.3) ──
cats = [
    ("Rice",   "All varieties of rice — Basmati, IRRI, Super Kernel"),
    ("Wheat",  "Wheat grains and flour types"),
    ("Corn",   "Maize and corn products"),
    ("Pulses", "Lentils, chickpeas, mung beans"),
    ("Millet", "Pearl millet and sorghum varieties"),
    ("Barley", "Barley for food and feed use"),
]

category_objs = {}
for name, desc in cats:
    obj, _ = Category.objects.get_or_create(name=name, defaults={"description": desc})
    category_objs[name] = obj
    print(f"Category: {name}")

# ── Products (matches proposal Table 4.4) ──
products = [
    ("Super Basmati Rice",   "Extra-long grain, fragrant Basmati from Punjab. Perfect for biryani.", 280, 500, "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400", "Rice"),
    ("IRRI-6 Rice",          "High-yield medium-grain rice, great for everyday cooking.",            180, 800, "https://images.unsplash.com/photo-1536304993881-ff86e0c9ef1a?w=400", "Rice"),
    ("Whole Wheat Grain",    "Freshly harvested Punjab wheat, ideal for chakki flour.",             120, 1200,"https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400", "Wheat"),
    ("Fine Wheat Flour",     "Stone-ground wheat flour, excellent for roti and bread.",             140, 600, "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=400", "Wheat"),
    ("Yellow Maize",         "Dried yellow corn grain, used for animal feed and corn flour.",        80, 900, "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400", "Corn"),
    ("Mung Dal (Green)",     "Small green mung beans, rich in protein. Packed fresh.",             220, 400, "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=400", "Pulses"),
    ("Masoor Dal (Red)",     "Red lentils — quick cooking, great for dal soup.",                   200, 350, "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400", "Pulses"),
    ("Chana (Chickpeas)",    "Whole chickpeas, dried and cleaned. Great for chana masala.",        190, 450, "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400", "Pulses"),
    ("Pearl Millet (Bajra)", "Nutritious pearl millet from Sindh. Gluten-free grain.",             100, 700, "https://images.unsplash.com/photo-1605522324823-f2d2cb4d3bac?w=400", "Millet"),
    ("Feed Barley",          "Two-row barley grain, clean and dried. Ideal for livestock.",        110, 600, "https://images.unsplash.com/photo-1601472544304-b2e2dae9db45?w=400", "Barley"),
]

for name, desc, price, stock, image, cat_name in products:
    obj, created = Product.objects.get_or_create(
        name=name,
        defaults={
            "description":    desc,
            "price":          price,
            "stock_quantity": stock,
            "image_url":      image,
            "category":       category_objs[cat_name],
        }
    )
    print(f"{'Created' if created else 'Exists '}: {name}")

print("\n✅ Seed data loaded! Visit http://localhost:8000/admin to see it.")
