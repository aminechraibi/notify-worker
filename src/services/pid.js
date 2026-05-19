import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { getPidPath } from './state.js';

export function savePid(pid) {
  try {
    writeFileSync(getPidPath(), String(pid));
  } catch (error) {
    console.error('Failed to save PID:', error.message);
  }
}

export function readPid() {
  const pidPath = getPidPath();

  if (!existsSync(pidPath)) {
    return null;
  }

  try {
    const pid = parseInt(readFileSync(pidPath, 'utf-8').trim(), 10);
    return isNaN(pid) ? null : pid;
  } catch {
    return null;
  }
}

export function clearPid() {
  const pidPath = getPidPath();

  if (existsSync(pidPath)) {
    try {
      unlinkSync(pidPath);
    } catch {
    }
  }
}

export function killProcess(pid) {
  return new Promise((resolve) => {
    try {
      process.kill(pid, 'SIGTERM');
      setTimeout(() => {
        try {
          process.kill(pid, 0);
          process.kill(pid, 'SIGKILL');
        } catch {
        }
        resolve();
      }, 1000);
    } catch {
      resolve();
    }
  });
}

export function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}