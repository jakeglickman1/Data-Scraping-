## Amazon Proxy Scraper (ScrapingAnt Edition)

This project mirrors the open-source Amazon Proxy Scraper experience with a self-contained CLI that uses [ScrapingAnt](https://scrapingant.com/) rotating proxies. It lets you collect up to **500** Amazon search results per keyword without risking IP bans and can export the data into CSV or XLS spreadsheets.

### Features

- Scrapes product cards from any regional Amazon host (e.g., `amazon.com`, `amazon.fr`) using the ScrapingAnt `general` endpoint.
- Collects the ASIN, title, rating, review count, buy box price, strike-through price, savings, sponsorship flag, Amazon's Choice badge, thumbnails, and short/full descriptions.
- Optional detail-page enrichment (default on) pulls feature bullets, product descriptions, and high-resolution images. Toggle with `--skip-details` if you only need lightweight data.
- Saves results as CSV or XLS files named after the keyword (e.g., `iphone_products_1702062339000.csv`).
- Progress bar available for long-running detail fetches via `--show-progress`.

### Requirements

1. Node.js 18+
2. ScrapingAnt account + API key (free tier works). Grab the key from the ScrapingAnt dashboard under **Your API token**.

### Installation

```bash
npm install
```

The CLI entry point is published as `amazon-proxy-scraper` via the `bin` field so you can run it directly with `npx` inside this repo:

```bash
npx amazon-proxy-scraper --help
```

### Usage

```bash
amazon-proxy-scraper -k "baking mat" -a "<apiKey>" -n 100 -t csv \
  --country us --host amazon.com --show-progress
```

Key options (all match the open-source reference implementation):

| Option | Alias | Default | Description |
| --- | --- | --- | --- |
| `--keyword` | `-k` | _required_ | Search phrase used on Amazon |
| `--apiKey` | `-a` | _required_ | ScrapingAnt API key |
| `--number` | `-n` | `10` | Number of products to scrape (max `500`) |
| `--save` | `-s` | `true` | Write results to disk |
| `--fileType` | `-t` | `csv` | Either `csv` or `xls` |
| `--host` | `-H` | `amazon.com` | Regional Amazon domain |
| `--country` | `-c` | `us` | ScrapingAnt proxy country |
| `--skipDetails` | — | `false` | Skip per-product detail page fetches |
| `--concurrency` | — | `5` | Concurrent detail requests (1-10) |
| `--showProgress` | — | `false` | Display a CLI progress bar |

Example outputs follow the structure below:

```json
[
  {
    "amazon-id": "B07MK2P53L",
    "title": "Large Silicone Pastry Mat Extra Thick Non Stick Baking Mat...",
    "thumbnail": "https://m.media-amazon.com/images/I/71RnXV6i+PL._AC_UL320_.jpg",
    "high-res-image": "https://m.media-amazon.com/images/I/71RnXV6i+PL.jpg",
    "url": "https://amazon.com/dp/B07MK2P53L",
    "is-discounted": true,
    "is-sponsored": false,
    "is-amazon-choice": false,
    "price": 16.98,
    "before-discount": 22.99,
    "reviews-count": 902,
    "rating": 4.8,
    "score": 4329.6,
    "savings": 6.01,
    "short-description": "FOOD GRADE SILICONE ...",
    "full-description": "This 11.6 x 16.5-inch half-sheet ...",
  }
]
```

### Notes on avoiding bans

- All outbound HTTP requests travel through ScrapingAnt's proxy pool (the `general` endpoint) so Amazon sees rotating residential/IP-safe traffic.
- Throttling via the `--concurrency` flag helps you stay within ScrapingAnt rate limits. The default of `5` keeps bandwidth reasonable even when collecting the full 500 products.
- Large runs will make hundreds of HTTP requests (search pagination + per product detail pages), so consider disabling detail fetches or lowering concurrency if you approach free-tier quotas.
