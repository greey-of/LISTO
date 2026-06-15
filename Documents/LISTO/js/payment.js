document.addEventListener('DOMContentLoaded', function () {
  const orderList = document.getElementById('payment-order-list');
  const totalEl = document.getElementById('payment-total');
  const form = document.getElementById('payment-form');
  const payButton = document.getElementById('pay-button');

  const formatPrice = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v);
  const cart = JSON.parse(localStorage.getItem('listo_cart') || '[]');
  if (!cart.length) {
    orderList.innerHTML = '<p class="summary-text">El carrito está vacío.</p>';
    payButton.disabled = true;
  } else {
    let total = 0;
    cart.forEach(item => {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      const row = document.createElement('div');
      row.className = 'order-item';
      row.innerHTML = `<div><strong>${item.quantity}x ${item.name}</strong><div class="summary-text">${formatPrice(item.price)} cada uno</div></div><div><strong>${formatPrice(subtotal)}</strong></div>`;
      orderList.appendChild(row);
    });
    totalEl.textContent = formatPrice(total);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    payButton.disabled = true;
    payButton.textContent = 'Procesando...';

    // Simulate payment processing
    setTimeout(() => {
      const orderId = 'LST-' + (Math.floor(1000 + Math.random() * 9000));
      localStorage.setItem('listo_last_order', orderId);

      const minutes = 12;
      const endTime = Date.now() + minutes * 60 * 1000;
      localStorage.setItem('listo_order_end_' + orderId, endTime);

      // Save order snapshot and clear cart for next session
      localStorage.setItem('listo_last_order_data', JSON.stringify({
        id: orderId,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        items: cart,
        location: localStorage.getItem('listo_location') || 'Ubicación no seleccionada'
      }));
      localStorage.removeItem('listo_cart');

      window.location.href = 'confirm.html';
    }, 1200);
  });
});
