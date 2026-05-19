import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

function getGlobalStateDir() {
  const home = homedir();
  return join(home, '.notify-worker');
}

const stateDir = getGlobalStateDir();

export function getStatePath() {
  return join(stateDir, 'state.json');
}

export function getPidPath() {
  return join(stateDir, 'worker.pid');
}

export function getReloadMarkerPath() {
  return join(stateDir, 'reload.marker');
}

export function getState() {
  const statePath = getStatePath();

  if (!existsSync(statePath)) {
    return createDefaultState();
  }

  try {
    const data = readFileSync(statePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return createDefaultState();
  }
}

function createDefaultState() {
  return {
    running: false,
    pid: null,
    interval: 15,
    currentIndex: 0,
    startedAt: null
  };
}

export function saveState(state) {
  try {
    if (!existsSync(stateDir)) {
      mkdirSync(stateDir, { recursive: true });
    }
    writeFileSync(getStatePath(), JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('Failed to save state:', error.message);
  }
}