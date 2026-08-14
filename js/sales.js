const Sales = {
  getForMonth(year, month) {
    const sales = Storage.getSales();
    return sales.filter((sale) => {
      const d = new Date(sale.timestamp);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  },

  getSummary(sales) {
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const orderCount = sales.length;

    const itemCounts = {};
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.qty;
      });
    });

    let bestSeller = '—';
    let maxQty = 0;
    Object.entries(itemCounts).forEach(([name, qty]) => {
      if (qty > maxQty) {
        maxQty = qty;
        bestSeller = name;
      }
    });

    return { totalRevenue, orderCount, bestSeller };
  },

  render(monthInput) {
    const [yearStr, monthStr] = monthInput.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;

    const sales = this.getForMonth(year, month);
    const summary = this.getSummary(sales);

    document.getElementById('summaryRevenue').textContent = Menu.formatPrice(summary.totalRevenue);
    document.getElementById('summaryOrders').textContent = summary.orderCount;
    document.getElementById('summaryBestSeller').textContent = summary.bestSeller;

    const tbody = document.getElementById('salesTableBody');
    if (sales.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#7a6b5d">No sales for this month</td></tr>';
      return;
    }

    tbody.innerHTML = sales
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map((sale) => {
        const date = new Date(sale.timestamp).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short'
        });
        const itemsList = sale.items.map((i) => `${i.name} ×${i.qty}`).join(', ');
        return `
        <tr>
          <td>${date}</td>
          <td>${itemsList}</td>
          <td>${Menu.formatPrice(sale.total)}</td>
        </tr>
      `;
      })
      .join('');
  },

  exportCsv(monthInput) {
    const [yearStr, monthStr] = monthInput.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const sales = this.getForMonth(year, month);

    const rows = [['Date', 'Items', 'Total']];
    sales.forEach((sale) => {
      const date = new Date(sale.timestamp).toLocaleString('en-IN');
      const itemsList = sale.items.map((i) => `${i.name} x${i.qty}`).join('; ');
      rows.push([date, itemsList, sale.total]);
    });

    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${monthInput}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
