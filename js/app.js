(() => {
  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const getCategoryLabel = (category) => CATEGORY_LABELS[category] || "Collection";
  const formatPrice = (cents) => currency.format(cents / 100);

  function updateCartCount() {
    document.querySelectorAll("[data-cart-count]").forEach((element) => { element.textContent = String(Cart.getCount()); });
  }

  function productCard(product) {
    const article = document.createElement("article");
    article.className = "product-card";
    const link = document.createElement("a");
    link.href = `product.html?id=${encodeURIComponent(product.id)}`;
    link.className = "product-image";
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;
    image.loading = "lazy";
    link.append(image);
    const info = document.createElement("div");
    info.className = "product-info";
    const meta = document.createElement("p");
    meta.className = "product-meta";
    meta.textContent = getCategoryLabel(product.category);
    const title = document.createElement("h3");
    const titleLink = document.createElement("a");
    titleLink.href = link.href;
    titleLink.textContent = product.name;
    title.append(titleLink);
    const price = document.createElement("p");
    price.className = "price";
    price.textContent = formatPrice(product.priceCents);
    const sizes = document.createElement("p");
    sizes.className = "card-sizes";
    sizes.textContent = `Sizes: ${product.sizes.join(" · ")}`;
    const button = document.createElement("a");
    button.className = "card-link";
    button.href = link.href;
    button.textContent = "View product →";
    info.append(meta, title, price, sizes, button);
    article.append(link, info);
    return article;
  }

  function renderCards(container, products) {
    if (!container) return;
    container.replaceChildren(...products.map(productCard));
  }

  function setUpShop() {
    const container = document.querySelector("[data-all-products]");
    const filters = document.querySelector("[data-product-filters]");
    const count = document.querySelector("[data-product-count]");
    if (!container || !filters || !count) return;
    const requested = new URLSearchParams(window.location.search).get("category");
    let activeCategory = Object.hasOwn(CATEGORY_LABELS, requested) ? requested : "all";
    Object.entries(CATEGORY_LABELS).forEach(([category, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.dataset.category = category;
      button.addEventListener("click", () => {
        activeCategory = category;
        const url = new URL(window.location.href);
        category === "all" ? url.searchParams.delete("category") : url.searchParams.set("category", category);
        window.history.replaceState({}, "", url);
        draw();
      });
      filters.append(button);
    });
    function draw() {
      const products = activeCategory === "all" ? PRODUCTS : PRODUCTS.filter((product) => product.category === activeCategory);
      renderCards(container, products);
      count.textContent = `${products.length} ${products.length === 1 ? "T-shirt" : "T-shirts"}`;
      filters.querySelectorAll("button").forEach((button) => button.classList.toggle("selected", button.dataset.category === activeCategory));
    }
    draw();
  }

  function setUpDetail() {
    const container = document.querySelector("[data-product-detail]");
    if (!container) return;
    const id = new URLSearchParams(window.location.search).get("id");
    const product = PRODUCTS.find((entry) => entry.id === id) || PRODUCTS[0];
    document.title = `${product.name} | ZeroRules`;
    const section = document.createElement("section");
    section.className = "product-detail";
    const media = document.createElement("div");
    media.className = "detail-image";
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;
    media.append(image);
    const content = document.createElement("div");
    content.className = "detail-content";
    const back = document.createElement("a"); back.href = "products.html"; back.className = "back-link"; back.textContent = "← Back to all T-shirts";
    const category = document.createElement("p"); category.className = "eyebrow"; category.textContent = getCategoryLabel(product.category);
    const name = document.createElement("h1"); name.textContent = product.name;
    const price = document.createElement("p"); price.className = "detail-price"; price.textContent = formatPrice(product.priceCents);
    const description = document.createElement("p"); description.className = "detail-description"; description.textContent = product.description;
    const form = document.createElement("form"); form.className = "purchase-form";
    const sizeLabel = document.createElement("label"); sizeLabel.htmlFor = "size"; sizeLabel.textContent = "Size";
    const size = document.createElement("select"); size.id = "size"; size.name = "size"; product.sizes.forEach((value) => { const option = document.createElement("option"); option.value = value; option.textContent = value; size.append(option); });
    const qtyLabel = document.createElement("label"); qtyLabel.htmlFor = "quantity"; qtyLabel.textContent = "Quantity";
    const quantity = document.createElement("input"); quantity.id = "quantity"; quantity.name = "quantity"; quantity.type = "number"; quantity.min = "1"; quantity.max = String(Cart.maxQuantity); quantity.value = "1";
    const submit = document.createElement("button"); submit.className = "button button-dark"; submit.type = "submit"; submit.textContent = "Add to bag";
    const note = document.createElement("p"); note.className = "cart-note"; note.setAttribute("aria-live", "polite");
    form.addEventListener("submit", (event) => { event.preventDefault(); const added = Cart.add(product.id, size.value, quantity.value); note.textContent = added ? "Added to your bag." : "Choose a valid quantity and available size."; });
    form.append(sizeLabel, size, qtyLabel, quantity, submit, note);
    content.append(back, category, name, price, description, form);
    section.append(media, content);
    container.append(section);
  }

  function setUpMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".primary-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => { const open = nav.classList.toggle("is-open"); toggle.setAttribute("aria-expanded", String(open)); toggle.textContent = open ? "Close" : "Menu"; });
  }

  function setUpSignup() {
    const form = document.querySelector("[data-signup-form]");
    if (!form) return;
    form.addEventListener("submit", (event) => { event.preventDefault(); const message = document.querySelector("[data-form-message]"); message.textContent = "Thanks. You are on the list."; form.reset(); });
  }

  function setUpCart() { const container = document.querySelector("[data-cart-page]"); if (!container) return; function render() { const items = Cart.getDetailedItems(); container.replaceChildren(); const heading = document.createElement("div"); heading.className = "cart-heading"; const eyebrow = document.createElement("p"); eyebrow.className = "eyebrow"; eyebrow.textContent = "Your selection"; const title = document.createElement("h1"); title.textContent = "Shopping bag"; heading.append(eyebrow, title); container.append(heading); const recovery = Cart.getRecoveryMessage(); if (recovery) { const notice = document.createElement("p"); notice.className = "cart-recovery"; notice.setAttribute("role", "status"); notice.textContent = recovery; container.append(notice); } if (!items.length) { const empty = document.createElement("section"); empty.className = "empty-cart"; const message = document.createElement("h2"); message.textContent = "Your cart is empty."; const text = document.createElement("p"); text.textContent = "A good tee is waiting for you."; const link = document.createElement("a"); link.className = "button button-dark"; link.href = "products.html"; link.textContent = "Continue shopping"; empty.append(message, text, link); container.append(empty); return; } const layout = document.createElement("div"); layout.className = "cart-layout"; const list = document.createElement("section"); list.className = "cart-list"; items.forEach((item) => { const row = document.createElement("article"); row.className = "cart-item"; const image = document.createElement("img"); image.src = item.product.image; image.alt = item.product.name; const info = document.createElement("div"); info.className = "cart-item-info"; const category = document.createElement("p"); category.className = "product-meta"; category.textContent = getCategoryLabel(item.product.category); const name = document.createElement("h2"); name.textContent = item.product.name; const size = document.createElement("p"); size.className = "cart-size"; size.textContent = `Size: ${item.size}`; const price = document.createElement("p"); price.className = "cart-unit-price"; price.textContent = `${formatPrice(item.product.priceCents)} each`; const controls = document.createElement("div"); controls.className = "quantity-controls"; const minus = document.createElement("button"); minus.type = "button"; minus.className = "quantity-button"; minus.textContent = "−"; minus.setAttribute("aria-label", `Decrease quantity for ${item.product.name}`); minus.disabled = item.quantity <= 1; const input = document.createElement("input"); input.type = "number"; input.min = "1"; input.max = String(Cart.maxQuantity); input.value = String(item.quantity); input.setAttribute("aria-label", `Quantity for ${item.product.name}, size ${item.size}`); const plus = document.createElement("button"); plus.type = "button"; plus.className = "quantity-button"; plus.textContent = "+"; plus.setAttribute("aria-label", `Increase quantity for ${item.product.name}`); plus.disabled = item.quantity >= Cart.maxQuantity; minus.addEventListener("click", () => { Cart.update(item.productId, item.size, item.quantity - 1); render(); }); plus.addEventListener("click", () => { Cart.update(item.productId, item.size, item.quantity + 1); render(); }); input.addEventListener("change", () => { if (!Cart.update(item.productId, item.size, input.value)) input.value = String(item.quantity); render(); }); controls.append(minus, input, plus); const remove = document.createElement("button"); remove.type = "button"; remove.className = "remove-button"; remove.textContent = "Remove"; remove.addEventListener("click", () => { Cart.remove(item.productId, item.size); render(); }); info.append(category, name, size, price, controls, remove); const subtotal = document.createElement("p"); subtotal.className = "item-subtotal"; subtotal.textContent = formatPrice(item.product.priceCents * item.quantity); row.append(image, info, subtotal); list.append(row); }); const summary = document.createElement("aside"); summary.className = "cart-summary"; const summaryTitle = document.createElement("h2"); summaryTitle.textContent = "Order summary"; const subtotal = document.createElement("p"); subtotal.className = "summary-line"; subtotal.textContent = "Subtotal"; const subtotalValue = document.createElement("strong"); subtotalValue.textContent = formatPrice(Cart.getSubtotalCents()); subtotal.append(subtotalValue); const total = document.createElement("p"); total.className = "summary-total"; total.textContent = "Total"; const totalValue = document.createElement("strong"); totalValue.textContent = formatPrice(Cart.getSubtotalCents()); total.append(totalValue); const checkout = document.createElement("button"); checkout.type = "button"; checkout.className = "button button-dark"; checkout.textContent = "Proceed to checkout"; const status = document.createElement("p"); status.className = "cart-note"; status.setAttribute("aria-live", "polite"); checkout.addEventListener("click", () => { status.textContent = "Checkout will be available in a future update."; }); const continueLink = document.createElement("a"); continueLink.href = "products.html"; continueLink.className = "text-link"; continueLink.textContent = "Continue shopping →"; const clear = document.createElement("button"); clear.type = "button"; clear.className = "clear-cart"; clear.textContent = "Empty cart"; clear.addEventListener("click", () => { Cart.clear(); render(); }); summary.append(summaryTitle, subtotal, total, checkout, continueLink, clear, status); layout.append(list, summary); container.append(layout); } window.addEventListener("threadform-cart-change", render); window.addEventListener("storage", (event) => { if (event.key === "threadform-cart-v1") render(); }); render(); }
  window.addEventListener("threadform-cart-change", updateCartCount);
  window.addEventListener("storage", (event) => { if (event.key === "threadform-cart-v1") updateCartCount(); });
  document.addEventListener("DOMContentLoaded", () => { updateCartCount(); setUpMenu(); setUpSignup(); renderCards(document.querySelector("[data-featured-products]"), PRODUCTS.filter((product) => product.featured)); setUpShop(); setUpDetail(); setUpCart(); });
})();