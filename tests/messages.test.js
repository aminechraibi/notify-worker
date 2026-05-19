import { describe, it, expect } from 'vitest';
import { loadMessages, getNextMessage, cycleIndex } from '../src/services/messages.js';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Messages Service', () => {
  describe('loadMessages', () => {
    it('should load messages from file', () => {
      const messages = loadMessages('messages/sentences.txt');
      expect(messages).toBeDefined();
      expect(Array.isArray(messages)).toBe(true);
    });

    it('should return empty array for non-existent file', () => {
      const messages = loadMessages('non-existent.txt');
      expect(messages).toEqual([]);
    });

    it('should filter empty lines', () => {
      const testDir = join(__dirname, 'test-data');
      if (!existsSync(testDir)) {
        mkdirSync(testDir, { recursive: true });
      }
      const testFile = join(testDir, 'test-messages.txt');
      writeFileSync(testFile, 'Line 1\n\nLine 2\n   \nLine 3\n');

      const messages = loadMessages('tests/test-data/test-messages.txt');
      expect(messages).toHaveLength(3);
      expect(messages[0]).toBe('Line 1');
      expect(messages[1]).toBe('Line 2');
      expect(messages[2]).toBe('Line 3');

      unlinkSync(testFile);
    });

    it('should trim whitespace', () => {
      const testDir = join(__dirname, 'test-data');
      if (!existsSync(testDir)) {
        mkdirSync(testDir, { recursive: true });
      }
      const testFile = join(testDir, 'test-trim.txt');
      writeFileSync(testFile, '  Trimmed  \n  Another  \n');

      const messages = loadMessages('tests/test-data/test-trim.txt');
      expect(messages[0]).toBe('Trimmed');
      expect(messages[1]).toBe('Another');

      unlinkSync(testFile);
    });
  });

  describe('getNextMessage', () => {
    it('should return message at given index', () => {
      const messages = ['First', 'Second', 'Third'];
      expect(getNextMessage(messages, 0)).toBe('First');
      expect(getNextMessage(messages, 1)).toBe('Second');
      expect(getNextMessage(messages, 2)).toBe('Third');
    });

    it('should wrap around using modulo', () => {
      const messages = ['First', 'Second'];
      expect(getNextMessage(messages, 0)).toBe('First');
      expect(getNextMessage(messages, 1)).toBe('Second');
      expect(getNextMessage(messages, 2)).toBe('First');
      expect(getNextMessage(messages, 5)).toBe('Second');
    });

    it('should return null for empty array', () => {
      expect(getNextMessage([], 0)).toBeNull();
    });

    it('should return null for null input', () => {
      expect(getNextMessage(null, 0)).toBeNull();
    });
  });

  describe('cycleIndex', () => {
    it('should increment index', () => {
      expect(cycleIndex(0, 3)).toBe(1);
      expect(cycleIndex(1, 3)).toBe(2);
    });

    it('should wrap around to 0', () => {
      expect(cycleIndex(2, 3)).toBe(0);
      expect(cycleIndex(5, 3)).toBe(0);
    });

    it('should handle length of 1', () => {
      expect(cycleIndex(0, 1)).toBe(0);
      expect(cycleIndex(5, 1)).toBe(0);
    });

    it('should handle length of 0', () => {
      expect(cycleIndex(0, 0)).toBe(0);
    });
  });
});