# Aarchi Fashion — E-Commerce Website

Luxury Indian fashion e-commerce site with 3D rotating product carousel, WhatsApp checkout, and Firebase-powered admin panel.

## 🚀 Deploy to Vercel

### Step 1 — Push to GitHub

```bash
cd shopsitenew
git init
git add .
git commit -m "Aarchi Fashion — Firebase build"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/archifashion.git
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New…" → "Project"**
3. Import your `archifashion` repository
4. Configure:
   - **Framework Preset**: `Other`
   - **Build Command**: *(leave blank)*
   - **Output Directory**: `.`
5. Click **Deploy**

Your site will be live at `https://archifashion.vercel.app` (or similar) within seconds.

> **Custom Domain:** Go to **Project Settings → Domains** to add your own domain (e.g., `archifashion.in`).

---

## 🔧 Firebase Setup (Required)

Your Firebase project `archifashion-f27eb` needs these services enabled:

### 1. Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/project/archifashion-f27eb/firestore)
2. Click **Create Database**
3. Choose **Start in test mode** (or use the rules below for production)
4. Select a region close to your users (e.g., `asia-south1` for India)

**Production Firestore Rules:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read products and settings
    match /products/{docId} {
      allow read: if true;
      allow write, delete: if request.auth != null;
    }
    match /settings/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 2. Authentication

1. Go to [Firebase Console → Authentication](https://console.firebase.google.com/project/archifashion-f27eb/authentication)
2. Click **Get Started**
3. Enable **Email/Password** provider
4. Go to **Users** tab → **Add user**
5. Enter your admin email (e.g., `admin@archifashion.com`) and a strong password

### 3. Storage

1. Go to [Firebase Console → Storage](https://console.firebase.google.com/project/archifashion-f27eb/storage)
2. Click **Get Started**
3. Choose your rules (test or production)

**Production Storage Rules:**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write, delete: if request.auth != null;
    }
  }
}
```

### 4. Add Vercel Domain to Firebase

1. Go to [Firebase Console → Authentication → Settings](https://console.firebase.google.com/project/archifashion-f27eb/authentication/settings)
2. Under **Authorized domains**, click **Add domain**
3. Add your Vercel domain: `archifashion.vercel.app` (or whatever Vercel assigns)
4. If using a custom domain, add that too

---

## 🎛️ How to Use the Admin Panel

1. **Double-click** the invisible zone to the left of the logo (top-left corner of the header)
2. Enter your Firebase Auth **email** and **password**
3. You can now:
   - Change the shop name and address
   - Upload a hero background image
   - Add new products with images
   - Delete existing products

---

## 📁 Project Structure

```
shopsitenew/
├── index.html        ← Complete website (HTML + CSS + JS + Firebase)
├── vercel.json       ← Vercel deployment config
└── README.md         ← This file
```

## ✨ Features

- **3D Rotating Carousel** — Drag, swipe, or arrow keys to browse
- **Category Filters** — Sarees, Suits, Lehengas, Kurtis, etc.
- **Shopping Cart** — Add items, adjust quantities
- **WhatsApp Checkout** — Sends formatted order via WhatsApp
- **Firebase Admin Panel** — Secure product & settings management
- **Image Uploads** — Product and hero images via Firebase Storage
- **Responsive Design** — Works on mobile, tablet, and desktop
- **Auto-Seeding** — First visit populates 12 default products automatically
