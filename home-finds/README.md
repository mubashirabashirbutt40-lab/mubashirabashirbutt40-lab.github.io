# Home Finds

Static Pinterest-friendly home decor catalog for **Alibaba.com affiliate / deep links**.

This site is **HTML, CSS, and vanilla JavaScript only**. It is meant to be published on **GitHub Pages**. There is no PHP, MySQL, Node.js, Python, React, or any backend.

## Important limitations (read this)

GitHub Pages cannot provide:

- PHP
- MySQL
- Server-side authentication
- A secure database

The page at `admin.html` is a **browser-only prototype**. It stores products and a PIN in **localStorage on that device**. It is **not** a secure production admin dashboard. Anyone who opens the files can inspect the demo PIN. Changes in the editor **do not** update `products.js` on GitHub by themselves. Export JSON and paste it into `products.js` (or keep a backup file) if you want a lasting catalog for every visitor.

The default demo PIN is `2468`. Treat it as a local lock screen, not real security.

Shop Now buttons use each product’s `affiliateUrl`. Placeholder text `PASTE_ALIBABA_AFFILIATE_LINK_HERE` is **not** a real Alibaba tracking link. Replace it with your own affiliate / deep link before you promote the site. The public page will not send visitors to a fake URL.

## Publish on GitHub Pages

1. Create a GitHub repository.
2. Upload all files (keep this folder structure).
3. Go to **Settings → Pages**.
4. Select **Deploy from a branch**.
5. Select the **main** branch (and `/` root).
6. Save.
7. Wait for GitHub Pages to publish.
8. Open the generated website URL.

After it is live, replace `YOUR-USERNAME.github.io/home-finds` in `index.html`, `admin.html`, `robots.txt`, and `sitemap.xml` with your real Pages URL.

## Open the site without GitHub

You can open `index.html` in a browser. Relative paths are used throughout. No `npm`, no build command, no environment variables, no server.

## Update products

**For all visitors (recommended):** edit the array in `products.js`, then upload the file again.

**On your own computer only:**

1. Open `admin.html`.
2. Enter the local PIN (`2468` until you change it).
3. Add, edit, hide/publish, feature, or delete products.
4. Paste image URLs (`https://example.com/image.jpg`) or local paths such as `assets/images/mirror.jpg`. There is no image uploader.
5. Paste real Alibaba affiliate URLs into the affiliate field.
6. Use **Export Products JSON** / **Download Product Data** for backups.
7. Use **Import Products JSON** to restore a backup in this browser.
8. Use **Reset Products** to return this browser to the default `products.js` list.

The homepage reads localStorage first. If none is saved, it uses `products.js`.

## Pinterest product links

Each product has its own page URL:

`index.html?product=1`

On GitHub Pages that becomes:

`https://YOUR-USERNAME.github.io/home-finds/index.html?product=1`

or

`https://YOUR-USERNAME.github.io/home-finds/?product=1`

That is the link to paste into Pinterest. Visitors land on that product, then tap **Shop Now** for your Alibaba affiliate URL.

- Open a product by clicking its name on the homepage, then use **Copy Pin link**.
- Or open `admin.html` and use **Copy Pin link** on a row.

Do not paste the Alibaba URL into Pinterest if you want traffic on Home Finds first.

## File map

```
/
├── index.html
├── admin.html
├── products.js
├── app.js
├── admin.js
├── style.css
├── robots.txt
├── sitemap.xml
├── README.md
└── assets/
    └── images/
```

## Affiliate disclosure

Some links on Home Finds are affiliate links. If a visitor purchases through one of those links, you may earn a commission at no additional cost to them. Home Finds is independent and is not owned by Alibaba.
