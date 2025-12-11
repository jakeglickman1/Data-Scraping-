const cheerio = require('cheerio');
const cliProgress = require('cli-progress');
const pLimit = require('p-limit');
const { getSourceDefinition, listSources, DEFAULT_SOURCE } = require('./sources');

// Lazy-load node-fetch so CLI startup remains snappy.
const fetch = (...args) => import('node-fetch').then(({ default: fetchFn }) => fetchFn(...args));

const MAX_PRODUCTS = 500;
const MAX_PAGES = 20;

/**
 * Entry point used by the CLI to fetch up to `number` products for a keyword.
 * Handles pagination, optional detail-page enrichment, and record formatting.
 */
async function scrapeProducts(options) {
  const sourceId = (options.source || DEFAULT_SOURCE).trim() || DEFAULT_SOURCE;
  const source = getSourceDefinition(sourceId);

  if (!source) {
    const choices = listSources()
      .map((entry) => entry.id)
      .join(', ');
    throw new Error(`Unknown source "${sourceId}". Available sources: ${choices}`);
  }

  // amazon-search behaves differently (pagination + optional detail fetches).
  if (source.type === 'amazon-search') {
    return scrapeAmazonKeywordSearch(options);
  }

  // All other sources share the "single URL + parser" contract.
  return scrapePredefinedSource(source, options);
}

async function scrapeAmazonKeywordSearch(options) {
  const keyword = (options.keyword || '').trim();
  const apiKey = (options.apiKey || '').trim();
  const host = (options.host || 'amazon.com').trim() || 'amazon.com';

  if (!keyword) {
    throw new Error('Keyword is required for the amazon-search source');
  }
  if (!apiKey) {
    throw new Error('ScrapingAnt API key is required');
  }

  const target = clampNumber(options.number ?? 10, 1, MAX_PRODUCTS);
  const collected = [];
  let page = 1;

  // Crawl successive SERP pages until we reach the requested count or max pages.
  while (collected.length < target && page <= MAX_PAGES) {
    const searchUrl = buildAmazonSearchUrl(keyword, host, page);
    const html = await fetchHtml(searchUrl, apiKey, options.country);
    const pageResults = parseSearchResults(html, host);

    if (!pageResults.length) {
      break;
    }

    for (const product of pageResults) {
      collected.push(product);
      if (collected.length >= target) {
        break;
      }
    }

    page += 1;
  }

  if (!collected.length) {
    throw new Error('No products were parsed from the Amazon response');
  }

  // Detail pages dramatically improve fidelity but are optional for faster runs.
  const includeDetails = !options.skipDetails;
  const enriched = includeDetails
    ? await enrichWithDetails(collected, {
        apiKey,
        country: options.country,
        showProgress: options.showProgress,
        concurrency: clampNumber(options.concurrency ?? 5, 1, 10),
      })
    : collected.map((product) => ({
        ...product,
        shortDescription: product.shortDescription || '',
        fullDescription: '',
        highResImage: product.highResImage || product.thumbnail,
      }));

  return enriched.map((product) =>
    formatProductRecord({
      ...product,
      source: 'Amazon keyword search',
    })
  );
}

async function scrapePredefinedSource(source, options) {
  const apiKey = (options.apiKey || '').trim();
  const keyword = (options.keyword || '').trim();

  if (source.requiresKeyword && !keyword) {
    throw new Error(`Keyword is required for the ${source.id} source`);
  }

  // HTML endpoints go through ScrapingAnt; JSON feeds are hit directly.
  if (source.type === 'html' && !apiKey) {
    throw new Error('ScrapingAnt API key is required to scrape HTML sources');
  }

  const target = clampNumber(options.number ?? 10, 1, MAX_PRODUCTS);
  const resolvedUrl =
    typeof source.buildUrl === 'function' ? source.buildUrl({ keyword }) : source.url;

  if (!resolvedUrl) {
    throw new Error(`Source "${source.id}" does not specify a URL to scrape`);
  }

  // Fetch the upstream payload before handing it off to the parser.
  const payload =
    source.type === 'json'
      ? await fetchJson(resolvedUrl)
      : await fetchHtml(resolvedUrl, apiKey, options.country);

  const parsed = source.parser(payload, source) || [];
  if (!parsed.length) {
    throw new Error(`No products were parsed from ${source.label}`);
  }

  // Normalize each site-specific record so downstream code only deals with one shape.
  return parsed.slice(0, target).map((record) =>
    formatProductRecord({
      asin: record.id || record.asin || '',
      title: record.title,
      url: record.url,
      price: record.price,
      beforeDiscount: record.originalPrice,
      rating: record.rating,
      reviewsCount: record.reviewsCount,
      thumbnail: record.thumbnail || '',
      highResImage: record.highResImage || record.thumbnail || '',
      shortDescription: record.shortDescription || '',
      fullDescription: record.fullDescription || '',
      isSponsored: Boolean(record.isSponsored),
      isAmazonChoice: Boolean(record.isAmazonChoice),
      isDiscounted:
        record.originalPrice && record.price ? record.originalPrice > record.price : false,
      source: record.source || source.label,
    })
  );
}

