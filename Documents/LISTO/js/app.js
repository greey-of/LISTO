document.addEventListener("DOMContentLoaded", function () {

  /* =======================
     ELEMENTOS DOM
  ======================= */

  const loginForm = document.querySelector(".login-form");
  const registerForm = document.querySelector(".register-form");
  const locationButtons = document.querySelectorAll("[data-location]");
  const selectedLocation = document.querySelector("#selected-location");
  const locationBanner = document.querySelector(".location-banner");
  const cartItemsContainer = document.querySelector("#cart-items");
  const cartTotalElement = document.querySelector("#cart-total");
  const checkoutButton = document.querySelector("#checkout-button");
  const cartCountLabel = document.querySelector("#cart-count");
  const locationInfo = document.querySelector("#location-info");

  /* =======================
     FOOD PREVIEW (CORREGIDO)
  ======================= */

const preview = document.getElementById("food-preview");
const previewImg = document.getElementById("food-preview-img");
const products = document.querySelectorAll(".product-card");

products.forEach(product => {

  product.addEventListener("mouseenter", () => {

    const img = product.dataset.image;

    if (!img || !preview || !previewImg) return;

    previewImg.src = img;
    preview.style.display = "block";

  });

  product.addEventListener("mouseleave", () => {

    preview.style.display = "none";

  });

});
  /* =======================
     UTILIDADES
  ======================= */

  const formatPrice = (value) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  const getCart = () =>
    JSON.parse(localStorage.getItem("listo_cart") || "[]");

  const saveCart = (cart) => {
    localStorage.setItem("listo_cart", JSON.stringify(cart));
    updateCartCount(cart);
  };

  const updateCartCount = (cart) => {
    if (!cartCountLabel) return;

    const totalItems = cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    cartCountLabel.textContent = totalItems;
  };

  /* =======================
     CARRITO
  ======================= */

  const renderCart = () => {

    if (!cartItemsContainer || !cartTotalElement) return;

    const cart = getCart();

    cartItemsContainer.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {

      cartItemsContainer.innerHTML = `
        <p class="empty-cart">
          Tu carrito está vacío. Agrega algo del menú.
        </p>
      `;

      cartTotalElement.textContent = formatPrice(0);
      updateCartCount(cart);
      return;
    }

    cart.forEach((item) => {

      total += item.price * item.quantity;

      const itemElement = document.createElement("div");
      itemElement.className = "cart-item card";

      itemElement.innerHTML = `
        <div class="cart-item-detail">
          <strong>${item.quantity}x ${item.name}</strong>
          <span>${formatPrice(item.price)} cada uno</span>
          <span>Subtotal: ${formatPrice(item.price * item.quantity)}</span>
        </div>

        <div class="cart-item-control">
          <div class="control-buttons">

            <button class="cart-decrease" data-name="${item.name}">−</button>
            <button class="cart-increase" data-name="${item.name}">+</button>

          </div>

          <button class="cart-remove" data-name="${item.name}">
            Eliminar
          </button>
        </div>
      `;

      cartItemsContainer.appendChild(itemElement);

    });

    cartTotalElement.textContent = formatPrice(total);
    updateCartCount(cart);
  };

  const addToCart = (name, price) => {

    const cart = getCart();

    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ name, price, quantity: 1 });
    }

    saveCart(cart);
    renderCart();
  };

  const changeQuantity = (name, delta) => {

    const cart = getCart();

    const item = cart.find(entry => entry.name === name);

    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
      const index = cart.findIndex(entry => entry.name === name);
      cart.splice(index, 1);
    }

    saveCart(cart);
    renderCart();
  };

  const removeItem = (name) => {

    const cart = getCart().filter(item => item.name !== name);

    saveCart(cart);
    renderCart();
  };

  /* =======================
     UBICACIONES
  ======================= */

  const setLocation = (name) => {

    localStorage.setItem("listo_location", name);

    if (selectedLocation) {
      selectedLocation.textContent = name;
      locationBanner?.classList.remove("hidden");
    }

    if (locationInfo) {
      locationInfo.textContent = `Ubicación: ${name}`;
    }
  };

  const loadLocation = () => {

    const savedLocation = localStorage.getItem("listo_location");

    if (!savedLocation) return;

    if (selectedLocation) {
      selectedLocation.textContent = savedLocation;
      locationBanner?.classList.remove("hidden");
    }

    if (locationInfo) {
      locationInfo.textContent = `Ubicación: ${savedLocation}`;
    }
  };

  /* =======================
     LOGIN
  ======================= */

  if (loginForm) {

    loginForm.addEventListener("submit", function (event) {

      event.preventDefault();

      const username = this.querySelector("input[type='text']")?.value.trim();
      const password = this.querySelector("input[type='password']")?.value.trim();

      if (!username || !password) return;

      localStorage.setItem("listo_user", JSON.stringify({ username }));

      window.location.href = "edificios.html";
    });
  }

  /* =======================
     REGISTRO
  ======================= */

  if (registerForm) {

    registerForm.addEventListener("submit", function (event) {

      event.preventDefault();

      const name = this.querySelector("input[type='text']")?.value.trim();
      const email = this.querySelector("input[type='email']")?.value.trim();
      const password = this.querySelector("input[type='password']")?.value.trim();

      if (!name || !email || !password) return;

      localStorage.setItem("listo_user", JSON.stringify({ name, email }));

      window.location.href = "edificios.html";
    });
  }

  /* =======================
     BOTONES UBICACIÓN
  ======================= */

  locationButtons.forEach(button => {

    button.addEventListener("click", function () {

      const locationName = this.dataset.location;

      if (locationName) setLocation(locationName);

    });
  });

  /* =======================
     CAMBIO FONDO
  ======================= */

  const menuBody = document.getElementById("menu-body");

  if (menuBody) {

    const ubicacion = localStorage.getItem("listo_location");

    switch (ubicacion) {

      case "Ingeniería":
        menuBody.style.backgroundImage = "url('images/ingenieria.jfif')";
        break;

      case "Ciencias Básicas":
        menuBody.style.backgroundImage = "url('images/basicas.jfif')";
        break;

      case "Ciencias Sociales":
        menuBody.style.backgroundImage = "url('images/sociales.jfif')";
        break;

      case "Culturales":
        menuBody.style.backgroundImage = "url('images/culturales.jfif')";
        break;
    }
  }

  /* =======================
     AGREGAR PRODUCTOS
  ======================= */

  const addButtons = document.querySelectorAll(".add-to-cart");

  addButtons.forEach(button => {

    button.addEventListener("click", function (event) {

      event.preventDefault();

      addToCart(
        button.dataset.name,
        parseFloat(button.dataset.price)
      );
    });
  });

  /* =======================
     CARRITO EVENTOS
  ======================= */

  if (cartItemsContainer) {

    cartItemsContainer.addEventListener("click", function (event) {

      const target = event.target;
      const name = target.dataset.name;

      if (target.classList.contains("cart-increase")) {
        changeQuantity(name, 1);
      }

      if (target.classList.contains("cart-decrease")) {
        changeQuantity(name, -1);
      }

      if (target.classList.contains("cart-remove")) {
        removeItem(name);
      }
    });
  }

  /* =======================
     CHECKOUT
  ======================= */

  if (checkoutButton) {

    checkoutButton.addEventListener("click", function () {

      const cart = getCart();

      if (!cart.length) {
        alert("El carrito está vacío. Agrega productos antes de pagar.");
        return;
      }

      window.location.href = "payment.html";
    });
  }

  /* =======================
     INIT
  ======================= */

  loadLocation();
  renderCart();

});