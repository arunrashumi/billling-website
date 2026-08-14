const Menu = {
  SEED_ITEMS: [
    { name: 'Idly', price: 70, image: 'assets/images/idly.svg' },
    { name: 'Puttu', price: 80, image: 'assets/images/puttu.svg' },
    { name: 'Poori', price: 65, image: 'assets/images/poori.svg' },
    { name: 'Coffee', price: 50, image: 'assets/images/coffee.svg' },
    { name: 'Dosai', price: 110, image: 'assets/images/dosai.svg' },
    { name: 'Vada', price: 30, image: 'assets/images/vada.svg' },
    { name: 'Pazhampori', price: 80, image: 'assets/images/pazhampori.svg' }
  ],

  init() {
    let items = Storage.getMenu();
    if (items.length === 0) {
      items = this.SEED_ITEMS.map((item) => ({
        id: Storage.generateId(),
        ...item
      }));
      Storage.setMenu(items);
    } else {
      const seedByName = Object.fromEntries(this.SEED_ITEMS.map(({ name, price, image }) => [name, { price, image }]));
      const existingNames = new Set();
      let updated = false;
      items = items.map((item) => {
        const seed = seedByName[item.name];
        if (seed) {
          existingNames.add(item.name);
          if (item.price !== seed.price || item.image !== seed.image) {
            updated = true;
            return { ...item, price: seed.price, image: seed.image };
          }
        }
        return item;
      });
      this.SEED_ITEMS.forEach((seed) => {
        if (!existingNames.has(seed.name)) {
          updated = true;
          items.push({ id: Storage.generateId(), ...seed });
        }
      });
      if (updated) {
        Storage.setMenu(items);
      }
    }
    return items;
  },

  getAll() {
    return Storage.getMenu();
  },

  getById(id) {
    return this.getAll().find((item) => item.id === id);
  },

  add(item) {
    const items = this.getAll();
    const newItem = { id: Storage.generateId(), ...item };
    items.push(newItem);
    Storage.setMenu(items);
    return newItem;
  },

  update(id, updates) {
    const items = this.getAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates, id };
    Storage.setMenu(items);
    return items[index];
  },

  delete(id) {
    const items = this.getAll().filter((item) => item.id !== id);
    Storage.setMenu(items);
  },

  formatPrice(price) {
    return '₹' + Number(price).toLocaleString('en-IN');
  },

  BADGE_MAP: {
    Popular: ['Idly', 'Puttu', 'Vada'],
    'Best Seller': ['Dosai', 'Coffee'],
    'Chef Special': ['Poori', 'Pazhampori']
  },

  getBadge(item) {
    const found = Object.entries(this.BADGE_MAP).find(([, names]) => names.includes(item.name));
    return found ? found[0] : '';
  },

  renderBadge(item) {
    const badge = this.getBadge(item);
    return badge ? `<span class="item-badge">${badge}</span>` : '';
  },

  filterGrid(query) {
    const normalized = query.trim().toLowerCase();
    const items = this.getAll().filter((item) => item.name.toLowerCase().includes(normalized));
    const container = document.getElementById('menuGrid');
    container.innerHTML = items
      .map(
        (item) => `
      <div class="menu-card" data-id="${item.id}" role="button" tabindex="0">
        ${this.renderBadge(item)}
        <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/placeholder.svg'">
        <div class="menu-card-info">
          <div class="menu-card-name">${item.name}</div>
          <div class="menu-card-price">${this.formatPrice(item.price)}</div>
        </div>
      </div>
    `
      )
      .join('');
  },

  renderGrid(container) {
    const items = this.getAll();
    container.innerHTML = items
      .map(
        (item) => `
      <div class="menu-card" data-id="${item.id}" role="button" tabindex="0">
        ${this.renderBadge(item)}
        <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/placeholder.svg'">
        <div class="menu-card-info">
          <div class="menu-card-name">${item.name}</div>
          <div class="menu-card-price">${this.formatPrice(item.price)}</div>
        </div>
      </div>
    `
      )
      .join('');
  },

  renderSpecials(container) {
    const specialNames = ['Poori', 'Dosai', 'Idly'];
    const items = this.getAll().filter((item) => specialNames.includes(item.name));
    container.innerHTML = items
      .map((item) => `
      <div class="special-card menu-card" data-id="${item.id}" role="button" tabindex="0">
        <div class="special-card-media">
          ${this.renderBadge(item)}
          <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/placeholder.svg'">
        </div>
        <div class="menu-card-info">
          <div class="menu-card-name">${item.name}</div>
          <div class="menu-card-price">${this.formatPrice(item.price)}</div>
        </div>
      </div>
    `)
      .join('');
  },

  renderTable(tbody) {
    const items = this.getAll();
    tbody.innerHTML = items
      .map(
        (item) => `
      <tr>
        <td><img class="menu-thumb" src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/placeholder.svg'"></td>
        <td>${item.name}</td>
        <td>${this.formatPrice(item.price)}</td>
        <td>
          <div class="table-actions">
            <button type="button" class="btn-edit btn-sm" data-edit="${item.id}">Edit</button>
            <button type="button" class="btn-danger btn-sm" data-delete="${item.id}">Delete</button>
          </div>
        </td>
      </tr>
    `
      )
      .join('');
  }
};
