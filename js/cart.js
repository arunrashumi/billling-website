const Cart = {
  items: [],

  init() {
    this.items = Storage.getCart();
    return this.items;
  },

  save() {
    Storage.setCart(this.items);
  },

  add(menuItem) {
    const existing = this.items.find((i) => i.menuId === menuItem.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({
        menuId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        qty: 1
      });
    }
    this.save();
    return this.items;
  },

  updateQty(menuId, delta) {
    const item = this.items.find((i) => i.menuId === menuId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      this.items = this.items.filter((i) => i.menuId !== menuId);
    }
    this.save();
  },

  clear() {
    this.items = [];
    this.save();
  },

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  },

  isEmpty() {
    return this.items.length === 0;
  },

  getSnapshot() {
    return this.items.map((item) => ({
      menuId: item.menuId,
      name: item.name,
      price: item.price,
      qty: item.qty,
      lineTotal: item.price * item.qty
    }));
  },

  render(container, emptyEl, totalEl) {
    if (this.isEmpty()) {
      container.innerHTML = '';
      emptyEl.classList.remove('hidden');
      totalEl.textContent = '₹0';
      return;
    }

    emptyEl.classList.add('hidden');
    container.innerHTML = this.items
      .map(
        (item) => `
      <div class="cart-line" data-menu-id="${item.menuId}">
        <div class="cart-line-info">
          <div class="cart-line-name">${item.name}</div>
          <div class="cart-line-price">${Menu.formatPrice(item.price)} each</div>
        </div>
        <div class="cart-line-qty">
          <button class="qty-btn" data-qty-minus="${item.menuId}">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-qty-plus="${item.menuId}">+</button>
        </div>
        <div class="cart-line-total">${Menu.formatPrice(item.price * item.qty)}</div>
      </div>
    `
      )
      .join('');

    totalEl.textContent = Menu.formatPrice(this.getTotal());
  }
};
