// 1. Product feed URL (products.json must live in docs/)
const vaultFeedUrl = 'products.json';

// 2. Shopify Storefront credentials
const shopifyStore = {
  domain: 'kz1nvi-q0.myshopify.com',
  storefrontToken: 'd04a6007af7fa6353c9d19f306481c71'
};

// 3. Grid container
const storeGrid = document.getElementById('storeGrid');

// 4. Load and render products
async function renderVaultProducts() {
  try {
    const res      = await fetch(vaultFeedUrl);
    const products = await res.json();

    if (!Array.isArray(products)) {
      throw new Error('Invalid product feed format');
    }

    storeGrid.innerHTML = '';
    products.forEach((p, i) => {
      const mountId = `buy-button-${i}`;
      const img     = p.image || 'https://via.placeholder.com/400x240';
      const agent   = p.agent || 'Unknown';

      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${img}" alt="${p.title}" class="product-image"/>
        <h2>${p.title}</h2>
        <p><strong>Agent:</strong> ${agent}</p>
        <p>${p.description}</p>
        <p><strong>SKU:</strong> ${p.sku}</p>
        <div id="${mountId}"></div>
      `;
      storeGrid.appendChild(card);

      initBuyButton(mountId, p.product_id || '0000000000', p.sku);
    });

    console.log(`🧠 Loaded ${products.length} vault products`);
  } catch (err) {
    console.error('⚠️ Failed to load product memory scrolls:', err);
    storeGrid.innerHTML = '<p>Failed to render product scrolls. Check console.</p>';
  }
}

// 5. Initialize Shopify Buy Button
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
        cart:    { text: { title: 'Your Vault Cart', button: 'Checkout' } }
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

// 6. Click-logging to logs.json
function logVaultSignal(entry) {
  fetch('logs.json')
    .then(res => res.ok ? res.json() : [])
    .then(logs => {
      logs.push(entry);
      const blob = new Blob([JSON.stringify(logs, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = 'logs.json';
      a.click();
    })
    .catch(err => console.warn('📝 Logging failed:', err));
}

// Kick it off
renderVaultProducts();