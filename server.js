const express = require('express');
const path = require('path');
const cors = require('cors');
const {
  parseAmazonResults,
  parseEbayDeals,
  parseDummyJsonProducts,
} = require('./src/parsers');

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const MIN_ROI = 0.2;
const PORT = process.env.PORT || 3000;

// Each source definition points to an upstream feed and parser
const SOURCES = [
  {
    id: 'amazon-tech',
    label: 'Amazon · Tech Deals',
    url: 'https://www.amazon.com/s?k=clearance+electronics+deals',
    parser: parseAmazonResults,
    format: 'html',
  },
  {
    id: 'amazon-fashion',
    label: 'Amazon · Fashion Deals',
    url: 'https://www.amazon.com/s?k=designer+fashion+sale',
    parser: parseAmazonResults,
    format: 'html',
  },
  {
    id: 'ebay-deals',
    label: 'eBay Daily Deals',
    url: 'https://www.ebay.com/globaldeals',
    parser: parseEbayDeals,
    format: 'html',
  },
  {
    id: 'fashion-api-mens',
    label: 'Mens Footwear Feed',
    url: 'https://dummyjson.com/products/category/mens-shoes',
    parser: parseDummyJsonProducts,
    format: 'json',
  },
  {
    id: 'fashion-api-womens',
    label: 'Womens Dresses Feed',
    url: 'https://dummyjson.com/products/category/womens-dresses',
    parser: parseDummyJsonProducts,
    format: 'json',
  },
];

const app = express();
// Basic middleware stack for a simple API + static site
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/deals', async (req, res) => {
  const minRoi = Number(req.query.minRoi) || MIN_ROI;
  const dealPromises = SOURCES.map(async (source) => {
    try {
      const payload = await fetchSourcePayload(source);
      const parsed = source.parser(payload, source);
      return parsed
        .map((deal) => evaluateDeal({ ...deal, source: source.label }))
        .filter((deal) => deal && deal.roi >= minRoi);
    } catch (error) {
      console.error(`Failed to scrape ${source.label}:`, error.message);
      return [{
        source: source.label,
        title: 'Feed unavailable',
        price: null,
        originalPrice: null,
        roi: 0,
        url: source.url,
        note: 'Could not load data. Check source manually.',
        error: true,
      }];
    }
  });

  const deals = (await Promise.all(dealPromises)).flat();
  deals.sort((a, b) => b.roi - a.roi);
  res.json({
    updatedAt: new Date().toISOString(),
    minRoi,
    count: deals.length,
    deals,
  });
});

app.listen(PORT, () => {
  console.log(`Deal scout server listening on http://localhost:${PORT}`);
});

async function fetchSourcePayload(source) {
  // Browser-like headers keep HTML scrapes from getting blocked as bots
  const headers =
    source.format === 'json'
      ? { Accept: 'application/json' }
      : {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        };

  const response = await fetch(source.url, { headers });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return source.format === 'json' ? response.json() : response.text();
}

function evaluateDeal(deal) {
  if (!deal || !deal.price || !deal.originalPrice || deal.originalPrice <= deal.price) {
    return null;
  }
  const roi = (deal.originalPrice - deal.price) / deal.price;
  return {
    ...deal,
    roi: Number(roi.toFixed(2)),
    potentialProfit: Number((deal.originalPrice - deal.price).toFixed(2)),
  };
}
