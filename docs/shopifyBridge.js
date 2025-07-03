const vaultFeedUrl = 'products.json';

const shopifyStore = {
  domain: 'kz1nvi-q0.myshopify.com',
  storefrontToken: 'd04a6007af7fa6353c9d19f306481c71'
};

const storeGrid = document.getElementById('storeGrid');

async function renderVaultProducts() {
  try {
    const res = await fetch(vaultFeedUrl);
    const products = await res.json();
    if (!Array.isArray(products)) throw new Error('Invalid feed');

    storeGrid.innerHTML = '';
    products.forEach((p, i) => {
      const mountId = `buy-button-${i}`;
      const img = p.image || 'https://placehold.co/400x240?text=No+Image';
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${img}" alt="${p.title}" class="product-image"/>
        <h2>${p.title}</h2>
        <p><strong>Agent:</strong> ${p.agent || 'Unknown'}</p>
        <p>${p.description}</p>
        <p><strong>SKU:</strong> ${p.sku}</p>
        <div id="${mountId}"></div>
      `;
      storeGrid.appendChild(card);

      if (p.product_id) {
        initBuyButton(mountId, p.product_id, p.sku);
      } else {
        const warn = document.createElement('p');
        warn.textContent = 'Buy button unavailable';
        card.appendChild(warn);
      }
    });

    console.log(`🧠 Loaded ${products.length} vault products`);
  } catch (err) {
    console.error('⚠️ Failed to load product scrolls:', err);
    storeGrid.innerHTML = '<p>Failed to render products. Check console.</p>';
  }
}

function initBuyButton(targetId, productId, sku) {
  const client = ShopifyBuy.buildClient({
    domain: shopifyStore.domain,
    storefrontAccessToken: shopifyStore.storefrontToken
  });

  ShopifyBuy.UI.onReady(client).then((ui) => {
    ui.createComponent('product', {
      id: productId,
      node: document.getElementById(targetId),
      moneyFormat: '%24%7B%7Bamount%7D%7D',
      options: {
        product: { text: { button: 'Add to cart' } },
        cart: { text: { title: 'Your Vault Cart', button: 'Checkout' } }
      },
      events: {
        afterInit(component) {
          component.node.addEventListener('click', () => {
            logVaultSignal({
              timestamp: new Date().toISOString(),
              sku,
              event: 'Buy Button Clicked'
            });
          });
        }
      }
    });
  });
}

function logVaultSignal(entry) {
  fetch('logs.json')
    .then(res => res.ok ? res.json() : [])
    .then(logs => {
      logs.push(entry);
      const blob = new Blob([JSON.stringify(logs, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'logs.json';
      a.click();
    })
    .catch(err => console.warn('📝 Logging failed:', err));
}

renderVaultProducts();