import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getState, saveState, getStatePath } from '../src/services/state.js';
import { existsSync, readFileSync, unlinkSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('State Service', () => {
  const testStateDir = join(__dirname, 'test-data', 'state');

  beforeEach(() => {
    if (!existsSync(testStateDir)) {
      mkdirSync(testStateDir, { recursive: true });
    }
  });

  afterEach(() => {
    const stateFile = join(testStateDir, 'state.json');
    if (existsSync(stateFile)) {
      unlinkSync(stateFile);
    }
  });

  describe('getState', () => {
    it('should return default state when no state file exists', () => {
      const state = getState();
      expect(state).toBeDefined();
      expect(state.running).toBe(false);
      expect(state.pid).toBeNull();
      expect(state.interval).toBe(15);
      expect(state.currentIndex).toBe(0);
    });

    it('should return existing state from file', () => {
      const stateFile = getStatePath();
      const testState = {
        running: true,
        pid: 12345,
        interval: 30,
        currentIndex: 5,
        startedAt: '2024-01-01T00:00:00.000Z'
      };

      const dir = dirname(stateFile);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(stateFile, JSON.stringify(testState));

      const state = getState();
      expect(state.running).toBe(true);
      expect(state.pid).toBe(12345);
      expect(state.interval).toBe(30);
      expect(state.currentIndex).toBe(5);
    });

    it('should return default state for invalid JSON', () => {
      const stateFile = getStatePath();
      const dir = dirname(stateFile);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(stateFile, 'invalid json');

      const state = getState();
      expect(state.running).toBe(false);
    });
  });

  describe('saveState', () => {
    it('should save state to file', () => {
      const state = {
        running: true,
        pid: 54321,
        interval: 20,
        currentIndex: 3,
        startedAt: '2024-01-01T12:00:00.000Z'
      };

      saveState(state);

      const stateFile = getStatePath();
      expect(existsSync(stateFile)).toBe(true);

      const saved = JSON.parse(readFileSync(stateFile, 'utf-8'));
      expect(saved.running).toBe(true);
      expect(saved.pid).toBe(54321);
    });
  });
});