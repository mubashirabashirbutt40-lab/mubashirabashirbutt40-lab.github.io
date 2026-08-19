(function () {
  "use strict";

  var STORAGE_KEY = window.HF_STORAGE_KEY || "homefinds_products_v1";
  var PIN_KEY = window.HF_PIN_KEY || "homefinds_admin_pin_v1";
  var SESSION_KEY = window.HF_SESSION_KEY || "homefinds_admin_session_v1";
  var DEFAULT_PIN = window.HF_DEFAULT_PIN || "2468";
  var PLACEHOLDER_AFFILIATE = window.HF_PLACEHOLDER_AFFILIATE || "PASTE_ALIBABA_AFFILIATE_LINK_HERE";
  var CATEGORIES = window.PRODUCT_CATEGORIES || [];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getPin() {
    return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
  }

  function loadProducts() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      /* ignore */
    }
    return clone(window.DEFAULT_PRODUCTS || []);
  }

  function saveProducts(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function productShareUrl(id) {
    var base = window.location.href.split("?")[0].split("#")[0];
    if (/admin\.html$/i.test(base)) {
      base = base.replace(/admin\.html$/i, "index.html");
    }
    return base + "?product=" + encodeURIComponent(id);
  }

  function nextId(list) {
    var max = 0;
    list.forEach(function (item) {
      var n = Number(item.id) || 0;
      if (n > max) max = n;
    });
    return max + 1;
  }

  function fillCategories(select, selected) {
    select.innerHTML = CATEGORIES.map(function (cat) {
      var sel = cat === selected ? " selected" : "";
      return '<option value="' + escapeHtml(cat) + '"' + sel + ">" + escapeHtml(cat) + "</option>";
    }).join("");
  }

  function showPanel() {
    document.getElementById("login-screen").hidden = true;
    document.getElementById("admin-screen").hidden = false;
  }

  function showLogin() {
    document.getElementById("login-screen").hidden = false;
    document.getElementById("admin-screen").hidden = true;
    sessionStorage.removeItem(SESSION_KEY);
  }

  function status(message, type) {
    var el = document.getElementById("admin-status");
    if (!el) return;
    el.textContent = message;
    el.className = "status-banner" + (type ? " is-" + type : "");
  }

  function renderTable() {
    var tbody = document.getElementById("product-table-body");
    var products = loadProducts();
    if (!products.length) {
      tbody.innerHTML = '<tr><td colspan="7">No products yet. Add one below.</td></tr>';
      return;
    }
    tbody.innerHTML = products
      .map(function (p) {
        var missing = !p.affiliateUrl || p.affiliateUrl === PLACEHOLDER_AFFILIATE;
        return (
          "<tr>" +
          "<td>" +
          escapeHtml(p.id) +
          "</td>" +
          "<td>" +
          escapeHtml(p.name) +
          (missing ? '<span class="tag tag-warn">No affiliate URL</span>' : "") +
          "</td>" +
          "<td>" +
          escapeHtml(p.category) +
          "</td>" +
          "<td>" +
          escapeHtml(p.price) +
          "</td>" +
          "<td>" +
          (p.active !== false ? "Published" : "Hidden") +
          "</td>" +
          "<td>" +
          (p.featured ? "Featured" : "—") +
          "</td>" +
          '<td class="row-actions">' +
          '<button type="button" class="btn btn-small" data-action="edit" data-id="' +
          p.id +
          '">Edit</button>' +
          '<button type="button" class="btn btn-small" data-action="toggle-active" data-id="' +
          p.id +
          '">' +
          (p.active !== false ? "Hide" : "Publish") +
          "</button>" +
          '<button type="button" class="btn btn-small" data-action="toggle-featured" data-id="' +
          p.id +
          '">' +
          (p.featured ? "Unfeature" : "Feature") +
          "</button>" +
          '<button type="button" class="btn btn-small" data-action="copy-pin" data-id="' +
          p.id +
          '">Copy Pin link</button>' +
          '<button type="button" class="btn btn-small btn-danger" data-action="delete" data-id="' +
          p.id +
          '">Delete</button>' +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function formValues() {
    return {
      id: document.getElementById("field-id").value,
      name: document.getElementById("field-name").value.trim(),
      description: document.getElementById("field-description").value.trim(),
      price: document.getElementById("field-price").value.trim(),
      oldPrice: document.getElementById("field-old-price").value.trim(),
      discount: document.getElementById("field-discount").value.trim(),
      badge: document.getElementById("field-badge").value.trim(),
      category: document.getElementById("field-category").value,
      image: document.getElementById("field-image").value.trim(),
      affiliateUrl: document.getElementById("field-affiliate").value.trim() || PLACEHOLDER_AFFILIATE,
      featured: document.getElementById("field-featured").checked,
      active: document.getElementById("field-active").checked
    };
  }

  function fillForm(product) {
    document.getElementById("form-title").textContent = product ? "Edit Product" : "Add Product";
    document.getElementById("field-id").value = product ? product.id : "";
    document.getElementById("field-name").value = product ? product.name : "";
    document.getElementById("field-description").value = product ? product.description : "";
    document.getElementById("field-price").value = product ? product.price : "";
    document.getElementById("field-old-price").value = product && product.oldPrice ? product.oldPrice : "";
    document.getElementById("field-discount").value = product && product.discount ? product.discount : "";
    document.getElementById("field-badge").value = product && product.badge ? product.badge : "";
    fillCategories(document.getElementById("field-category"), product ? product.category : CATEGORIES[0]);
    document.getElementById("field-image").value = product ? product.image : "";
    document.getElementById("field-affiliate").value =
      product && product.affiliateUrl ? product.affiliateUrl : PLACEHOLDER_AFFILIATE;
    document.getElementById("field-featured").checked = product ? !!product.featured : false;
    document.getElementById("field-active").checked = product ? product.active !== false : true;
    document.getElementById("product-form").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForm() {
    fillForm(null);
    status("Form cleared. Add a new product or choose Edit in the table.");
  }

  function findById(list, id) {
    var n = String(id);
    return list.find(function (item) {
      return String(item.id) === n;
    });
  }

  function saveForm(event) {
    event.preventDefault();
    var values = formValues();
    if (!values.name || !values.description || !values.price || !values.image) {
      status("Name, description, price, and image are required.", "error");
      return;
    }
    var list = loadProducts();
    if (values.id) {
      var existing = findById(list, values.id);
      if (!existing) {
        status("That product was not found.", "error");
        return;
      }
      existing.name = values.name;
      existing.description = values.description;
      existing.price = values.price;
      existing.oldPrice = values.oldPrice;
      existing.discount = values.discount;
      existing.badge = values.badge;
      existing.category = values.category;
      existing.image = values.image;
      existing.affiliateUrl = values.affiliateUrl;
      existing.featured = values.featured;
      existing.active = values.active;
      status("Product updated and saved in this browser.", "ok");
    } else {
      values.id = nextId(list);
      list.push(values);
      status("Product added and saved in this browser.", "ok");
    }
    saveProducts(list);
    renderTable();
    fillForm(null);
  }

  function downloadJson(filename, data) {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleTableClick(event) {
    var btn = event.target.closest("button[data-action]");
    if (!btn) return;
    var id = btn.getAttribute("data-id");
    var action = btn.getAttribute("data-action");
    var list = loadProducts();
    var product = findById(list, id);
    if (!product) return;

    if (action === "copy-pin") {
      var pinUrl = productShareUrl(product.id);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pinUrl).then(function () {
          status("Copied Pinterest link: " + pinUrl, "ok");
        }).catch(function () {
          window.prompt("Copy this Pinterest link:", pinUrl);
        });
      } else {
        window.prompt("Copy this Pinterest link:", pinUrl);
      }
      return;
    }
    if (action === "edit") {
      fillForm(product);
      status("Editing “" + product.name + "”.");
      return;
    }
    if (action === "delete") {
      if (!window.confirm("Delete “" + product.name + "”? This only affects this browser until you export.")) {
        return;
      }
      saveProducts(
        list.filter(function (item) {
          return String(item.id) !== String(id);
        })
      );
      renderTable();
      fillForm(null);
      status("Product deleted from this browser.", "ok");
      return;
    }
    if (action === "toggle-active") {
      product.active = product.active === false;
      saveProducts(list);
      renderTable();
      status(product.active !== false ? "Product published." : "Product hidden from the public site.", "ok");
      return;
    }
    if (action === "toggle-featured") {
      product.featured = !product.featured;
      saveProducts(list);
      renderTable();
      status(product.featured ? "Marked as featured." : "Removed from featured.", "ok");
    }
  }

  function initLogin() {
    var form = document.getElementById("login-form");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var pin = document.getElementById("login-pin").value;
      if (pin === getPin()) {
        sessionStorage.setItem(SESSION_KEY, "ok");
        showPanel();
        renderTable();
        fillForm(null);
        status("Signed in locally. This is not server-side security.");
      } else {
        document.getElementById("login-error").hidden = false;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());

    fillCategories(document.getElementById("field-category"), CATEGORIES[0]);
    initLogin();

    document.getElementById("logout-btn").addEventListener("click", showLogin);
    document.getElementById("product-form").addEventListener("submit", saveForm);
    document.getElementById("reset-form-btn").addEventListener("click", resetForm);
    document.getElementById("product-table-body").addEventListener("click", handleTableClick);

    document.getElementById("export-btn").addEventListener("click", function () {
      downloadJson("home-finds-products.json", loadProducts());
      status("Exported product JSON from this browser.", "ok");
    });

    document.getElementById("download-btn").addEventListener("click", function () {
      var stamp = new Date().toISOString().slice(0, 10);
      downloadJson("home-finds-products-" + stamp + ".json", loadProducts());
      status("Downloaded dated product backup.", "ok");
    });

    document.getElementById("import-file").addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          if (!Array.isArray(data)) throw new Error("not array");
          saveProducts(data);
          renderTable();
          fillForm(null);
          status("Imported " + data.length + " products into this browser.", "ok");
        } catch (err) {
          status("Import failed. Use a JSON array of product objects.", "error");
        }
      };
      reader.readAsText(file);
      event.target.value = "";
    });

    document.getElementById("reset-products-btn").addEventListener("click", function () {
      if (!window.confirm("Reset this browser to the default products.js catalog?")) return;
      localStorage.removeItem(STORAGE_KEY);
      renderTable();
      fillForm(null);
      status("Reset to default products from products.js.", "ok");
    });

    document.getElementById("pin-form").addEventListener("submit", function (event) {
      event.preventDefault();
      var next = document.getElementById("new-pin").value.trim();
      if (next.length < 4) {
        status("Choose a PIN of at least 4 characters.", "error");
        return;
      }
      localStorage.setItem(PIN_KEY, next);
      document.getElementById("new-pin").value = "";
      status("Local PIN updated in this browser only. Anyone can still view admin.html source.", "ok");
    });

    if (sessionStorage.getItem(SESSION_KEY) === "ok") {
      showPanel();
      renderTable();
      fillForm(null);
    }
  });
})();
