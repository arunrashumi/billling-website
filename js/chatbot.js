const Chatbot = {
  launcher: null,
  panel: null,
  closeBtn: null,
  form: null,
  input: null,
  messages: null,

  init() {
    this.launcher = document.getElementById('chatbotLauncher');
    this.panel = document.getElementById('chatbotPanel');
    this.closeBtn = document.getElementById('chatbotClose');
    this.form = document.getElementById('chatbotForm');
    this.input = document.getElementById('chatbotInput');
    this.messages = document.getElementById('chatbotMessages');

    if (!this.launcher || !this.panel || !this.closeBtn || !this.form || !this.input || !this.messages) {
      return;
    }

    this.launcher.addEventListener('click', () => this.togglePanel());
    this.closeBtn.addEventListener('click', () => this.closePanel());
    this.form.addEventListener('submit', (event) => this.handleSubmit(event));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !this.panel.classList.contains('hidden')) {
        this.closePanel();
      }
    });

    this.addMessage(
      'Hello! I am your restaurant assistant. Ask me about the menu, ordering, billing, payment, or sales reports. For example: "Can I order Poori?"',
      'assistant'
    );
  },

  togglePanel() {
    this.panel.classList.toggle('hidden');
    if (!this.panel.classList.contains('hidden')) {
      this.input.focus();
    }
  },

  closePanel() {
    this.panel.classList.add('hidden');
  },

  handleSubmit(event) {
    event.preventDefault();
    const text = this.input.value.trim();
    if (!text) {
      return;
    }

    this.addMessage(text, 'user');
    this.input.value = '';
    this.input.focus();

    const response = this.generateResponse(text);

    setTimeout(() => {
      this.addMessage(response, 'assistant');
    }, 250);
  },

  addMessage(text, role) {
    const message = document.createElement('div');
    message.className = `chatbot-message ${role}`;
    message.textContent = text;
    this.messages.appendChild(message);
    this.scrollToBottom();
  },

  scrollToBottom() {
    this.messages.scrollTop = this.messages.scrollHeight;
  },

  generateResponse(query) {
    const lower = query.toLowerCase();
    const menuItems = Menu.getAll();
    const cartTotal = Cart.getTotal();
    const cartCount = Cart.items.reduce((sum, item) => sum + item.qty, 0);
    const defaultMonth = document.getElementById('salesMonth')?.value || '';
    let salesSummary = { totalRevenue: 0, orderCount: 0, bestSeller: '—' };

    if (defaultMonth) {
      const [year, month] = defaultMonth.split('-').map(Number);
      salesSummary = Sales.getSummary(Sales.getForMonth(year, month - 1));
    }

    const orderKeywords = ['order', 'want', 'buy', 'get', 'how to order', 'please add', 'can i order'];
    const matchedMenuItem = menuItems.find((item) => lower.includes(item.name.toLowerCase()));

    if (matchedMenuItem && orderKeywords.some((word) => lower.includes(word))) {
      return `Yes, you can order ${matchedMenuItem.name}. Just tap it from the menu and it will be added to your bill. When you're ready, use Pay Now or Print Bill to complete the order.`;
    }

    if (matchedMenuItem && (lower.includes('how') || lower.includes('tell me') || lower.includes('can i'))) {
      return `I see you want ${matchedMenuItem.name}. Tap the ${matchedMenuItem.name} card to add it to your bill, then pay with UPI or print the bill.`;
    }

    if (lower.includes('menu') || lower.includes('items') || lower.includes('food')) {
      const names = menuItems.map((item) => `${item.name} (${Menu.formatPrice(item.price)})`).join(', ');
      return `Current menu items are: ${names}. Tap any item to add it to the bill.`;
    }

    if (lower.includes('cart') || lower.includes('bill') || lower.includes('total') || lower.includes('checkout')) {
      if (Cart.isEmpty()) {
        return 'Your cart is empty. Select menu items to add them to your bill and view the total.';
      }
      return `You have ${cartCount} item${cartCount === 1 ? '' : 's'} in the cart with a total of ${Menu.formatPrice(cartTotal)}. Use Pay Now to complete payment or Print Bill to get a receipt.`;
    }

    if (lower.includes('sales') || lower.includes('report') || lower.includes('best seller') || lower.includes('revenue')) {
      return `For the selected month, total revenue is ${Menu.formatPrice(salesSummary.totalRevenue)}, orders: ${salesSummary.orderCount}, best seller: ${salesSummary.bestSeller}. Use the sales tab to unlock the full report.`;
    }

    if (lower.includes('pay') || lower.includes('upi') || lower.includes('payment')) {
      return 'To accept payment, click Pay Now. Then scan the generated UPI QR or use the shop QR code and enter the bill amount manually.';
    }

    if (lower.includes('settings') || lower.includes('shop name') || lower.includes('admin pin')) {
      return 'In Settings, you can update the restaurant name, UPI ID, and admin PIN. The admin PIN unlocks menu management and the sales report.';
    }

    if (lower.includes('help') || lower.includes('how do i')) {
      return 'Try asking about the menu, ordering, cart total, payment process, or sales report. For example: "Can I order Poori?" or "What is my cart total?"';
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return 'Hi there! I can help with menu items, billing, payments, and sales. What would you like to do?';
    }

    return 'I can help with billing, menu items, payments, and sales. Please ask a question like: What is in my cart? or How do I pay with UPI?';
  }
};
