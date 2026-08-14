const Billing = {
  qrInstance: null,
  SHOP_QR: 'assets/images/payment-qr.png',

  buildUpiLink(amount) {
    const settings = Storage.getSettings();
    const payeeName = encodeURIComponent(settings.shopName || 'MOHAMMED RAFI S');
    const upiId = encodeURIComponent(settings.upiId.trim());
    const amt = Number(amount).toFixed(2);
    return `upi://pay?pa=${upiId}&pn=${payeeName}&mc=0000&mode=02&purpose=00&am=${amt}&cu=INR`;
  },

  renderDynamicQr(container, upiLink) {
    container.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
      this.qrInstance = new QRCode(container, {
        text: upiLink,
        width: 220,
        height: 220,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
      return true;
    }
    container.innerHTML = `<p class="pay-error">QR could not load. Pay manually to <strong>${Storage.getSettings().upiId}</strong></p>`;
    return false;
  },

  showPayModal(total) {
    const settings = Storage.getSettings();
    if (!settings.upiId || !settings.upiId.trim()) {
      alert('Please set your UPI ID in Settings first.');
      return false;
    }

    const modal = document.getElementById('payModal');
    const amountEl = document.getElementById('payAmount');
    const upiIdEl = document.getElementById('payUpiId');
    const dynamicQr = document.getElementById('dynamicQr');
    const shopQr = document.getElementById('shopQr');

    const formatted = Menu.formatPrice(total);
    amountEl.textContent = formatted;
    const amountCopy = document.getElementById('payAmountCopy');
    if (amountCopy) amountCopy.textContent = formatted;
    if (upiIdEl) upiIdEl.textContent = settings.upiId;

    const upiLink = this.buildUpiLink(total);
    this.renderDynamicQr(dynamicQr, upiLink);

    if (shopQr) {
      shopQr.src = this.SHOP_QR;
      shopQr.alt = 'GPay shop QR for ' + settings.upiId;
    }

    modal.classList.remove('hidden');
    return true;
  },

  closePayModal() {
    document.getElementById('payModal').classList.add('hidden');
    const dynamicQr = document.getElementById('dynamicQr');
    if (dynamicQr) dynamicQr.innerHTML = '';
    this.qrInstance = null;
  },

  markAsPaid() {
    const total = Cart.getTotal();
    const sale = {
      id: Storage.generateId(),
      timestamp: new Date().toISOString(),
      items: Cart.getSnapshot(),
      total
    };

    const sales = Storage.getSales();
    sales.push(sale);
    Storage.setSales(sales);

    Cart.clear();
    this.closePayModal();
    return sale;
  },

  preparePrintReceipt() {
    const settings = Storage.getSettings();
    const now = new Date();

    document.getElementById('printShopName').textContent = settings.shopName || 'South Indian Restaurant';
    document.getElementById('printDate').textContent = now.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const tbody = document.getElementById('printItems');
    tbody.innerHTML = Cart.items
      .map(
        (item) => `
      <tr>
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td>${Menu.formatPrice(item.price)}</td>
        <td>${Menu.formatPrice(item.price * item.qty)}</td>
      </tr>
    `
      )
      .join('');

    document.getElementById('printTotal').textContent = Menu.formatPrice(Cart.getTotal());
  },

  printBill() {
    if (Cart.isEmpty()) {
      alert('Cart is empty. Add items before printing.');
      return;
    }
    this.preparePrintReceipt();
    window.print();
  }
};
