import notifier from 'node-notifier';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const iconPath = join(__dirname, '..', '..', 'assets', 'icon.svg');

export function sendNotification(message, title = 'Notify Worker') {
  return new Promise((resolve, reject) => {
    notifier.notify(
      {
        title: title,
        message: message,
        sound: true,
        wait: false,
        appID: 'notify-worker',
        icon: iconPath
      },
      (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      }
    );
  });
}

export async function sendNotificationSafe(message, title = 'Notify Worker') {
  try {
    await sendNotification(message, title);
    return true;
  } catch (error) {
    console.error('Notification failed:', error.message);
    return false;
  }
}