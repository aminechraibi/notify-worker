import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from 'fs';
import { getPidPath } from '../src/services/state.js';
import { dirname } from 'path';

describe('PID Service', () => {
  const pidPath = getPidPath();

  beforeEach(() => {
    const dir = dirname(pidPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });

  afterEach(() => {
    if (existsSync(pidPath)) {
      unlinkSync(pidPath);
    }
  });

  describe('PID file operations', () => {
    it('should not exist initially', () => {
      expect(existsSync(pidPath)).toBe(false);
    });

    it('should create PID file when written', () => {
      writeFileSync(pidPath, '12345');
      expect(existsSync(pidPath)).toBe(true);
      expect(readFileSync(pidPath, 'utf-8')).toBe('12345');
    });

    it('should handle PID deletion', () => {
      writeFileSync(pidPath, '12345');
      expect(existsSync(pidPath)).toBe(true);
      unlinkSync(pidPath);
      expect(existsSync(pidPath)).toBe(false);
    });
  });
});