/**
 * Proxy an arbitrary URL through ScrapingAnt and return the HTML payload.
 */
async function fetchHtml(targetUrl, apiKey, proxyCountry) {
  const url = new URL('https://api.scrapingant.com/v2/general');
  url.searchParams.set('x-api-key', apiKey);
  url.searchParams.set('url', targetUrl);
  // ScrapingAnt defaults to a headless Chrome session; we only set device hints.
  url.searchParams.set('device', 'desktop');
  if (proxyCountry) {
    url.searchParams.set('proxy_country', proxyCountry);
  }

  // ScrapingAnt expects URL + key in query params; device hint keeps eBay happy.
  const response = await fetch(url.toString());
  const rawBody = await response.text();

  if (!response.ok) {
    const snippet = rawBody.length > 200 ? `${rawBody.slice(0, 200)}…` : rawBody;
    throw new Error(`ScrapingAnt request failed with status ${response.status}${snippet ? `: ${snippet}` : ''}`);
  }

  const trimmed = rawBody.trim();
  if (!trimmed) {
    throw new Error('ScrapingAnt returned an empty response body');
  }

  // ScrapingAnt sometimes returns JSON ({ content: "<html>" }) and sometimes raw HTML.
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const payload = JSON.parse(trimmed);
      if (payload && typeof payload.content === 'string') {
        return payload.content;
      }
      if (typeof payload === 'string') {
        return payload;
      }
    } catch {
      // fall through and treat as raw HTML
    }
  }

  return rawBody;
}

async function fetchJson(targetUrl) {
  // Direct fetch helper used for trusted JSON feeds (no proxy required).
  const response = await fetch(targetUrl);
  if (!response.ok) {
    throw new Error(`JSON request failed with status ${response.status}`);
  }
  return response.json();
}

/**
 * Parse search result cards from Amazon's SERP HTML into minimal product data.
 */
function parseSearchResults(html, host) {
  const $ = cheerio.load(html);
  const results = [];

  $('.s-result-item[data-component-type="s-search-result"]').each((_, element) => {
    const asin = $(element).attr('data-asin');
    if (!asin) return;

    const title = cleanText($(element).find('h2 a span').text());
    if (!title) return;

    const price = parsePrice($(element).find('.a-price span.a-offscreen').first().text());
    const originalPrice =
      parsePrice($(element).find('.a-text-price span.a-offscreen').first().text()) || null;

    const rating = parseFloatSafe($(element).find('.a-icon-alt').first().text());
    const reviewsCount = parseNumber($(element).find('span[aria-label$="ratings"]').attr('aria-label')) ||
      parseNumber($(element).find('.s-link-style .s-underline-text').first().text());

    const thumbnail = $(element).find('img.s-image').attr('src') || '';
    const isSponsored =
      $(element).attr('data-component-type') === 'sp-sponsored-result' ||
      $(element).find('.puis-sponsored-label-text').length > 0 ||
      $(element)
        .find('span')
        .filter((_, el) => cleanText($(el).text()).toLowerCase() === 'sponsored')
        .length > 0;

    const isAmazonChoice = $(element)
      .find('.a-badge-text')
      .toArray()
      .some((node) => cleanText($(node).text()).toLowerCase().includes("amazon's choice"));

    const shortDescription =
      cleanText($(element).find('.a-row .a-size-base.a-color-base').last().text()) ||
      cleanText($(element).find('.a-row .a-size-base-plus').last().text());

    results.push({
      asin,
      title,
      url: `https://${host}/dp/${asin}`,
      price,
      beforeDiscount: originalPrice,
      rating: Number.isFinite(rating) ? Number(rating.toFixed(2)) : null,
      reviewsCount: reviewsCount ?? null,
      thumbnail,
      highResImage: deriveHighResFromSrcset($(element).find('img.s-image').attr('srcset')),
      isSponsored,
      isAmazonChoice,
      isDiscounted: Boolean(originalPrice && price && originalPrice > price),
      shortDescription,
    });
  });

  return results;
}

/**
 * Visit each product detail page to grab long descriptions and hi-res images.
 * Uses p-limit for polite batching and optionally shows a CLI progress bar.
 */
