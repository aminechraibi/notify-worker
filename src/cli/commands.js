import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { getState, saveState, getReloadMarkerPath } from '../services/state.js';
import { killProcess } from '../services/pid.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WORKER_UNIQUE_NAME = 'notify-worker-daemon';

async function findWorkerProcess() {
  const platform = process.platform;

  return new Promise((resolve) => {
    let child;

    if (platform === 'win32') {
      child = spawn('wmic', ['process', 'where', `commandline like "%${WORKER_UNIQUE_NAME}%"`, 'get', 'processid'], {
        shell: true
      });
    } else if (platform === 'darwin' || platform === 'linux') {
      child = spawn('pgrep', ['-f', WORKER_UNIQUE_NAME]);
    } else {
      resolve(null);
      return;
    }

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', () => {
      if (platform === 'win32') {
        const lines = output.trim().split('\n').filter(line => line.trim() && !line.includes('ProcessId'));
        const pids = lines.map(line => parseInt(line.trim(), 10)).filter(pid => !isNaN(pid));
        resolve(pids[0] || null);
      } else {
        const pid = parseInt(output.trim(), 10);
        resolve(!isNaN(pid) ? pid : null);
      }
    });

    child.on('error', () => {
      resolve(null);
    });
  });
}

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
  const child = spawn(process.execPath, [workerPath, String(interval), messagesFile, WORKER_UNIQUE_NAME], {
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
  let state = getState();
  let pidToKill = state.pid;

  if (!state.running || !state.pid) {
    const foundPid = await findWorkerProcess();
    if (foundPid) {
      console.log('Found running worker (state file was missing)');
      pidToKill = foundPid;
    } else {
      console.log('Worker is not running');
      return;
    }
  }

  try {
    await killProcess(pidToKill);
    console.log('Worker stopped');
  } catch (error) {
    console.log('Warning:', error.message);
  }

  state = getState();
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
  const absolutePath = join(process.cwd(), messagesFile);

  const reloadMarkerPath = getReloadMarkerPath();
  const stateDir = dirname(reloadMarkerPath);

  if (!existsSync(stateDir)) {
    mkdirSync(stateDir, { recursive: true });
  }

  writeFileSync(reloadMarkerPath, messagesFile);

  console.log('Reload signal sent');
  console.log('Messages file:', absolutePath);
}