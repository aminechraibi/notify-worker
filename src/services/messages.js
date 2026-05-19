import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function loadMessages(filePath = 'messages/sentences.txt') {
  const fullPath = join(__dirname, '..', '..', filePath);

  if (!existsSync(fullPath)) {
    console.warn('Messages file not found:', fullPath);
    return [];
  }

  try {
    const content = readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');

    return lines
      .map(line => line.trim())
      .filter(line => line.length > 0);
  } catch (error) {
    console.error('Failed to load messages:', error.message);
    return [];
  }
}

export function getNextMessage(messages, index) {
  if (!messages || messages.length === 0) {
    return null;
  }

  return messages[index % messages.length];
}

export function cycleIndex(currentIndex, length) {
  if (length === 0) return 0;
  return (currentIndex + 1) % length;
}