async function enrichWithDetails(products, options) {
  const limit = pLimit(options.concurrency);
  const bar = options.showProgress
    ? new cliProgress.SingleBar(
        {
          format: 'Detail pages [{bar}] {value}/{total}',
        },
        cliProgress.Presets.shades_classic
      )
    : null;

  if (bar) {
    bar.start(products.length, 0);
  }

  // Respect concurrency limits so we don't overload ScrapingAnt
  const enriched = await Promise.all(
    products.map((product) =>
      limit(async () => {
        try {
          const html = await fetchHtml(product.url, options.apiKey, options.country);
          const detail = parseProductDetail(html);
          return { ...product, ...detail };
        } catch (error) {
          return {
            ...product,
            shortDescription: product.shortDescription || '',
            fullDescription: '',
            highResImage: product.highResImage || product.thumbnail,
            detailError: error.message,
          };
        } finally {
          if (bar) {
            bar.increment();
          }
        }
      })
    )
  );

  if (bar) {
    bar.stop();
  }

  return enriched;
}

/**
 * Scrape high-value product information from a detail page (feature bullets,
 * product description, landing image sources).
 */
function parseProductDetail(html) {
  const $ = cheerio.load(html);
  const featureBullets = $('#feature-bullets li')
    .map((_, el) => cleanText($(el).text()))
    .get()
    .filter(Boolean);

  const descriptionBlock = cleanText($('#productDescription').text());
  const aplusDescription = cleanText($('#aplus_feature_div').text());
  const metaDescription = $('meta[name="description"]').attr('content');

  const highResImage =
    $('#landingImage').attr('data-old-hires') ||
    extractFromDynamicImage($('#landingImage').attr('data-a-dynamic-image')) ||
    $('img[data-old-hires]').attr('data-old-hires') ||
    $('img#landingImage').attr('src') ||
    null;

  const joinedBullets = featureBullets.join(' ');
  const fullDescription = descriptionBlock || aplusDescription || joinedBullets || metaDescription || '';

  return {
    shortDescription: joinedBullets || metaDescription || '',
    fullDescription,
    highResImage,
  };
}

/**
 * Normalize internal fields to the public Amazon Proxy Scraper schema.
 */
function formatProductRecord(product) {
  const price = product.price ?? null;
  const before = product.beforeDiscount ?? null;
  const savings =
    price && before && before > price ? Number((before - price).toFixed(2)) : 0;
  const score =
    product.rating && product.reviewsCount
      ? Number((product.rating * product.reviewsCount).toFixed(2))
      : '';

  return {
    'amazon-id': product.asin,
    title: product.title,
    thumbnail: product.thumbnail,
    'high-res-image': product.highResImage || product.thumbnail,
    url: product.url,
    source: product.source || '',
    'is-discounted': Boolean(product.isDiscounted),
    'is-sponsored': Boolean(product.isSponsored),
    'is-amazon-choice': Boolean(product.isAmazonChoice),
    price: price ?? '',
    'before-discount': before ?? '',
    'reviews-count': product.reviewsCount ?? '',
    rating: product.rating ?? '',
    score,
    savings,
    'short-description': product.shortDescription || '',
    'full-description': product.fullDescription || '',
  };
}

/**
 * Construct an Amazon search URL for a given keyword + region + page number.
 */
function buildAmazonSearchUrl(keyword, host, page) {
  const safeHost = host.includes('.') ? host : 'amazon.com';
  const params = new URLSearchParams({
    k: keyword,
    page: String(page),
    language: 'en_US',
  });
  return `https://${safeHost}/s?${params.toString()}`;
}

/** Convert formatted currency strings into floats ("$14.99" => 14.99). */
function parsePrice(value) {
  if (!value) return null;
  const numeric = value.replace(/[^0-9.]/g, '');
  return numeric ? Number(parseFloat(numeric).toFixed(2)) : null;
}

/** Convert formatted numerics ("14,566 ratings") into integers. */
function parseNumber(value) {
  if (!value) return null;
  const numeric = value.replace(/[^0-9]/g, '');
  return numeric ? Number(numeric) : null;
}

/** Collapse whitespace and trim text nodes. */
function cleanText(value = '') {
  return value ? value.replace(/\s+/g, ' ').trim() : '';
}

/** Extract the first floating-point number from strings like "4.5 out of 5". */
function parseFloatSafe(value) {
  if (!value) return null;
  const match = value.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

/** Grab the highest resolution candidate from an image srcset string. */
function deriveHighResFromSrcset(srcset = '') {
  if (!srcset) return '';
  const sources = srcset
    .split(',')
    .map((entry) => entry.trim().split(' ')[0])
    .filter(Boolean);
  return sources.length ? sources[sources.length - 1] : '';
}

/** Parse Amazon's data-a-dynamic-image JSON descriptor to a URL. */
function extractFromDynamicImage(raw = '') {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const urls = Object.keys(parsed || {});
    return urls[urls.length - 1] || null;
  } catch {
    return null;
  }
}

/** Clamp a numeric input within a min/max range and fall back when invalid. */
function clampNumber(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

module.exports = {
  scrapeProducts,
};
