(function () {
  const orderNumberEl = document.getElementById('order-number');
  const orderListEl = document.getElementById('order-list');
  const orderTotalEl = document.getElementById('order-total');
  const qrImg = document.getElementById('qr-img');
  const countdownEl = document.getElementById('countdown');
  const pickupBtn = document.getElementById('pickup-btn');
  const locationInfo = document.getElementById('location-info');

  const formatPrice = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v);

  const storedOrder = JSON.parse(localStorage.getItem('listo_last_order_data') || 'null');
  const orderId = storedOrder?.id || localStorage.getItem('listo_last_order') || 'LST-' + (Math.floor(1000 + Math.random() * 9000));
  if (!localStorage.getItem('listo_last_order')) {
    localStorage.setItem('listo_last_order', orderId);
  }
  orderNumberEl.textContent = orderId;

  let total = 0;
  let items = [];
  let location = localStorage.getItem('listo_location') || 'Ubicación no seleccionada';

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
  orderTotalEl.textContent = formatPrice(total);

  if (locationInfo) {
    locationInfo.textContent = location;
  }

  const qrData = JSON.stringify({ orderId, total, items });
  const qrUrl = 'https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=' + encodeURIComponent(qrData);
  qrImg.src = qrUrl;

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
    const now = Date.now();
    const diff = Math.max(0, endTime - now);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    countdownEl.textContent = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
    if (diff <= 0) {
      clearInterval(timerInterval);
      countdownEl.textContent = '00:00';
      pickupBtn.textContent = 'PEDIDO LISTO - RECOGER';
      pickupBtn.classList.remove('btn-primary');
      pickupBtn.classList.add('btn-secondary');
    }
  };

  updateTimer();
  const timerInterval = setInterval(updateTimer, 1000);

  pickupBtn.addEventListener('click', () => {
    alert(`Pedido ${orderId} marcado como listo. Presenta este QR para recogerlo.`);
  });
})();
