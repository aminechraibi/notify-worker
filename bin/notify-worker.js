#!/usr/bin/env node

import { Command } from 'commander';
import { startWorker, stopWorker, restartWorker, statusWorker, reloadWorker } from '../src/cli/commands.js';

const program = new Command();

program
  .name('notify-worker')
  .description('Lightweight CLI background worker that shows desktop notifications')
  .version('1.0.0');

program
  .command('start')
  .description('Start the notification worker')
  .option('-e, --every <minutes>', 'Interval in minutes between notifications', '15')
  .option('-m, --messages <file>', 'Path to messages file', 'messages/sentences.txt')
  .action(async (options) => {
    try {
      const interval = parseInt(options.every, 10);
      if (isNaN(interval) || interval < 1) {
        console.error('Error: Interval must be a positive number');
        process.exit(1);
      }
      await startWorker(interval, options.messages);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('stop')
  .description('Stop the notification worker')
  .action(async () => {
    try {
      await stopWorker();
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('restart')
  .description('Restart the notification worker')
  .option('-e, --every <minutes>', 'Interval in minutes between notifications')
  .option('-m, --messages <file>', 'Path to messages file')
  .action(async (options) => {
    try {
      const interval = options.every ? parseInt(options.every, 10) : null;
      const messages = options.messages || null;
      await restartWorker(interval, messages);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show worker status')
  .action(async () => {
    try {
      await statusWorker();
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('reload')
  .description('Reload messages file')
  .option('-m, --messages <file>', 'Path to messages file')
  .action(async (options) => {
    try {
      await reloadWorker(options.messages || null);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();