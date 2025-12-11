const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { scrapeProducts } = require('./scraper');
const { saveResults } = require('./output');
const { listSources, DEFAULT_SOURCE } = require('./sources');

/**
 * Configure yargs-powered CLI, trigger a scrape, and optionally save the output.
 * The commands mirror the OSS Amazon Proxy Scraper so existing workflows work.
 */
async function run() {
  // The CLI is aware of every registered scraping source so we can expose them as --source choices.
  const availableSources = listSources();
  const sourceChoices = availableSources.map((source) => source.id);

  // yargs wires the CLI flags to the scraper options (mirrors upstream tool)
  const argv = yargs(hideBin(process.argv))
    .scriptName('amazon-proxy-scraper')
    .usage('$0 -k "<keyword>" -a "<apiKey>" [options]')
    .option('keyword', {
      alias: 'k',
      type: 'string',
      describe: "Amazon search keyword (e.g., 'baking mat')",
      demandOption: false,
    })
    .option('apiKey', {
      alias: 'a',
      type: 'string',
      describe: 'ScrapingAnt API key (https://app.scrapingant.com/)',
      demandOption: true,
    })
    .option('source', {
      alias: 'S',
      type: 'string',
      default: DEFAULT_SOURCE,
      choices: sourceChoices,
      describe: 'Predefined site/source to scrape (amazon-search, ebay-deals, etc.)',
    })
    .option('number', {
      alias: 'n',
      type: 'number',
      default: 10,
      describe: 'Number of products to scrape (max 500)',
    })
    .option('save', {
      alias: 's',
      type: 'boolean',
      default: true,
      describe: 'Save the result set to a file',
    })
    .option('fileType', {
      alias: 't',
      type: 'string',
      default: 'csv',
      choices: ['csv', 'xls'],
      describe: 'File type for saved results',
    })
    .option('host', {
      alias: 'H',
      type: 'string',
      default: 'amazon.com',
      describe: 'Regional Amazon host (amazon.fr, amazon.co.uk, etc.)',
    })
    .option('country', {
      alias: 'c',
      type: 'string',
      default: 'us',
      describe: 'Proxy location (ScrapingAnt proxy_country parameter)',
    })
    .option('showProgress', {
      type: 'boolean',
      default: false,
      describe: 'Show a progress bar while fetching product detail pages',
    })
    .option('skipDetails', {
      type: 'boolean',
      default: false,
      describe: 'Skip fetching detail pages (faster but no descriptions/high-res images)',
    })
    .option('concurrency', {
      type: 'number',
      default: 5,
      describe: 'Concurrent detail fetches (only applies when skipDetails=false)',
    })
    .help()
    .alias('help', 'h')
    .alias('version', 'v')
    .epilog(
      'Scrapes Amazon search listings via ScrapingAnt rotating proxies and exports to CSV/XLS.'
    ).argv;

  try {
    // Kick off the scrape with parsed CLI options
    const products = await scrapeProducts({
      keyword: argv.keyword,
      apiKey: argv.apiKey,
      number: argv.number,
      save: argv.save,
      fileType: argv.fileType,
      host: argv.host,
      country: argv.country,
      showProgress: argv.showProgress,
      skipDetails: argv.skipDetails,
      concurrency: argv.concurrency,
      source: argv.source,
    });

    // Print a verbose dump so it's obvious what was scraped even without saving.
    console.log(`Total scraped products count: ${products.length}`);
    console.dir(products, { depth: null, maxArrayLength: null }); // verbose inspect for debugging

    if (argv.save && products.length) {
      // Persist results (CSV/XLS) using the helper so all formats go through one path.
      const savedPath = await saveResults(products, argv.keyword, argv.fileType);
      console.log(`Saved ${products.length} products to ${savedPath}`);
    }
  } catch (error) {
    console.error(`Scrape failed: ${error.message}`);
    process.exitCode = 1;
  }
}

run();
