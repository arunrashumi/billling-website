const Storage = {
  KEYS: {
    MENU: 'restaurant_menu_items',
    CART: 'restaurant_cart',
    ORDER_NOTE: 'restaurant_order_note',
    SALES: 'restaurant_sales_history',
    SETTINGS: 'restaurant_shop_settings'
  },

  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  getMenu() {
    return this.get(this.KEYS.MENU, []);
  },

  setMenu(items) {
    this.set(this.KEYS.MENU, items);
  },

  getCart() {
    return this.get(this.KEYS.CART, []);
  },

  setCart(items) {
    this.set(this.KEYS.CART, items);
  },

  getOrderNote() {
    return this.get(this.KEYS.ORDER_NOTE, '');
  },

  setOrderNote(note) {
    this.set(this.KEYS.ORDER_NOTE, note);
  },

  getSales() {
    return this.get(this.KEYS.SALES, []);
  },

  setSales(sales) {
    this.set(this.KEYS.SALES, sales);
  },

  DEFAULT_SETTINGS: {
    shopName: 'MOHAMMED RAFI S',
    upiId: '9360564243@axl',
    adminPin: '1234'
  },

  getSettings() {
    return { ...this.DEFAULT_SETTINGS, ...this.get(this.KEYS.SETTINGS, {}) };
  },

  setSettings(settings) {
    this.set(this.KEYS.SETTINGS, settings);
  },

  ensurePaymentDefaults() {
    const saved = this.get(this.KEYS.SETTINGS, {});
    const merged = { ...this.DEFAULT_SETTINGS, ...saved };
    if (!saved.upiId || !String(saved.upiId).trim()) {
      merged.upiId = this.DEFAULT_SETTINGS.upiId;
      merged.shopName = merged.shopName || this.DEFAULT_SETTINGS.shopName;
      this.setSettings(merged);
    }
    return this.getSettings();
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
};
