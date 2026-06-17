document.addEventListener('DOMContentLoaded', function () {
  const orderList = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const form = document.getElementById('payment-form');
  const payButton = document.getElementById('online-pay-button');

  const formatPrice = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v);
  const cart = JSON.parse(localStorage.getItem('listo_cart') || '[]');
  
  // Renderizar la lista de compras dinámicamente en el panel lateral
  if (orderList) {
    if (!cart.length) {
      orderList.innerHTML = '<p class="empty-cart">Tu carrito está vacío.</p>';
      if (payButton) payButton.disabled = true;
    } else {
      let total = 0;
      orderList.innerHTML = ''; // Limpiar texto de vacío
      cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        const row = document.createElement('div');
        row.className = 'cart-item'; // Mantiene tus estilos de menu.css intactos
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.marginBottom = '0.5rem';
        row.innerHTML = `<div><strong>${item.quantity}x ${item.name}</strong></div><div><strong>${formatPrice(subtotal)}</strong></div>`;
        orderList.appendChild(row);
      });
      if (totalEl) totalEl.textContent = formatPrice(total);
    }
  }

  // Captura de elementos interactivos de la tarjeta
  const paymentRadios = document.querySelectorAll('input[name="payment-method"]');
  const cardFormContainer = document.getElementById('card-form-container');
  const nameCard = document.getElementById('online-card-name');
  const numCard = document.getElementById('online-card-number');
  const expCard = document.getElementById('online-card-expiry');
  const cvvCard = document.getElementById('online-card-cvv');

  // Alternar el formulario de tarjeta o efectivo
  paymentRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'tarjeta') {
        cardFormContainer.style.display = 'block';
      } else {
        cardFormContainer.style.display = 'none';
        if (nameCard) nameCard.value = '';
        if (numCard) numCard.value = '';
        if (expCard) expCard.value = '';
        if (cvvCard) cvvCard.value = '';
      }
    });
  });

  // ==========================================================================
  // FILTRADO INMEDIATO EN TIEMPO REAL (BLOQUEO DE TECLAS INCORRECTAS)
  // ==========================================================================

  if (nameCard) {
    nameCard.addEventListener('input', (e) => {
      // Borra números y caracteres especiales. Solo letras y espacios.
      e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    });
  }

  if (numCard) {
    numCard.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, ''); // Destruye todo lo que no sea dígito
      let formatted = value.match(/.{1,4}/g)?.join(' ') || value; // Agrupa de 4 en 4
      e.target.value = formatted;
    });
  }

  if (expCard) {
    expCard.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, ''); // Solo números
      if (value.length > 2) {
        e.target.value = value.slice(0, 2) + '/' + value.slice(2, 4);
      } else {
        e.target.value = value;
      }
    });
  }

  if (cvvCard) {
    cvvCard.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, ''); // Destruye letras al instante
    });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault(); // Detiene el flujo por defecto para validar

      const selectedRadio = document.querySelector('input[name="payment-method"]:checked');
      const metodoSeleccionado = selectedRadio ? selectedRadio.value : 'efectivo';

      if (metodoSeleccionado === 'tarjeta') {
        // 1. Validar Nombre
        if (nameCard && nameCard.value.trim() === "") {
          alert('Por favor, ingresa el nombre del titular de la tarjeta.');
          nameCard.focus();
          return;
        }

        // 2. Validar Número de Tarjeta Completo
        const cleanNum = numCard ? numCard.value.replace(/\s/g, '') : '';
        if (cleanNum.length < 16) {
          alert('Por favor, ingresa un número de tarjeta válido de 16 dígitos.');
          if (numCard) numCard.focus();
          return;
        }

        // 3. Validar Fecha Coherente (Mes 01 a 12)
        const expValue = expCard ? expCard.value : '';
        const partes = expValue.split('/');
        const mes = parseInt(partes[0], 10);
        if (expValue.length < 5 || isNaN(mes) || mes > 12 || mes === 0) {
          alert('Por favor, ingresa una fecha de expiración válida (Mes: 01-12).');
          if (expCard) expCard.focus();
          return;
        }

        // 4. Validar CVV de 3 dígitos
        if (cvvCard && cvvCard.value.length < 3) {
          alert('Por favor, ingresa un código de seguridad CVC de 3 dígitos.');
          cvvCard.focus();
          return;
        }
      }

      // Si pasa los filtros o es efectivo, ejecuta la animación de carga original
      if (payButton) {
        payButton.disabled = true;
        payButton.textContent = 'Procesando...';
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
    });
  }
});