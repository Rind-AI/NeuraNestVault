const storeGrid = document.getElementById('storeGrid');
if (storeGrid) {
  fetch('Feeds/products.json')
    .then(res => res.json())
    .then(products => {
      storeGrid.innerHTML = '';
      products
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // newest first
        .forEach(prod => {
          const card = document.createElement('div');
          card.className = `product-card status-${prod.status[0] || 'generated'}`;
          card.innerHTML = `
            <h2>${prod.title}</h2>
            <p><strong>Agent:</strong> ${prod.agent}</p>
            <p>${prod.description}</p>
            <p><small>🕒 ${new Date(prod.timestamp).toLocaleString()}</small></p>
            <div>
              ${prod.status.map(tag => `<span class="tag">${mapTag(tag)}</span>`).join(' ')}
            </div>
            <p><a href="${prod.buy_url}" target="_blank">🛒 Buy Now</a></p>
          `;
          storeGrid.appendChild(card);
        });
    });

  function mapTag(tag) {
    const tagMap = {
      'generated': '⚙️ Generated',
      'launch-ready': '🚀 Launch Ready',
      'reviewed': '🧠 Reviewed',
      'threaded': '🧵 Threads Published',
      'live': '🟢 Live',
      'stripe-enabled': '✅ Stripe Ready'
    };
    return tagMap[tag] || tag;
  }
}