const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { scrapeProducts } = require('./scraper');
const { saveResults } = require('./output');

/**
 * Configure yargs-powered CLI, trigger a scrape, and optionally save the output.
 * The commands mirror the OSS Amazon Proxy Scraper so existing workflows work.
 */
async function run() {
  const argv = yargs(hideBin(process.argv))
    .scriptName('amazon-proxy-scraper')
    .usage('$0 -k "<keyword>" -a "<apiKey>" [options]')
    .option('keyword', {
      alias: 'k',
      type: 'string',
      describe: "Amazon search keyword (e.g., 'baking mat')",
      demandOption: true,
    })
    .option('apiKey', {
      alias: 'a',
      type: 'string',
      describe: 'ScrapingAnt API key (https://app.scrapingant.com/)',
      demandOption: true,
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
    });

    console.log(`Total scraped products count: ${products.length}`);
    console.dir(products, { depth: null, maxArrayLength: null });

    if (argv.save && products.length) {
      const savedPath = await saveResults(products, argv.keyword, argv.fileType);
      console.log(`Saved ${products.length} products to ${savedPath}`);
    }
  } catch (error) {
    console.error(`Scrape failed: ${error.message}`);
    process.exitCode = 1;
  }
}

run();
