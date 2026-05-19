import notifier from 'node-notifier';

export function sendNotification(message, title = 'Notify Worker') {
  return new Promise((resolve, reject) => {
    notifier.notify(
      {
        title: title,
        message: message,
        sound: true,
        wait: false,
        appID: 'notify-worker'
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