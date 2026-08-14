const App = {
  adminUnlocked: {
    manage: false,
    sales: false
  },

  editingId: null,

  init() {
    Menu.init();
    Cart.init();
    Storage.ensurePaymentDefaults();
    this.loadSettings();
    this.renderAll();
    this.bindEvents();
    Chatbot.init();
    this.setDefaultSalesMonth();
  },

  loadSettings() {
    const settings = Storage.getSettings();
    document.getElementById('shopName').value = settings.shopName || '';
    document.getElementById('upiId').value = settings.upiId || '';
    document.getElementById('adminPin').value = settings.adminPin || '1234';
    document.getElementById('headerShopName').textContent = settings.shopName || 'South Indian Restaurant';
  },

  setDefaultSalesMonth() {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('salesMonth').value = month;
  },

  renderCart() {
    Cart.render(
      document.getElementById('cartItems'),
      document.getElementById('cartEmpty'),
      document.getElementById('cartTotal')
    );
    document.getElementById('cartCount').textContent = `${Cart.items.reduce((total, item) => total + item.qty, 0)} item${Cart.items.length === 1 ? '' : 's'}`;
    document.getElementById('cartAmount').textContent = Menu.formatPrice(Cart.getTotal());
    document.getElementById('orderNote').value = Storage.getOrderNote();
  },

  renderAll() {
    Menu.renderGrid(document.getElementById('menuGrid'));
    Menu.renderSpecials(document.getElementById('specialsGrid'));
    this.renderCart();
    if (this.adminUnlocked.manage) {
      Menu.renderTable(document.getElementById('menuTableBody'));
    }
    if (this.adminUnlocked.sales) {
      Sales.render(document.getElementById('salesMonth').value);
    }
  },

  switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.section').forEach((section) => {
      section.classList.toggle('active', section.id === tabName);
    });

    if (tabName === 'sales' && this.adminUnlocked.sales) {
      Sales.render(document.getElementById('salesMonth').value);
    }
  },

  verifyPin(pin) {
    const settings = Storage.getSettings();
    return pin === (settings.adminPin || '1234');
  },

  unlockSection(section) {
    this.adminUnlocked[section] = true;
    if (section === 'manage') {
      document.getElementById('pinGateManage').classList.add('hidden');
      document.getElementById('manageContent').classList.remove('hidden');
      Menu.renderTable(document.getElementById('menuTableBody'));
    } else if (section === 'sales') {
      document.getElementById('pinGateSales').classList.add('hidden');
      document.getElementById('salesContent').classList.remove('hidden');
      Sales.render(document.getElementById('salesMonth').value);
    }
  },

  resetMenuForm() {
    this.editingId = null;
    document.getElementById('menuForm').reset();
    document.getElementById('menuItemId').value = '';
    document.getElementById('btnSaveMenu').textContent = 'Add Item';
  },

  bindEvents() {
    document.querySelectorAll('.nav-tab').forEach((btn) => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    document.getElementById('menuGrid').addEventListener('click', (e) => {
      const card = e.target.closest('.menu-card');
      if (!card) return;
      const item = Menu.getById(card.dataset.id);
      if (item) {
        Cart.add(item);
        this.renderCart();
      }
    });

    document.getElementById('menuSearch').addEventListener('input', (e) => {
      Menu.filterGrid(e.target.value);
    });

    const heroBrowseBtn = document.getElementById('heroBrowseBtn');
    if (heroBrowseBtn) {
      heroBrowseBtn.addEventListener('click', () => {
        document.getElementById('menuSearch').focus();
        window.scrollTo({ top: document.getElementById('menuSearch').offsetTop - 120, behavior: 'smooth' });
      });
    }

    document.getElementById('menuGrid').addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.menu-card');
      if (!card) return;
      e.preventDefault();
      const item = Menu.getById(card.dataset.id);
      if (item) {
        Cart.add(item);
        this.renderCart();
      }
    });

    document.getElementById('cartItems').addEventListener('click', (e) => {
      const minus = e.target.dataset.qtyMinus;
      const plus = e.target.dataset.qtyPlus;
      if (minus) {
        Cart.updateQty(minus, -1);
        this.renderCart();
      } else if (plus) {
        Cart.updateQty(plus, 1);
        this.renderCart();
      }
    });

    document.getElementById('btnClearCart').addEventListener('click', () => {
      if (Cart.isEmpty()) return;
      if (confirm('Clear all items from cart?')) {
        Cart.clear();
        Storage.setOrderNote('');
        this.renderCart();
      }
    });

    document.getElementById('btnPrintBill').addEventListener('click', () => {
      Billing.printBill();
    });

    document.getElementById('btnPayNow').addEventListener('click', () => {
      if (Cart.isEmpty()) {
        alert('Cart is empty. Add items first.');
        return;
      }
      Billing.showPayModal(Cart.getTotal());
    });

    document.getElementById('orderNote').addEventListener('input', (e) => {
      Storage.setOrderNote(e.target.value);
    });

    document.getElementById('closePayModal').addEventListener('click', () => {
      Billing.closePayModal();
    });

    document.getElementById('btnMarkPaid').addEventListener('click', () => {
      Billing.markAsPaid();
      this.renderCart();
      alert('Payment recorded! Sale saved to monthly report.');
    });

    document.getElementById('payModal').addEventListener('click', (e) => {
      if (e.target.id === 'payModal') Billing.closePayModal();
    });

    document.querySelectorAll('.pay-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const method = tab.dataset.show;
        document.querySelectorAll('.pay-tab').forEach((t) => t.classList.toggle('active', t === tab));
        document.querySelectorAll('.pay-method').forEach((panel) => {
          panel.classList.toggle('active', panel.dataset.method === method);
        });
      });
    });

    document.getElementById('btnPinManage').addEventListener('click', () => {
      const pin = document.getElementById('pinInputManage').value;
      if (this.verifyPin(pin)) {
        document.getElementById('pinErrorManage').textContent = '';
        this.unlockSection('manage');
      } else {
        document.getElementById('pinErrorManage').textContent = 'Incorrect PIN';
      }
    });

    document.getElementById('btnPinSales').addEventListener('click', () => {
      const pin = document.getElementById('pinInputSales').value;
      if (this.verifyPin(pin)) {
        document.getElementById('pinErrorSales').textContent = '';
        this.unlockSection('sales');
      } else {
        document.getElementById('pinErrorSales').textContent = 'Incorrect PIN';
      }
    });

    document.getElementById('pinInputManage').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('btnPinManage').click();
    });

    document.getElementById('pinInputSales').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('btnPinSales').click();
    });

    document.getElementById('menuForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('menuName').value.trim();
      const price = parseInt(document.getElementById('menuPrice').value, 10);
      let image = document.getElementById('menuImageUrl').value.trim();
      const fileInput = document.getElementById('menuImageFile');

      if (fileInput.files.length > 0) {
        image = await this.readFileAsDataUrl(fileInput.files[0]);
      }

      if (!image) {
        image = 'assets/images/placeholder.svg';
      }

      if (this.editingId) {
        Menu.update(this.editingId, { name, price, image });
      } else {
        Menu.add({ name, price, image });
      }

      this.resetMenuForm();
      Menu.renderGrid(document.getElementById('menuGrid'));
      Menu.renderTable(document.getElementById('menuTableBody'));
    });

    document.getElementById('btnCancelEdit').addEventListener('click', () => {
      this.resetMenuForm();
    });

    document.getElementById('menuTableBody').addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-edit], [data-delete]');
      if (!actionEl) return;

      const editId = actionEl.dataset.edit;
      const deleteId = actionEl.dataset.delete;

      if (editId) {
        const item = Menu.getById(editId);
        if (!item) return;
        this.editingId = editId;
        document.getElementById('menuItemId').value = editId;
        document.getElementById('menuName').value = item.name;
        document.getElementById('menuPrice').value = item.price;
        document.getElementById('menuImageUrl').value = item.image.startsWith('data:') ? '' : item.image;
        document.getElementById('btnSaveMenu').textContent = 'Update Item';
      }

      if (deleteId) {
        if (confirm('Delete this menu item?')) {
          Menu.delete(deleteId);
          Menu.renderGrid(document.getElementById('menuGrid'));
          Menu.renderTable(document.getElementById('menuTableBody'));
        }
      }
    });

    document.getElementById('settingsForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const settings = {
        shopName: document.getElementById('shopName').value.trim() || 'South Indian Restaurant',
        upiId: document.getElementById('upiId').value.trim(),
        adminPin: document.getElementById('adminPin').value || '1234'
      };
      Storage.setSettings(settings);
      document.getElementById('headerShopName').textContent = settings.shopName;
      alert('Settings saved!');
    });

    document.getElementById('salesMonth').addEventListener('change', (e) => {
      if (this.adminUnlocked.sales) {
        Sales.render(e.target.value);
      }
    });

    document.getElementById('btnExportCsv').addEventListener('click', () => {
      Sales.exportCsv(document.getElementById('salesMonth').value);
    });
  },

  readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
