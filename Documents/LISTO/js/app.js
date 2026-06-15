document.addEventListener("DOMContentLoaded", function () {
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

  const formatPrice = (value) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  const getCart = () => JSON.parse(localStorage.getItem("listo_cart") || "[]");

  const saveCart = (cart) => {
    localStorage.setItem("listo_cart", JSON.stringify(cart));
    updateCartCount(cart);
  };

  const updateCartCount = (cart) => {
    if (!cartCountLabel) return;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountLabel.textContent = totalItems;
  };

  const renderCart = () => {
    if (!cartItemsContainer || !cartTotalElement) return;

    const cart = getCart();
    cartItemsContainer.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart">Tu carrito está vacío. Agrega algo del menú.</p>';
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
          <span class="summary-text">${formatPrice(item.price)} cada uno</span>
          <span class="summary-text">Subtotal: ${formatPrice(item.price * item.quantity)}</span>
        </div>
        <div class="cart-item-control">
          <div class="control-buttons">
            <button class="btn btn-secondary btn-sm cart-decrease" data-name="${item.name}" type="button">−</button>
            <button class="btn btn-secondary btn-sm cart-increase" data-name="${item.name}" type="button">+</button>
          </div>
          <button class="btn btn-secondary cart-remove" data-name="${item.name}" type="button">Eliminar</button>
        </div>
      `;
      cartItemsContainer.appendChild(itemElement);
    });

    cartTotalElement.textContent = formatPrice(total);
    saveCart(cart);
  };

  const addToCart = (name, price) => {
    const cart = getCart();
    const existingItem = cart.find((item) => item.name === name);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ name, price, quantity: 1 });
    }

    saveCart(cart);
    renderCart();
  };

  const changeQuantity = (name, delta) => {
    const cart = getCart();
    const item = cart.find((entry) => entry.name === name);
    if (!item) return;

    item.quantity = Math.max(0, item.quantity + delta);
    if (item.quantity === 0) {
      const index = cart.findIndex((entry) => entry.name === name);
      cart.splice(index, 1);
    }

    saveCart(cart);
    renderCart();
  };

  const removeItem = (name) => {
    const cart = getCart().filter((item) => item.name !== name);
    saveCart(cart);
    renderCart();
  };

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
    if (savedLocation) {
      if (selectedLocation) {
        selectedLocation.textContent = savedLocation;
        locationBanner?.classList.remove("hidden");
      }
      if (locationInfo) {
        locationInfo.textContent = `Ubicación: ${savedLocation}`;
      }
    }
  };

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

  if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = this.querySelector("input[type='text']")?.value.trim();
      const boletaInput = this.querySelector("input[type='text']:nth-of-type(2)")?.value.trim();
      const email = this.querySelector("input[type='email']")?.value.trim();
      const password = this.querySelector("input[type='password']")?.value.trim();
      if (!name || !boletaInput || !email || !password) return;

      localStorage.setItem("listo_user", JSON.stringify({ name, boleta: boletaInput, email }));
      window.location.href = "edificios.html";
    });
  }

  if (locationButtons.length) {
    locationButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const locationName = this.dataset.location;
        if (locationName) {
          setLocation(locationName);
        }
      });
    });
  }

  if (document.querySelectorAll(".add-to-cart").length) {
    document.querySelectorAll(".add-to-cart").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        addToCart(button.dataset.name, parseFloat(button.dataset.price));
      });
    });
  }

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

  if (checkoutButton) {
    checkoutButton.addEventListener("click", function () {
      const cart = getCart();
      if (!cart.length) {
        alert("El carrito está vacío. Agrega productos antes de pagar.");
        return;
      }
      // Redirect to payment page to continue checkout
      window.location.href = "payment.html";
    });
  }

  loadLocation();
  renderCart();
});
