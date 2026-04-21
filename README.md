# 🌾 GrainBazar — Full Stack FYP (FINAL)

**Stack:** React 18 + Vite (frontend) · Django 4.2 + DRF (backend) · SQLite  
**University:** GCUF — BS Computer Science  
**Authors:** Huzaifa Akhtar · Rana Muhammad Ihtisham Naveed

---

## 📁 Project Structure

```
grainbazar/
├── backend/                          ← Django REST API
│   ├── grainbazar/
│   │   ├── settings.py               ← Env-aware settings (dev + prod)
│   │   └── urls.py
│   ├── store/
│   │   ├── models.py                 ← Customer, Category, Product, Order, OrderItem, Review
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── seed_data.py              ← Sample data loader
│   ├── Procfile                      ← Railway start command
│   ├── railway.json                  ← Railway deploy config
│   ├── runtime.txt                   ← Python 3.11
│   └── requirements.txt
│
└── frontend/                         ← React + Vite SPA
    ├── vercel.json                   ← Fixes page-refresh 404 on Vercel
    ├── .env.example                  ← Copy to .env for local dev
    └── src/
        ├── api.js                    ← Single place to set backend URL
        ├── App.jsx                   ← Routes
        ├── App.css                   ← All styles
        ├── context/CartContext.jsx
        ├── components/Navbar.jsx
        └── pages/
            ├── ProductCatalog.jsx    ← Home — browse + filter + search
            ├── ProductDetailPage.jsx ← Detail + reviews + add to cart
            ├── CartCheckout.jsx      ← Cart + COD + fake pay modal
            ├── ConfirmationPage.jsx  ← Order success
            ├── MyOrders.jsx          ← Order history by email
            └── LoginRegisterPage.jsx ← Register / Login
```

---

## 🚀 Running Locally

### Terminal 1 — Backend

```bash
cd backend

python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac / Linux

pip install -r requirements.txt

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py shell < store/seed_data.py

python manage.py runserver
# → http://localhost:8000
# → http://localhost:8000/admin
```

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## 🌐 Deploying to Production

### Step 1 — Push to GitHub
Make sure both `backend/` and `frontend/` folders are in one GitHub repo.

### Step 2 — Deploy Backend on Railway

1. Go to **railway.app** → New Project → Deploy from GitHub
2. Select your repo → set **Root Directory** to `backend`
3. Railway auto-detects Django and deploys
4. Go to **Variables** tab and add:
   ```
   DJANGO_SECRET_KEY   = (any long random string)
   DJANGO_DEBUG        = False
   CORS_ORIGIN         = https://your-app.vercel.app   ← fill after step 4
   ```
5. Open Railway shell and run:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py shell < store/seed_data.py
   ```
6. Copy your Railway URL: `https://xxxx.up.railway.app`

### Step 3 — Deploy Frontend on Vercel

1. Go to **vercel.com** → Add New Project → Import GitHub repo
2. Set **Root Directory** to `frontend`
3. Build Command: `npm run build`  |  Output Directory: `dist`
4. Under **Environment Variables** add:
   ```
   VITE_API_URL = https://xxxx.up.railway.app/api
   ```
   (your Railway URL from Step 2)
5. Click **Deploy**
6. Copy your Vercel URL → paste it into Railway `CORS_ORIGIN` variable

---

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories/` | All categories |
| GET | `/api/products/` | All products |
| GET | `/api/products/?category=1&search=rice` | Filter + search |
| GET | `/api/products/<id>/` | Product detail |
| GET | `/api/products/<id>/reviews/` | Reviews for product |
| POST | `/api/products/<id>/reviews/` | Submit review |
| POST | `/api/orders/` | Place order (cart checkout) |
| GET | `/api/orders/history/?email=x` | Order history by email |

---

## ✅ Happy Path Demo

1. `http://localhost:3000` → Browse grains
2. Click a grain → Add to Cart
3. Go to Cart → fill name + email → **Cash on Delivery** or **Pay Online (Demo)**
4. Confirmation page with order summary
5. Go to **My Orders** → enter email → see order + status
6. `http://localhost:8000/admin` → update order status to "Delivered"
