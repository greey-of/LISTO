document.addEventListener("DOMContentLoaded", function () {

  /* ==========================================================================
     ELEMENTOS DOM
     ========================================================================== */
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

  // Elementos del formulario de Pago
  const paymentRadios = document.querySelectorAll('input[name="payment-method"]');
  const cardFormContainer = document.getElementById('card-form-container');
  const nameCard = document.getElementById('online-card-name');
  const numCard = document.getElementById('online-card-number');
  const expCard = document.getElementById('online-card-expiry');
  const cvvCard = document.getElementById('online-card-cvv');
  const formElement = document.getElementById('payment-form') || document.querySelector('form');

  /* ==========================================================================
     FOOD PREVIEW
     ========================================================================== */
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
      if (preview) preview.style.display = "none";
    });
  });

  /* ==========================================================================
     UTILIDADES & LOCALSTORAGE
     ========================================================================== */
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

  /* ==========================================================================
     FILTRADO ULTRA-ESTRICTO EN TIEMPO REAL
     ========================================================================== */
  if (nameCard) {
    nameCard.addEventListener('input', function () {
      // Bloquea números y caracteres especiales. Solo letras y espacios.
      this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    });
  }

  if (numCard) {
    numCard.addEventListener('input', function () {
      let value = this.value.replace(/\D/g, ''); // Destruye todo lo que no sea número
      let formatted = value.match(/.{1,4}/g)?.join(' ') || value; // Agrupa de 4 en 4 con espacios
      this.value = formatted;
    });
  }

  if (expCard) {
    expCard.addEventListener('input', function () {
      let value = this.value.replace(/\D/g, ''); // Solo números
      if (value.length > 2) {
        this.value = value.slice(0, 2) + '/' + value.slice(2, 4);
      } else {
        this.value = value;
      }
    });
  }

  if (cvvCard) {
    cvvCard.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, ''); // Elimina letras y caracteres especiales al instante
    });
  }

  // Alternar visualización de los métodos de pago
  if (paymentRadios.length && cardFormContainer) {
    paymentRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'tarjeta') {
          cardFormContainer.style.display = 'block';
        } else {
          cardFormContainer.style.display = 'none';
          // Limpiar inputs al regresar a efectivo
          if (nameCard) nameCard.value = '';
          if (numCard) numCard.value = '';
          if (expCard) expCard.value = '';
          if (cvvCard) cvvCard.value = '';
        }
      });
    });
  }

  /* ==========================================================================
     RENDERIZADO DEL CARRITO
     ========================================================================== */
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

  /* ==========================================================================
     MANEJADOR DEFINITIVO DE VALIDACIÓN ANTES DE PAGAR
     ========================================================================== */
  const procesarPagoConValidacion = function (event) {
    const cart = getCart();

    if (!cart.length) {
      event.preventDefault();
      alert("El carrito está vacío. Agrega productos antes de pagar.");
      return false;
    }

    const selectedRadio = document.querySelector('input[name="payment-method"]:checked');
    const metodoSeleccionado = selectedRadio ? selectedRadio.value : 'efectivo';

    if (metodoSeleccionado === 'tarjeta') {
      // 1. Validar campo Nombre
      if (nameCard && nameCard.value.trim() === "") {
        event.preventDefault();
        alert('Por favor, ingresa el nombre del titular de la tarjeta.');
        nameCard.focus();
        return false;
      }

      // 2. Validar Número de tarjeta completo
      const cleanNum = numCard ? numCard.value.replace(/\s/g, '') : '';
      if (cleanNum.length < 16) {
        event.preventDefault();
        alert('Por favor, ingresa un número de tarjeta válido de 16 dígitos.');
        if (numCard) numCard.focus();
        return false;
      }

      // 3. Validar Expiración Coherente (Mes 01 al 12)
      const expValue = expCard ? expCard.value : '';
      const partes = expValue.split('/');
      const mes = parseInt(partes[0], 10);
      if (expValue.length < 5 || isNaN(mes) || mes > 12 || mes === 0) {
        event.preventDefault();
        alert('Por favor, ingresa una fecha de expiración válida (Mes: 01-12).');
        if (expCard) expCard.focus();
        return false;
      }

      // 4. Validar CVV
      if (cvvCard && cvvCard.value.length < 3) {
        event.preventDefault();
        alert('Por favor, ingresa el código de seguridad CVC de 3 dígitos.');
        cvvCard.focus();
        return false;
      }
    }

    // Si supera las validaciones de la tarjeta o se seleccionó efectivo:
    event.preventDefault();
    if (checkoutButton) {
      checkoutButton.disabled = true;
      checkoutButton.textContent = 'Procesando...';
    }

    setTimeout(() => {
      const orderId = 'LST-' + (Math.floor(1000 + Math.random() * 9000));
      localStorage.setItem('listo_last_order', orderId);

      const minutes = 12;
      const endTime = Date.now() + minutes * 60 * 1000;
      localStorage.setItem('listo_order_end_' + orderId, endTime);

      localStorage.setItem('listo_last_order_data', JSON.stringify({
        id: orderId,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        items: cart,
        paymentMethod: metodoSeleccionado,
        location: localStorage.getItem('listo_location') || 'Ubicación no seleccionada'
      }));
      
      localStorage.removeItem('listo_cart');
      window.location.href = 'confirm.html';
    }, 1200);
  };

  // Interceptores de control para procesar el pago seguro
  if (formElement) formElement.addEventListener("submit", procesarPagoConValidacion);
  if (checkoutButton) checkoutButton.addEventListener("click", function (e) {
    if (!formElement) procesarPagoConValidacion(e);
  });

  /* ==========================================================================
     UBICACIONES, LOGIN Y CONFIGURACIÓN INICIAL
     ========================================================================== */
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
      const email = this.querySelector("input[type='email']")?.value.trim();
      const password = this.querySelector("input[type='password']")?.value.trim();
      if (!name || !email || !password) return;
      localStorage.setItem("listo_user", JSON.stringify({ name, email }));
      window.location.href = "edificios.html";
    });
  }

  locationButtons.forEach(button => {
    button.addEventListener("click", function () {
      const locationName = this.dataset.location;
      if (locationName) setLocation(locationName);
    });
  });

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

  const addButtons = document.querySelectorAll(".add-to-cart");
  addButtons.forEach(button => {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      addToCart(button.dataset.name, parseFloat(button.dataset.price));
    });
  });

  if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", function (event) {
      const target = event.target;
      const name = target.dataset.name;
      if (target.classList.contains("cart-increase")) changeQuantity(name, 1);
      if (target.classList.contains("cart-decrease")) changeQuantity(name, -1);
      if (target.classList.contains("cart-remove")) removeItem(name);
    });
  }

  // Inicialización
  loadLocation();
  renderCart();
});