const shopifyStore = {
  domain: 'kz1nvi-q0.myshopify.com',
  token: SHOPIFY_ACCESS_TOKEN // Assuming this is in vault.env.js
};

async function fetchShopifyProducts() {
  const res = await fetch(`https://${shopifyStore.domain}/admin/api/2023-01/products.json`, {
    headers: {
      'X-Shopify-Access-Token': shopifyStore.token,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    console.error(⚠️ Shopify fetch failed:', await res.text());
    return [];
  }

  const data = await res.json();
  return data.products || [];
}

async function renderShopifyProducts() {
  const [shopify, vault] = await Promise.all([
    fetchShopifyProducts(),
    fetch('Feeds/products.json').then(r => r.json())
  ]);

  const storeGrid = document.getElementById('storeGrid');
  if (!storeGrid) return;

  const divider = document.createElement('h3');
  divider.innerText = '🛍️ Live Inventory from Shopify';
  storeGrid.appendChild(divider);

  shopify.forEach(prod => {
    const sku = prod.handle || prod.variants[0]?.sku;
    const vaultMeta = vault.find(v => v.sku === sku);
    const shopifyId = prod.id;

    const card = document.createElement('div');
    card.className = `product-card status-live`;

    const img = prod.image ? `<img src="${prod.image.src}" alt="${prod.title}" class="product-image" />` : '';
    const agent = vaultMeta ? `<p><strong>Agent:</strong> ${vaultMeta.agent}</p>` : '';
    const description = vaultMeta ? `<p>${vaultMeta.description}</p>` : '';
    const tags = vaultMeta ? vaultMeta.status.map(t => `<span class="tag">${t}</span>`).join(' ') : '';

    const buyButtonId = `buy-button-${sku}`;

    card.innerHTML = `
      ${img}
      <h2>${prod.title}</h2>
      ${agent}
      <p><strong>Vendor:</strong> ${prod.vendor}</p>
      <p><strong>Price:</strong> $${prod.variants[0]?.price || '--'}</p>
      ${description}
      <div>${tags}</div>
      <div id="${buyButtonId}"></div>
    `;

    storeGrid.appendChild(card);
    initShopifyBuyButton(buyButtonId, shopifyId, sku);
  });
}

function initShopifyBuyButton(targetId, productId, sku) {
  if (window.ShopifyBuy && window.ShopifyBuy.UI) {
    createButton();
  } else {
    const script = document.createElement('script');
    script.src = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    script.async = true;
    script.onload = createButton;
    document.head.appendChild(script);
  }

  function createButton() {
    const client = ShopifyBuy.buildClient({
      domain: shopifyStore.domain,
      storefrontAccessToken: 'd04a6007af7fa6353c9d19f306481c71'
    });

    ShopifyBuy.UI.onReady(client).then(ui => {
      ui.createComponent('product', {
        id: productId,
        node: document.getElementById(targetId),
        moneyFormat: '%24%7B%7Bamount%7D%7D',
        options: {
          product: { text: { button: 'Add to cart' } },
          cart: { text: { button: 'Checkout' } }
        },
        events: {
          afterInit: function(component) {
            component.node.addEventListener('click', () => {
              logVaultSignal({
                timestamp: new Date().toISOString(),
                sku: sku,
                event: "Buy Button Clicked"
              });
            });
          }
        }
      });
    });
  }
}

function logVaultSignal(entry) {
  fetch('logs.json')
    .then(res => res.json())
    .then(logs => {
      logs.push(entry);
      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'logs.json';
      a.click();
    });
}

renderShopifyProducts();