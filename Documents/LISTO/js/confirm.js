document.addEventListener('DOMContentLoaded', function () {
  // ==========================================================================
  // 1. CAPTURA DE ELEMENTOS DEL DOM
  // ==========================================================================
  const orderNumberEl = document.getElementById('order-number');
  const orderListEl = document.getElementById('order-list');
  const orderTotalEl = document.getElementById('order-total');
  const qrImg = document.getElementById('qr-element');
  const countdownEl = document.getElementById('countdown');
  const pickupBtn = document.getElementById('pickup-btn') || document.querySelector('.btn-success') || document.querySelector('button');
  const locationInfo = document.getElementById('location-info');

  const formatPrice = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v);

  // ==========================================================================
  // 2. RECUPERACIÓN DE DATOS DEL PEDIDO (LOCALSTORAGE)
  // ==========================================================================
  const storedOrder = JSON.parse(localStorage.getItem('listo_last_order_data') || 'null');
  const orderId = storedOrder?.id || localStorage.getItem('listo_last_order') || 'LST-' + (Math.floor(1000 + Math.random() * 9000));
  
  if (!localStorage.getItem('listo_last_order')) {
    localStorage.setItem('listo_last_order', orderId);
  }
  
  if (orderNumberEl) {
    orderNumberEl.textContent = orderId;
  }

  let total = 0;
  let items = [];
  let location = localStorage.getItem('listo_location') || 'Ubicación no seleccionada';
  let metodoPago = storedOrder?.paymentMethod || 'efectivo';

  if (storedOrder && storedOrder.items?.length) {
    items = storedOrder.items;
    total = storedOrder.total || items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    location = storedOrder.location || location;
  } else {
    const cart = JSON.parse(localStorage.getItem('listo_cart') || '[]');
    if (cart.length) {
      items = cart;
      total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
  }

  // ==========================================================================
  // 3. RENDERIZADO DE LA TABLA DE ARTÍCULOS
  // ==========================================================================
  if (orderListEl) {
    if (!items.length) {
      orderListEl.innerHTML = '<p class="summary-text">No hay artículos en el pedido.</p>';
    } else {
      orderListEl.innerHTML = '';
      items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'order-item';
        const subtotal = item.price * item.quantity;
        row.innerHTML = `<div><strong>${item.quantity}x ${item.name}</strong><div class="summary-text">${formatPrice(item.price)} c/u</div></div><div><strong>${formatPrice(subtotal)}</strong></div>`;
        orderListEl.appendChild(row);
      });
    }
  }
  
  if (orderTotalEl) {
    orderTotalEl.textContent = formatPrice(total);
  }
  
  if (locationInfo) {
    locationInfo.textContent = location;
  }

 // ==========================================================================
  // 4. GENERACIÓN DEL CÓDIGO QR LOCAL E INFALIBLE
  // ==========================================================================
  const qrContainer = document.getElementById('qr-element');
  
  if (qrContainer) {
    // Limpiamos el contenedor por si acaso
    qrContainer.innerHTML = '';

    // Texto plano optimizado para el ticket
    const textoQr = `Pedido: ${orderId}\nTotal: ${formatPrice(total)}\nPago: ${metodoPago}\nUbicacion: ${location}`;

    // Inicializamos el generador nativo dentro del div
    new QRCode(qrContainer, {
      text: textoQr,
      width: 150,
      height: 150,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });
  }

  // ==========================================================================
  // 5. TEMPORIZADOR EN CUENTA REGRESIVA
  // ==========================================================================
  const previouslySetEnd = localStorage.getItem('listo_order_end_' + orderId);
  let endTime;
  if (previouslySetEnd) {
    endTime = parseInt(previouslySetEnd, 10);
  } else {
    const minutes = 12;
    endTime = Date.now() + minutes * 60 * 1000;
    localStorage.setItem('listo_order_end_' + orderId, endTime);
  }

  const updateTimer = () => {
    if (!countdownEl) return;
    
    const now = Date.now();
    const diff = Math.max(0, endTime - now);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    countdownEl.textContent = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
    
    if (diff <= 0) {
      clearInterval(timerInterval);
      countdownEl.textContent = '00:00';
      if (pickupBtn) {
        pickupBtn.textContent = 'PEDIDO LISTO - RECOGER';
        pickupBtn.classList.remove('btn-primary');
        pickupBtn.classList.add('btn-secondary');
      }
    }
  };

  updateTimer();
  const timerInterval = setInterval(updateTimer, 1000);

  if (pickupBtn) {
    pickupBtn.addEventListener('click', () => {
      alert(`Pedido ${orderId} marcado como listo. Presenta este QR en caja para recoger tu orden.`);
    });
  }
});