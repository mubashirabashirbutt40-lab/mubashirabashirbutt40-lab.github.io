(function () {
  "use strict";

  var PLACEHOLDER_AFFILIATE = window.HF_PLACEHOLDER_AFFILIATE || "PASTE_ALIBABA_AFFILIATE_LINK_HERE";
  var PLACEHOLDER_IMAGE = window.HF_PLACEHOLDER_IMAGE || "assets/images/placeholder.svg";
  var STORAGE_KEY = window.HF_STORAGE_KEY || "homefinds_products_v1";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function isHttpUrl(url) {
    return /^https?:\/\//i.test(url);
  }

  function isLocalAsset(url) {
    return /^(?:\.\/)?assets\//i.test(url);
  }

  function safeImageUrl(url) {
    var u = String(url || "").trim();
    if (isHttpUrl(u) || isLocalAsset(u)) return u;
    return PLACEHOLDER_IMAGE;
  }

  function hasAffiliateUrl(url) {
    var u = String(url || "").trim();
    if (!u || u === PLACEHOLDER_AFFILIATE) return false;
    return isHttpUrl(u);
  }

  function productShareUrl(id) {
    var base = window.location.href.split("?")[0].split("#")[0];
    if (/admin\.html$/i.test(base)) {
      base = base.replace(/admin\.html$/i, "index.html");
    }
    var joiner = base.indexOf("?") >= 0 ? "&" : "?";
    return base + joiner + "product=" + encodeURIComponent(id);
  }

  function requestedProductId() {
    var params = new URLSearchParams(window.location.search);
    var fromQuery = params.get("product") || params.get("id");
    if (fromQuery) return String(fromQuery);
    var hash = window.location.hash || "";
    var match = hash.match(/^#product-(.+)$/i);
    return match ? String(match[1]) : "";
  }

  function shopButton(product, extraClass) {
    var affiliate = hasAffiliateUrl(product.affiliateUrl);
    var href = affiliate ? escapeHtml(product.affiliateUrl.trim()) : "#shop";
    var ctaLabel = affiliate ? "Shop Now" : "Link coming soon";
    var ctaClass = "btn btn-shop" + (extraClass ? " " + extraClass : "") + (affiliate ? "" : " is-disabled");
    var rel = affiliate ? ' rel="nofollow sponsored noopener"' : "";
    var target = affiliate ? ' target="_blank"' : "";
    return (
      '<a class="' +
      ctaClass +
      '" href="' +
      href +
      '"' +
      target +
      rel +
      ">" +
      ctaLabel +
      "</a>"
    );
  }

  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        window.prompt("Copy this Pinterest link:", text);
        if (done) done();
      });
      return;
    }
    window.prompt("Copy this Pinterest link:", text);
    if (done) done();
  }

  function loadProducts() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          return parsed;
        }
      }
    } catch (err) {
      /* Fall back to defaults if localStorage is blocked or corrupt. */
    }
    return clone(window.DEFAULT_PRODUCTS || []);
  }

  function yearStamp() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function setActiveNav() {
    var hash = window.location.hash || "#home";
    var links = document.querySelectorAll(".site-nav a[href^='#']");
    links.forEach(function (link) {
      var href = link.getAttribute("href");
      var on = href === hash || (hash === "#home" && href === "#home");
      link.classList.toggle("is-active", on);
    });
  }

  function initMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    function closeMenu() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("nav-open");
    }

    toggle.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("nav-open", open);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  function productCard(product, opts) {
    opts = opts || {};
    var image = escapeHtml(safeImageUrl(product.image));
    var name = escapeHtml(product.name);
    var description = escapeHtml(product.description);
    var price = escapeHtml(product.price);
    var oldPrice = product.oldPrice ? '<span class="price-old">' + escapeHtml(product.oldPrice) + "</span>" : "";
    var discount = product.discount ? '<span class="price-save">' + escapeHtml(product.discount) + "</span>" : "";
    var badge = product.badge ? '<span class="badge">' + escapeHtml(product.badge) + "</span>" : "";
    var pinHref = "index.html?product=" + encodeURIComponent(product.id);
    var anchor = opts.anchor ? ' id="product-' + escapeHtml(product.id) + '"' : "";

    return (
      "<article class=\"product-card\"" +
      anchor +
      ' data-id="' +
      escapeHtml(product.id) +
      '" data-category="' +
      escapeHtml(product.category) +
      '">' +
      '<div class="product-media">' +
      badge +
      '<img src="' +
      image +
      '" alt="' +
      name +
      '" loading="lazy" width="640" height="800" onerror="this.onerror=null;this.src=\'' +
      PLACEHOLDER_IMAGE +
      "';\" />" +
      "</div>" +
      '<div class="product-body">' +
      "<h3><a href=\"" +
      pinHref +
      "\">" +
      name +
      "</a></h3>" +
      "<p>" +
      description +
      "</p>" +
      '<div class="product-price">' +
      '<span class="price-now">' +
      price +
      "</span>" +
      oldPrice +
      discount +
      "</div>" +
      shopButton(product) +
      "</div>" +
      "</article>"
    );
  }

  function renderGrid(container, products, opts) {
    if (!container) return;
    if (!products.length) {
      container.innerHTML = '<p class="empty-state">No products in this collection yet.</p>';
      return;
    }
    container.innerHTML = products
      .map(function (item) {
        return productCard(item, opts);
      })
      .join("");
  }

  function visibleProducts(all) {
    return all.filter(function (item) {
      return item.active !== false;
    });
  }

  function initFilters(allVisible) {
    var buttons = document.querySelectorAll("[data-filter]");
    var grid = document.getElementById("product-grid");
    var label = document.getElementById("collection-label");

    function apply(category) {
      buttons.forEach(function (btn) {
        var on = btn.getAttribute("data-filter") === category;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var list =
        category === "all"
          ? allVisible
          : allVisible.filter(function (item) {
              return item.category === category;
            });
      if (label) {
        label.textContent = category === "all" ? "All Products" : category;
      }
      renderGrid(grid, list, { anchor: true });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        apply(btn.getAttribute("data-filter"));
      });
    });

    apply("all");
    return apply;
  }

  function renderPinLanding(product) {
    var section = document.getElementById("pin-landing");
    var inner = document.getElementById("pin-landing-inner");
    if (!section || !inner) return;

    if (!product) {
      section.hidden = true;
      document.body.classList.remove("pin-mode");
      inner.innerHTML = "";
      return;
    }

    var image = escapeHtml(safeImageUrl(product.image));
    var name = escapeHtml(product.name);
    var share = productShareUrl(product.id);
    var oldPrice = product.oldPrice ? '<span class="price-old">' + escapeHtml(product.oldPrice) + "</span>" : "";
    var discount = product.discount ? '<span class="price-save">' + escapeHtml(product.discount) + "</span>" : "";
    var badge = product.badge ? '<span class="badge">' + escapeHtml(product.badge) + "</span>" : "";

    document.body.classList.add("pin-mode");
    section.hidden = false;
    document.title = product.name + " | Home Finds";
    inner.innerHTML =
      '<article class="pin-layout">' +
      '<div class="pin-media">' +
      badge +
      '<img src="' +
      image +
      '" alt="' +
      name +
      '" width="800" height="1000" onerror="this.onerror=null;this.src=\'' +
      PLACEHOLDER_IMAGE +
      "';\" />" +
      "</div>" +
      '<div class="pin-copy">' +
      '<p class="eyebrow">Pinterest find</p>' +
      "<h1>" +
      name +
      "</h1>" +
      '<p class="pin-meta">' +
      escapeHtml(product.category) +
      "</p>" +
      "<p>" +
      escapeHtml(product.description) +
      "</p>" +
      '<div class="product-price">' +
      '<span class="price-now">' +
      escapeHtml(product.price) +
      "</span>" +
      oldPrice +
      discount +
      "</div>" +
      '<div class="pin-actions">' +
      shopButton(product) +
      '<button type="button" class="btn btn-ghost" id="copy-pin-link">Copy Pin link</button>' +
      '<a class="btn btn-ghost" href="#categories">More finds</a>' +
      "</div>" +
      '<p class="pin-url">Pin this page: <span id="pin-url-text">' +
      escapeHtml(share) +
      "</span></p>" +
      "</div>" +
      "</article>";

    var copyBtn = document.getElementById("copy-pin-link");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        copyText(share, function () {
          copyBtn.textContent = "Copied";
          setTimeout(function () {
            copyBtn.textContent = "Copy Pin link";
          }, 1600);
        });
      });
    }

    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function highlightProduct(id) {
    document.querySelectorAll(".product-card.is-target").forEach(function (card) {
      card.classList.remove("is-target");
    });
    var card = document.getElementById("product-" + id);
    if (card) {
      card.classList.add("is-target");
    }
  }

  function initShopClicks() {
    document.addEventListener("click", function (event) {
      var link = event.target.closest(".btn-shop.is-disabled");
      if (!link) return;
      event.preventDefault();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    yearStamp();
    initMenu();
    setActiveNav();
    window.addEventListener("hashchange", setActiveNav);

    var products = visibleProducts(loadProducts());
    var featured = products.filter(function (item) {
      return item.featured === true;
    });
    var applyFilter = initFilters(products);

    renderGrid(document.getElementById("trending-grid"), featured);
    initShopClicks();

    var requested = requestedProductId();
    if (requested) {
      var match = products.find(function (item) {
        return String(item.id) === requested;
      });
      if (match) {
        applyFilter(match.category);
        renderPinLanding(match);
        highlightProduct(match.id);
      } else {
        renderPinLanding(null);
      }
    }
  });
})();
