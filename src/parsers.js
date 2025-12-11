const cheerio = require('cheerio');

/**
 * Shared parsing helpers reused by both the CLI and the Express dashboard.
 * Each parser normalizes upstream HTML/JSON payloads into a flat deal object.
 */

function parseAmazonResults(html, source = {}) {
  const $ = cheerio.load(html);
  const results = [];

  $('.s-result-item').each((_, el) => {
    const title = $(el).find('h2 a span').text().trim();
    const linkPath = $(el).find('h2 a').attr('href') || '';
    const link = linkPath.startsWith('http')
      ? linkPath
      : `https://www.amazon.com${linkPath}`;
    const priceWhole = $(el)
      .find('.a-price span.a-price-whole')
      .first()
      .text()
      .replace(/[,]/g, '');
    const priceFraction = $(el).find('.a-price span.a-price-fraction').first().text();
    const salePrice = parseFloat(`${priceWhole || '0'}.${priceFraction || '00'}`);

    const originalPriceText = $(el).find('span.a-text-price span.a-offscreen').first().text();
    const originalPrice = parsePriceString(originalPriceText);

    const thumbnail = $(el).find('img.s-image').attr('src') || '';

    if (!title || !salePrice || !originalPrice) return;
    results.push({
      id: $(el).attr('data-asin') || '',
      title,
      url: link,
      price: salePrice,
      originalPrice,
      thumbnail,
      source: source.label,
    });
  });

  return results;
}

function parseFashionGrid(html, source = {}) {
  const $ = cheerio.load(html);
  const results = [];

  $('article, .product-tile, .product').each((_, el) => {
    const title = $(el).find('h2, .product-name, .ProductTile__name').first().text().trim();
    const link = $(el).find('a').first().attr('href');
    const saleText = $(el)
      .find('.price, .product-price, .sale-price, .ProductPrice')
      .first()
      .text();
    const originalText = $(el)
      .find('.was-price, .original-price, .ProductPrice--compare, .ProductPrice-old')
      .first()
      .text();

    const price = parsePriceString(saleText);
    const originalPrice = parsePriceString(originalText);

    if (!title || !price || !originalPrice) return;
    results.push({
      id: `${source.id || 'fashion'}-${results.length + 1}`,
      title,
      url: link && link.startsWith('http') ? link : `${source.url}${link || ''}`,
      price,
      originalPrice,
      source: source.label,
    });
  });

  return results;
}

function parseEbayDeals(html, source = {}) {
  const $ = cheerio.load(html);
  const results = [];

  $('[data-testid="item"]').each((_, el) => {
    const title = $(el).find('[data-testid="itemTile-title"]').text().trim();
    const link = $(el).find('a').attr('href');
    const priceText = $(el).find('[data-testid="itemTile-price-primary"]').text();
    const originalText = $(el).find('[data-testid="itemTile-price-secondary"]').text();
    const price = parsePriceString(priceText);
    const originalPrice = parsePriceString(originalText);

    if (!title || !price || !originalPrice) return;
    results.push({
      id: `${source.id || 'ebay'}-${results.length + 1}`,
      title,
      url: link,
      price,
      originalPrice,
      source: source.label,
    });
  });

  return results;
}

function parseDummyJsonProducts(data, source = {}) {
  if (!data || !Array.isArray(data.products)) return [];
  return data.products
    .map((product) => {
      const price = Number(product.price);
      const discount = Number(product.discountPercentage || 0);
      const originalPrice = discount > 0 ? price / (1 - discount / 100) : price * 1.25;

      if (!price || !originalPrice || originalPrice <= price) return null;

      return {
        id: String(product.id),
        title: product.title,
        url: `https://dummyjson.com/products/${product.id}`,
        price,
        originalPrice,
        thumbnail: product.thumbnail,
        source: source.label,
        shortDescription: product.description || '',
      };
    })
    .filter(Boolean);
}

function parsePriceString(value = '') {
  const numeric = value.replace(/[^0-9.]/g, '');
  return numeric ? parseFloat(numeric) : null;
}

module.exports = {
  parseAmazonResults,
  parseFashionGrid,
  parseEbayDeals,
  parseDummyJsonProducts,
  parsePriceString,
};
