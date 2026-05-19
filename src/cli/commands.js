import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { getState, saveState } from '../services/state.js';
import { killProcess } from '../services/pid.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getWorkerPath() {
  return join(__dirname, '..', 'worker', 'worker.js');
}

function ensureMessagesFile(messagesFile) {
  const fullPath = join(__dirname, '..', '..', messagesFile);

  if (!existsSync(fullPath)) {
    const dir = dirname(fullPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const defaultMessages = [
      'Time for a break!',
      'Take a deep breath',
      'Stay hydrated',
      'Move around a bit',
      'Rest your eyes',
      'Stretch your muscles',
      'Take a short walk',
      'Hydrate yourself',
      'Stand up and stretch',
      'Grab a healthy snack'
    ];

    writeFileSync(fullPath, defaultMessages.join('\n') + '\n');
    console.log('Created default messages file:', messagesFile);
    return;
  }

  const content = readFileSync(fullPath, 'utf-8').trim();
  if (!content) {
    const defaultMessages = [
      'Time for a break!',
      'Take a deep breath',
      'Stay hydrated',
      'Move around a bit',
      'Rest your eyes'
    ];

    writeFileSync(fullPath, defaultMessages.join('\n') + '\n');
    console.log('Messages file was empty - created default:', messagesFile);
  }
}

export async function startWorker(interval, messagesFile) {
  ensureMessagesFile(messagesFile);

  const absolutePath = join(__dirname, '..', '..', messagesFile);
  console.log('Messages file:', absolutePath);

  const state = getState();

  if (state.running && state.pid) {
    try {
      process.kill(state.pid, 0);
      console.log('Worker is already running with PID:', state.pid);
      return;
    } catch {
      state.running = false;
    }
  }

  const workerPath = getWorkerPath();
  const child = spawn(process.execPath, [workerPath, String(interval), messagesFile], {
    detached: true,
    stdio: 'ignore'
  });

  child.unref();

  state.running = true;
  state.pid = child.pid;
  state.interval = interval;
  state.startedAt = new Date().toISOString();
  state.messagesFile = messagesFile;

  if (!state.currentIndex) {
    state.currentIndex = 0;
  }

  saveState(state);

  console.log('Worker started with PID:', child.pid);
  console.log('Interval:', interval, 'minutes');
}

export async function stopWorker() {
  const state = getState();

  if (!state.running || !state.pid) {
    console.log('Worker is not running');
    return;
  }

  try {
    await killProcess(state.pid);
    console.log('Worker stopped');
  } catch (error) {
    console.log('Warning:', error.message);
  }

  state.running = false;
  state.pid = null;
  state.startedAt = null;

  saveState(state);
}

export async function restartWorker(newInterval, messagesFile) {
  const state = getState();

  if (state.running && state.pid) {
    try {
      await killProcess(state.pid);
      console.log('Worker stopped');
    } catch (error) {
      console.log('Warning:', error.message);
    }
  }

  const interval = newInterval || state.interval || 15;
  const messages = messagesFile || state.messagesFile || 'messages/sentences.txt';

  await startWorker(interval, messages);
}

export async function statusWorker() {
  const state = getState();

  if (state.running && state.pid) {
    try {
      process.kill(state.pid, 0);
    } catch {
      state.running = false;
      state.pid = null;
      saveState(state);
    }
  }

  console.log('Running:', state.running ? 'yes' : 'no');

  if (state.running && state.pid) {
    console.log('PID:', state.pid);
  }

  if (state.interval) {
    console.log('Interval:', state.interval, 'minutes');
  }

  if (state.currentIndex !== undefined) {
    console.log('Current Index:', state.currentIndex);
  }

  if (state.startedAt) {
    console.log('Started:', state.startedAt);
  }

  const messagesFile = state.messagesFile || 'messages/sentences.txt';
  const absolutePath = join(__dirname, '..', '..', messagesFile);
  console.log('Messages:', absolutePath);
}

export async function reloadWorker(newMessagesFile) {
  const state = getState();

  if (!state.running || !state.pid) {
    console.log('Worker is not running');
    return;
  }

  const messagesFile = newMessagesFile || state.messagesFile || 'messages/sentences.txt';
  const absolutePath = join(__dirname, '..', '..', messagesFile);

  const stateDir = join(__dirname, '..', '..', 'state');
  const reloadMarkerPath = join(stateDir, 'reload.marker');

  if (!existsSync(stateDir)) {
    mkdirSync(stateDir, { recursive: true });
  }

  writeFileSync(reloadMarkerPath, messagesFile);

  console.log('Reload signal sent');
  console.log('Messages file:', absolutePath);
}