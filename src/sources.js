const {
  parseAmazonResults,
  parseEbayDeals,
  parseDummyJsonProducts,
} = require('./parsers');

const DEFAULT_SOURCE = 'amazon-search';

const SOURCE_DEFINITIONS = [
  {
    id: 'amazon-search',
    label: 'Amazon keyword search',
    type: 'amazon-search',
    requiresKeyword: true,
    description: 'Scrapes Amazon SERPs via ScrapingAnt (supports detail pages).',
  },
  {
    id: 'amazon-tech',
    label: 'Amazon · Tech Deals',
    type: 'html',
    url: 'https://www.amazon.com/s?k=clearance+electronics+deals',
    parser: parseAmazonResults,
  },
  {
    id: 'amazon-fashion',
    label: 'Amazon · Fashion Deals',
    type: 'html',
    url: 'https://www.amazon.com/s?k=designer+fashion+sale',
    parser: parseAmazonResults,
  },
  {
    id: 'ebay-deals',
    label: 'eBay Daily Deals',
    type: 'html',
    url: 'https://www.ebay.com/globaldeals',
    parser: parseEbayDeals,
  },
  {
    id: 'fashion-api-mens',
    label: 'Mens Footwear Feed',
    type: 'json',
    url: 'https://dummyjson.com/products/category/mens-shoes',
    parser: parseDummyJsonProducts,
  },
  {
    id: 'fashion-api-womens',
    label: 'Womens Dresses Feed',
    type: 'json',
    url: 'https://dummyjson.com/products/category/womens-dresses',
    parser: parseDummyJsonProducts,
  },
];

function listSources() {
  return SOURCE_DEFINITIONS.slice();
}

function getSourceDefinition(id) {
  return SOURCE_DEFINITIONS.find((source) => source.id === id);
}

module.exports = {
  DEFAULT_SOURCE,
  listSources,
  getSourceDefinition,
};
