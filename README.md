# notify-worker

A lightweight cross-platform CLI background worker that shows desktop notifications at configurable intervals.

## Features

- Shows desktop notifications every N minutes
- Reads sentences from a file and cycles through them sequentially
- Runs as a background worker without GUI
- Supports start/stop/restart/status/reload commands via CLI
- Persistent state management
- Cross-platform support (Windows, macOS, Linux)

## Installation

### Prerequisites

- Node.js 14.0.0 or higher
- npm 6.0.0 or higher

### Local Development

```bash
git clone <repository-url>
cd notify-worker
npm install
```

### Global Installation

```bash
npm install -g notify-worker
```

## Usage

### Start the Worker

```bash
npx notify-worker start --every 15
```

Options:
- `-e, --every <minutes>` - Interval in minutes between notifications (default: 15)
- `-m, --messages <file>` - Path to messages file (default: messages/sentences.txt)

### Stop the Worker

```bash
npx notify-worker stop
```

### Restart the Worker

```bash
npx notify-worker restart
npx notify-worker restart --every 10  # Change interval on restart
```

### Check Status

```bash
npx notify-worker status
```

Output example:
```
Running: yes
PID: 4412
Interval: 15 minutes
Current Index: 4
Started: 2024-01-01T12:00:00.000Z
```

### Reload Messages

```bash
npx notify-worker reload
```

Reloads the messages file without restarting the worker.

## Message File Format

Create a text file with one message per line:

```text
Time for a break!
Take a deep breath
Stay hydrated
Move around a bit
Rest your eyes
Stretch your muscles
```

Empty lines are ignored. Messages cycle sequentially.

### Default Location

The messages file is relative to the **current working directory** where you run the command:

```bash
# When installed locally (in project folder):
npx notify-worker start
# Looks for: ./messages/sentences.txt

# When installed globally:
notify-worker start
# Looks for: <current-dir>/messages/sentences.txt
```

### Custom Location

You can specify any path:

```bash
npx notify-worker start --every 15 --messages "my-notifications.txt"
npx notify-worker start --messages "C:/Users/You/notifications.txt"
```

If the messages file doesn't exist or is empty, a default file is automatically created at that location.

## How Notifications Work

1. Worker reads messages from the specified file
2. At each interval, displays the next message in sequence
3. After displaying all messages, cycles back to the beginning
4. Current index is saved to state file for persistence

## Development Setup

### Clone and Install

```bash
git clone <repository-url>
cd notify-worker
npm install
```

### Run Tests

```bash
npm test           # Watch mode
npm run test:run   # Single run
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Project Structure

```
notify-worker/
├── bin/                    # CLI entry point
├── src/
│   ├── cli/               # CLI commands
│   ├── services/          # Core services (state, PID, notifications, messages)
│   ├── worker/            # Background worker process
│   └── index.js           # Main exports
├── tests/                  # Unit tests
├── messages/              # Default message files
├── state/                 # State and PID files
├── package.json
└── README.md
```

## npm Publishing

### Prerequisites

1. Update version in package.json:
   ```bash
   npm version patch  # or minor/major
   ```

2. Update CHANGELOG.md

### Publish to npm

```bash
npm publish
```

### Package.json Configuration

The package is configured with:
- Proper bin entry for CLI
- Semantic versioning (1.0.0)
- Keywords for discoverability
- MIT license

## Troubleshooting

### Worker won't start

- Check if another worker is already running: `npx notify-worker status`
- Verify messages file exists: `messages/sentences.txt`

### Notifications not appearing

- Check system notification permissions
- On Windows, ensure notifications are not blocked
- On macOS, check System Preferences > Notifications
- On Linux, verify notification daemon is running

### Worker crashes

- Check logs in console output
- Verify Node.js version is 14.0.0 or higher
- Ensure state directory is writable

### Permission issues

- On some systems, may need to run with appropriate permissions
- Ensure the state and log directories are writable

## Cross-Platform Notes

### Windows

- Uses Windows Toast Notifications
- May require additional permissions for first run

### macOS

- Uses macOS Notification Center
- Ensure notifications enabled in System Preferences

### Linux

- Supports multiple notification daemons (libnotify, notify-osd, etc.)
- May require libnotify-bin package

## License

MIT License - see LICENSE file

## Support

Found this useful? A coffee goes a long way

<a href='https://ko-fi.com/P5P21ZQGK2' target='_blank'><img height='72' style='border:0px;height:72px;' src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>