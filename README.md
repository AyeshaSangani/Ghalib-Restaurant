# Ghalib Restaurant — Website Revamp

A premium, fully responsive restaurant website built with **HTML5, CSS3, vanilla JavaScript, and Bootstrap 5** — no build tools, no frameworks to install. Just open it in VS Code and go.

## Design Concept

The site is themed around the restaurant's namesake — the poet **Mirza Ghalib**. The visual identity ("Diwan-e-Khana") uses:
- A **maroon / antique gold / ivory** palette evoking old manuscript pages and Mughal-era dining
- **Amiri** (display) + **Lora** (body) + **Noto Nastaliq Urdu** (for real Ghalib couplets) as the type system
- A recurring **scrolling couplet ("sher") band** and hand-drawn **manuscript corner ornaments** as the signature visual motif tying every section together

## Folder Structure

```
ghalib-restaurant/
├── index.html          # All page markup/sections
├── css/
│   └── style.css       # All custom styling (Bootstrap is loaded via CDN)
├── js/
│   └── script.js       # Preloader, nav, scroll-reveal, gallery lightbox, form validation
├── images/              # (empty — see "Replacing Images" below)
└── README.md
```

## How to Run in VS Code

1. Open the `ghalib-restaurant` folder in VS Code (`File → Open Folder`).
2. Install the **Live Server** extension (by Ritwick Dey) if you don't have it.
3. Right-click `index.html` → **Open with Live Server**.
4. The site opens in your browser and auto-refreshes as you edit.

No `npm install`, no build step — everything (Bootstrap 5, Font Awesome, Google Fonts) loads from CDN links already in `index.html`, so an internet connection is needed the first time it loads in a browser.

## Replacing Images

The demo currently uses royalty-free Unsplash photos (linked directly, not stored locally) as placeholders for the hero, feature banner, and gallery. To use your own restaurant photography:

1. Drop your images into the `images/` folder (e.g. `images/hero.jpg`).
2. In `index.html`, replace the relevant `src="https://images.unsplash.com/..."` with `src="images/hero.jpg"`.
3. Keep the hero image landscape and at least 1600px wide for a crisp full-screen look.

## Editing Content

- **Menu items & prices** — inside `<section id="menu">` in `index.html`, each dish is a `.dish-row` block.
- **Couplets (sher ticker)** — inside `<section id="sher">`; swap the Urdu/translation pairs for others if you like.
- **Reservation phone/address/hours** — inside `<section id="reserve">`.
- **Colors** — all defined once at the top of `css/style.css` under `:root { --maroon, --gold, --ivory ... }`. Change a value there and it updates site-wide.
- **Reservation form** — currently shows a confirmation message in the page (no backend). To actually receive bookings, connect the `<form id="reserveForm">` in `index.html` to a backend endpoint, or a service like Formspree/Netlify Forms, inside the `submit` handler in `js/script.js`.

## Site Structure — Mirrors the Real Ghalib Restaurant

This revamp deliberately follows the **same structure as the real business**:

| Real site | This project | What it does |
|---|---|---|
| `ghalib.com.pk` | `index.html` | Home page — story, gallery, reviews, table reservation. **No ordering here.** |
| `ghalib.com.pk/menu.html` | `menu.html` | A dedicated, browsable menu page (categories, dishes, prices) — **display only, no cart.** |
| `order.ghalib.com.pk` | `order.html` | The full online-ordering experience — Add to Cart, cart drawer, checkout. |

So instead of cramming ordering into the homepage, the site is split into three pages just like the real one — and all three share the same navbar, footer, fonts and premium design system so it still feels like one cohesive site.

## Sections Included

- **index.html**: Hero · Couplet ticker · Our Story · Menu Highlights (teaser + links to Menu / Order Online) · Chef's Table feature banner · Gallery (with lightbox) · Guest reviews (carousel) · Reservation form · Footer
- **menu.html**: Page header · Full categorized menu (9 categories, priced, descriptive) · "Order Online" CTA banner · Footer
- **order.html**: Page header · Same full menu but with **Add to Order** buttons · Cart drawer (offcanvas) · Checkout modal · Footer

## Backend: Orders & Reservations in MySQL (via XAMPP)

The site now has a working PHP + MySQL backend. When a customer places an order or books a table, it's saved to a database — and you (the admin) can log in to see everything.

```
ghalib-restaurant/
├── index.html, css/, js/        ← the public website (unchanged in structure)
├── backend/
│   ├── db_config.php            ← database connection + admin login credentials
│   ├── save-order.php           ← inserts a placed order into MySQL
│   └── save-reservation.php     ← inserts a table reservation into MySQL
├── admin/
│   ├── login.php                ← admin sign-in page
│   ├── dashboard.php            ← view all orders + reservations, update order status
│   ├── logout.php
│   └── admin.css
└── sql/
    └── ghalib_db.sql            ← run this once to create the database & tables
```

### Setup steps (XAMPP)

1. **Copy the project** into your XAMPP web root, e.g.:
   `C:\xampp\htdocs\ghalib-restaurant` (Windows) or `/Applications/XAMPP/htdocs/ghalib-restaurant` (Mac).
2. **Start Apache and MySQL** from the XAMPP Control Panel.
3. **Create the database:** open `http://localhost/phpmyadmin`, go to the **Import** tab, choose `sql/ghalib_db.sql`, and click **Go**. This creates the `ghalib_db` database with `orders` and `reservations` tables.
4. **Check the credentials:** open `backend/db_config.php` — the defaults (`root` / no password) match a fresh XAMPP install, so usually nothing to change here.
5. **Open the site through Apache, not by double-clicking the file** — it must be `http://localhost/ghalib-restaurant/index.html`, not `file:///...`, or the PHP calls won't work.
6. Place an order or a reservation on the site — it will now insert a row into MySQL.

### Viewing orders as admin

- Go to `http://localhost/ghalib-restaurant/admin/login.php`
- Default login: **admin / ghalib123** — change these in `backend/db_config.php` (`ADMIN_USERNAME`, `ADMIN_PASSWORD`) before handing this in or deploying it.
- The dashboard has two tabs: **Orders** (with a status dropdown you can update — Pending → Confirmed → Preparing → On the Way → Delivered) and **Reservations**.

### Notes

- If Apache/MySQL aren't running, or the site is opened directly as a file, the checkout and reservation forms still show an on-screen confirmation (so the front-end demo still works), but nothing is saved to MySQL — you'll see a warning in the browser console (F12 → Console) in that case.
- Passwords/credentials here are simple on purpose for an assignment/demo. For a real production site, use hashed admin passwords and a `.env`-style config kept out of version control.

## Browser Support

Modern evergreen browsers (Chrome, Edge, Firefox, Safari). Fully responsive from small phones (360px) up through large desktop screens.
