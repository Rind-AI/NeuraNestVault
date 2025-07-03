const vaultFeedUrl = 'Feeds/products.json';
const storeGrid = document.getElementById('storeGrid');

// Shopify Storefront settings
const shopifyStore = {
  domain: 'kz1nvi-q0.myshopify.com',
  storefrontToken: 'd04a6007af7fa6353c9d19f306481c71' // Storefront Access Token
};

async function renderVaultProducts() {
  try {
    const response = await fetch(vaultFeedUrl);
    const products = await response.json();

    if (!Array.isArray(products)) throw new Error("Invalid product feed format");

    products.forEach((product, index) => {
      const targetId = `buy-button-${index}`;
      const card = document.createElement('div');
      card.className = 'product-card';

      card.innerHTML = `
        <img src="${product.image}" alt="${product.title}" class="product-image" />
        <h2>${product.title}</h2>
        <p><strong>Agent:</strong> ${product.agent}</p>
        <p>${product.description}</p>
        <p><strong>Status:</strong> ${product.status?.join(', ')}</p>
        <p><strong>SKU:</strong> ${product.sku}</p>
        <div id="${targetId}"></div>
      `;

      storeGrid.appendChild(card);
      createBuyButton(targetId, product.product_id || '1234567890', product.sku);
    });

  } catch (err) {
    console.error("⚠️ Failed to load product memory scrolls:", err);
    storeGrid.innerHTML = "<p>Failed to render product scrolls. Check console for clues.</p>";
  }
}

function createBuyButton(targetId, productId, sku) {
  if (!window.ShopifyBuy) {
    const script = document.createElement('script');
    script.src = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    script.async = true;
    script.onload = () => initBuyButton(targetId, productId, sku);
    document.head.appendChild(script);
  } else {
    initBuyButton(targetId, productId, sku);
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
        afterInit: function (component) {
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

function logVaultSignal(entry) {
  fetch('logs.json')
    .then(res => res.ok ? res.json() : [])
    .then(logs => {
      logs.push(entry);
      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'logs.json';
      a.click();
    })
    .catch(err => console.warn("📝 Logging failed:", err));
}

// Initiate scroll rendering
renderVaultProducts();