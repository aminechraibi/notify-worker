import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { getPidPath } from '../src/services/state.js';

describe('PID Service', () => {
  const pidPath = getPidPath();

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