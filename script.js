// =========================================================
// iLoveSushi — script.js
// Carrito básico, navegación móvil, pedidos por WhatsApp
// =========================================================

// Reemplaza este número por el del restaurante (formato internacional, sin +, sin espacios)
const WHATSAPP_NUMBER = "REEMPLAZAR_NUMERO";

const MIN_ORDER = 25;

/* ---------------------------------------------------------
   Carrito
--------------------------------------------------------- */
let cart = []; // [{ id, name, price, qty }]

const cartItemsEl = document.getElementById("cartItems");
const cartEmptyEl = document.getElementById("cartEmpty");
const cartTotalEl = document.getElementById("cartTotal");
const cartMinWarningEl = document.getElementById("cartMinWarning");
const cartBarEl = document.getElementById("cartBar");
const cartBarTextEl = document.getElementById("cartBarText");
const cartDrawer = document.getElementById("cartDrawer");
const cartScrim = document.getElementById("cartScrim");

function formatUSD(amount) {
  return `USD ${amount.toFixed(0)}`;
}

function addToCart(id, name, price) {
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  renderCart();
  openCart();
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== id);
  }
  renderCart();
}

function removeItem(id) {
  cart = cart.filter((i) => i.id !== id);
  renderCart();
}

function getTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function renderCart() {
  cartItemsEl.innerHTML = "";

  if (cart.length === 0) {
    cartItemsEl.appendChild(cartEmptyEl);
  } else {
    cart.forEach((item) => {
      const line = document.createElement("div");
      line.className = "cart-line";
      line.innerHTML = `
        <div class="cart-line-info">
          <div class="cart-line-name">${item.name}</div>
          <div class="cart-line-price">${formatUSD(item.price)} c/u</div>
        </div>
        <div class="cart-qty">
          <button class="qty-btn" aria-label="Disminuir cantidad de ${item.name}" data-action="dec" data-id="${item.id}">−</button>
          <span aria-live="polite">${item.qty}</span>
          <button class="qty-btn" aria-label="Aumentar cantidad de ${item.name}" data-action="inc" data-id="${item.id}">+</button>
        </div>
        <div class="cart-line-subtotal">${formatUSD(item.price * item.qty)}</div>
      `;
      cartItemsEl.appendChild(line);

      const removeBtn = document.createElement("button");
      removeBtn.className = "cart-line-remove";
      removeBtn.textContent = "Eliminar";
      removeBtn.setAttribute("aria-label", `Eliminar ${item.name} del carrito`);
      removeBtn.dataset.action = "remove";
      removeBtn.dataset.id = item.id;
      line.querySelector(".cart-qty").appendChild(removeBtn);
    });
  }

  const total = getTotal();
  const count = getCount();

  cartTotalEl.textContent = formatUSD(total);

  if (total > 0 && total < MIN_ORDER) {
    cartMinWarningEl.hidden = false;
  } else {
    cartMinWarningEl.hidden = true;
  }

  if (cartBarEl && cartBarTextEl) {
    if (count > 0) {
      cartBarEl.hidden = false;
      cartBarTextEl.textContent = `${count} producto${count > 1 ? "s" : ""} · ${formatUSD(total)} — Ver pedido`;
    } else {
      cartBarEl.hidden = true;
    }
  }
}

cartItemsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === "inc") changeQty(id, 1);
  if (action === "dec") changeQty(id, -1);
  if (action === "remove") removeItem(id);
});

document.querySelectorAll(".btn-order").forEach((btn) => {
  btn.addEventListener("click", () => {
    const { id, name, price } = btn.dataset;
    addToCart(id, name, Number(price));
  });
});

/* ---------------------------------------------------------
   Abrir / cerrar carrito
--------------------------------------------------------- */
function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartScrim.classList.add("open");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartScrim.classList.remove("open");
}

const cartBar = document.getElementById("cartBar");
const cartClose = document.getElementById("cartClose");
const openCartFromSection = document.getElementById("openCartFromSection");

if (cartBar) cartBar.addEventListener("click", openCart);
if (cartClose) cartClose.addEventListener("click", closeCart);
if (cartScrim) cartScrim.addEventListener("click", closeCart);
if (openCartFromSection) openCartFromSection.addEventListener("click", openCart);

/* ---------------------------------------------------------
   Enviar pedido por WhatsApp
--------------------------------------------------------- */
const sendWhatsappBtn = document.getElementById("sendWhatsapp");
if (sendWhatsappBtn) {
  sendWhatsappBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      cartMinWarningEl.hidden = false;
      cartMinWarningEl.textContent = "Agrega al menos un producto para enviar tu pedido.";
      return;
    }

    const fulfillment = document.querySelector('input[name="fulfillment"]:checked').value;
    const total = getTotal();

    let message = "Hola iLoveSushi 👋\n\n";
    message += "Quiero realizar este pedido:\n\n";
    cart.forEach((item) => {
      message += `• ${item.qty}x ${item.name} — USD ${item.price * item.qty}\n`;
    });
    message += `\nTotal: USD ${total}\n\n`;
    message += `Modalidad: ${fulfillment}`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  });
}

/* ---------------------------------------------------------
   Aparición suave al hacer scroll (sin librerías)
--------------------------------------------------------- */
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll("[data-observe]").forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll("[data-observe]").forEach((el) => el.classList.add("in-view"));
}
