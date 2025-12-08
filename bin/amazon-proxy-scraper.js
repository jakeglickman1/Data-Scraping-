#!/usr/bin/env node

/**
 * Bin shim that exposes the CLI entrypoint declared in package.json.
 * Defers all of the heavy lifting to ./src/cli to keep this file tiny.
 */
require('../src/cli');
