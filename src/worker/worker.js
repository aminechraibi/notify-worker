import { sendNotificationSafe } from '../services/notification.js';
import { loadMessages, getNextMessage, cycleIndex } from '../services/messages.js';
import { getState, saveState } from '../services/state.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, unlinkSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const reloadMarkerPath = join(__dirname, '..', '..', 'state', 'reload.marker');

let intervalId = null;
let reloadCheckInterval = null;
let messages = [];
let currentIndex = 0;
let currentMessagesFile = 'messages/sentences.txt';

async function sendNotification() {
  if (messages.length === 0) {
    messages = loadMessages();
  }

  if (messages.length === 0) {
    console.log('No messages to display');
    return;
  }

  const message = getNextMessage(messages, currentIndex);
  await sendNotificationSafe(message);

  currentIndex = cycleIndex(currentIndex, messages.length);

  const state = getState();
  state.currentIndex = currentIndex;
  saveState(state);
}

function startScheduler(intervalMinutes) {
  const intervalMs = intervalMinutes * 60 * 1000;

  console.log(`Starting scheduler with ${intervalMinutes} minute interval`);

  sendNotification();

  intervalId = setInterval(sendNotification, intervalMs);

  reloadCheckInterval = setInterval(checkForReload, 5000);
}

function reloadMessages() {
  messages = loadMessages(currentMessagesFile);
  console.log('Messages reloaded:', messages.length, 'messages');
}

function checkForReload() {
  if (existsSync(reloadMarkerPath)) {
    try {
      const content = readFileSync(reloadMarkerPath, 'utf-8').trim();
      if (content) {
        currentMessagesFile = content;
        console.log('Reload requested for:', content);
      }
      reloadMessages();
    } catch (e) {
      console.error('Error reading reload marker:', e.message);
    } finally {
      try {
        unlinkSync(reloadMarkerPath);
      } catch {
      }
    }
  }
}

process.on('SIGUSR1', () => {
  reloadMessages();
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down');
  if (intervalId) {
    clearInterval(intervalId);
  }
  if (reloadCheckInterval) {
    clearInterval(reloadCheckInterval);
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down');
  if (intervalId) {
    clearInterval(intervalId);
  }
  if (reloadCheckInterval) {
    clearInterval(reloadCheckInterval);
  }
  process.exit(0);
});

const intervalArg = process.argv[2];
currentMessagesFile = process.argv[3] || 'messages/sentences.txt';

const interval = parseInt(intervalArg, 10) || 15;

messages = loadMessages(currentMessagesFile);

if (messages.length === 0) {
  console.error('No messages loaded. Please check your messages file.');
  process.exit(1);
}

const state = getState();
if (state.currentIndex !== undefined) {
  currentIndex = state.currentIndex;
}

startScheduler(interval);