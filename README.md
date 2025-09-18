# LumiShop – Noroff E-commerce Project

This is a simple e-commerce frontend project built with **React + TypeScript** as part of the Noroff course.  
It demonstrates fetching products from an API, searching, sorting, viewing details, adding items to a shopping cart, and completing a checkout flow.

---

## ✨ Features

- Browse all products with search and sorting
- View detailed product pages (with description, images, tags, reviews)
- Add/remove items from the shopping cart
- Automatic price calculation with discounts
- Checkout flow with order confirmation
- Persistent cart stored in `localStorage`

---

## 🛠️ Tech Stack

- **React 18** with **TypeScript**
- **React Router DOM** for navigation
- **Context API + Reducer** for cart state management
- **CSS Modules** for styling
- **Vite** as development/build tool

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Mariengs/noroff-ecom.git
cd noroff-ecom
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

### 5. Preview production build

```bash
npm run preview
```

###### 📌 Notes

- Cart data is persisted in localStorage under the key cart-v1.
- Product data is loaded via API calls from the provided Noroff API.
- The app is responsive and works on both desktop and mobile.
