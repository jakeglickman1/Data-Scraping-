// Cache DOM references up front for reuse throughout the UI lifecycle
const dealGrid = document.getElementById('dealGrid');
const updatedAtEl = document.getElementById('updatedAt');
const dealCountEl = document.getElementById('dealCount');
const filters = document.getElementById('filters');
const roiInput = document.getElementById('roiInput');
const keywordInput = document.getElementById('keywordInput');
const template = document.getElementById('dealCardTemplate');

// Refresh deals whenever the user tweaks filters and submits the form
filters.addEventListener('submit', (event) => {
  event.preventDefault();
  loadDeals();
});

async function loadDeals() {
  // Translate form state into API parameters and show a loading message
  const minRoi = Number(roiInput.value || 20) / 100;
  const keyword = keywordInput.value.trim().toLowerCase();
  const url = new URL('/api/deals', window.location.origin);
  url.searchParams.set('minRoi', minRoi);

  dealGrid.innerHTML = '<p>Loading deals...</p>';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Request failed');
    }
    const payload = await response.json(); // includes deals array plus metadata
    updatedAtEl.textContent = new Date(payload.updatedAt).toLocaleString();
    // Client-side keyword filtering happens here so we avoid extra server calls
   const filtered = payload.deals.filter((deal) =>
      keyword ? deal.title.toLowerCase().includes(keyword) : true
    );
    dealCountEl.textContent = filtered.length;
    renderDeals(filtered);
  } catch (error) {
    dealGrid.innerHTML = `<p class="error">Failed to load deals. ${error.message}</p>`;
  }
}

function renderDeals(deals) {
  if (!deals.length) {
    dealGrid.innerHTML = '<p>No deals matched your filter yet. Try lowering the ROI threshold.</p>';
    return;
  }

  // Clone the HTML template for each deal and populate its dynamic fields
  const fragment = document.createDocumentFragment();
  deals.forEach((deal) => {
    const card = template.content.firstElementChild.cloneNode(true);
    card.dataset.source = deal.source;
    card.querySelector('.deal__source').textContent = deal.source;
    card.querySelector('.deal__roi').textContent = `${Math.round(deal.roi * 100)}% ROI`;
    card.querySelector('.deal__title').textContent = deal.title;
    card.querySelector('.deal__price').textContent = `$${deal.price.toFixed(2)}`;
    card.querySelector('.deal__original').textContent = `$${deal.originalPrice.toFixed(2)}`;
    card.querySelector('.deal__profit').textContent = `Potential profit: $${deal.potentialProfit.toFixed(2)}`;
    const link = card.querySelector('.deal__link');
    link.href = deal.url;
    link.textContent = 'View product';
    fragment.appendChild(card);
  });
  dealGrid.innerHTML = '';
  dealGrid.appendChild(fragment);
}

// Kick off the initial fetch as soon as the page loads
loadDeals();
