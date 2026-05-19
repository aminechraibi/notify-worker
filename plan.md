# Notify Worker — Development Task Plan

## Project Goal

Build a lightweight cross-platform CLI background worker that:

- shows desktop notifications every `N` minutes
- reads sentences from a file
- cycles messages sequentially
- runs without GUI
- supports start/stop/status commands via `npx`
- supports npm publishing and versioning

---

# Project Rules

## Git Rules

- NEVER commit Claude as co-author
- NEVER add AI-generated co-author metadata
- keep commit history clean and human-authored

---

# Development Stack

| Purpose | Tool |
|---|---|
| Runtime | Node.js |
| CLI | Commander.js |
| Notifications | node-notifier |
| Tests | Vitest or Jest |
| Linting | ESLint |
| Formatting | Prettier |
| Package Publishing | npm |
| Versioning | semantic versioning |

---

# Initial Project Setup

## Task 1 — Initialize Project

### Actions

- create repository
- initialize npm project
- configure package.json
- configure ESM or CommonJS
- add `.gitignore`
- add MIT license

### Deliverables

```txt id="m8yzqd"
package.json
.gitignore
LICENSE
````

---

## Task 2 — Install Dependencies

### Runtime Dependencies

```bash id="3g4z1d"
npm install commander node-notifier
```

### Dev Dependencies

```bash id="d0m4kf"
npm install -D vitest eslint prettier
```

---

# Project Structure

## Task 3 — Create Folder Structure

### Structure

```txt id="4vr8wl"
notify-worker/
│
├── bin/
├── src/
├── tests/
├── messages/
├── state/
├── logs/
├── .github/
│   └── workflows/
├── README.md
├── plan.md
├── package.json
└── LICENSE
```

---

# CLI Development

## Task 4 — Create CLI Entry Point

### Actions

Create:

```txt id="0df9fk"
bin/notify-worker.js
```

### Features

* parse commands
* validate arguments
* route commands

---

## Task 5 — Implement Start Command

### Command

```bash id="lf7ahx"
npx notify-worker start --every 15
```

### Features

* validate interval
* prevent duplicate workers
* spawn detached worker
* save PID
* initialize state

---

## Task 6 — Implement Stop Command

### Command

```bash id="3w7a9h"
npx notify-worker stop
```

### Features

* read PID file
* terminate worker
* cleanup state

---

## Task 7 — Implement Restart Command

### Command

```bash id="r7k0ig"
npx notify-worker restart
```

### Features

* stop worker
* restart worker safely

---

## Task 8 — Implement Status Command

### Command

```bash id="d5h7xj"
npx notify-worker status
```

### Output Example

```txt id="bjgg9m"
Running: yes
PID: 4412
Interval: 15 minutes
Current Index: 4
```

---

## Task 9 — Implement Reload Command

### Command

```bash id="k4t5a5"
npx notify-worker reload
```

### Features

* reload messages file
* update worker queue dynamically

---

# Worker Development

## Task 10 — Create Worker Process

### Features

* detached process
* background execution
* persistent loop

### Spawn Strategy

```js id="nn3ln4"
spawn(process.execPath, ['src/worker/worker.js'], {
  detached: true,
  stdio: 'ignore'
}).unref()
```

---

## Task 11 — Implement Scheduler

### Features

* notification loop
* configurable interval
* low CPU usage

### Initial Strategy

Use:

```js id="9t2m11"
setInterval()
```

---

## Task 12 — Implement Notification Service

### Features

* cross-platform notifications
* graceful failure handling

### Library

```bash id="p6ny2g"
npm install node-notifier
```

---

## Task 13 — Implement Message Queue

### Features

* sequential cycling
* circular index handling
* duplicate support

### Cycle Logic

```js id="bnr8sn"
index = (index + 1) % messages.length
```

---

## Task 14 — Implement Message File Loader

### Features

* read TXT file
* ignore empty lines
* preserve order
* trim whitespace

### Default File

```txt id="m33z4y"
messages/sentences.txt
```

---

# State Management

## Task 15 — Implement State Persistence

### File

```txt id="0trmjm"
state/state.json
```

### Persist

* interval
* current index
* running state
* timestamps

---

## Task 16 — Implement PID Management

### File

```txt id="9a4jbe"
state/worker.pid
```

### Features

* duplicate worker prevention
* process validation
* cleanup handling

---

# Error Handling

## Task 17 — Handle Empty Message File

### Behavior

* skip notifications
* show warning logs

---

## Task 18 — Handle Invalid State File

### Behavior

* recreate defaults
* prevent crashes

---

## Task 19 — Handle Notification Failures

### Behavior

* continue loop safely
* log errors
* avoid worker crash

---

# Testing

## Task 20 — Setup Unit Testing

### Requirement

Use unit tests for all critical logic.

### Mandatory Coverage

* message parser
* cycle logic
* scheduler
* PID manager
* state manager
* CLI validation

### Requirement

Make sure everything works reliably before release.

---

## Task 21 — Add Integration Tests

### Test Scenarios

* worker startup
* worker shutdown
* restart flow
* notification scheduling
* state restoration

---

## Task 22 — Add Cross-Platform Testing

### Platforms

* Windows
* macOS
* Linux

### Verify

* notifications
* detached worker
* PID cleanup

---

# Code Quality

## Task 23 — Setup ESLint

### Goal

* consistent code style
* avoid runtime issues

---

## Task 24 — Setup Prettier

### Goal

* automatic formatting
* consistent repository style

---

# Documentation

## Task 25 — Create README.md

### README Requirements

Explain clearly:

* project purpose
* installation
* usage
* CLI commands
* examples
* message file format
* how notifications work
* development setup
* testing
* npm publishing
* troubleshooting
* cross-platform notes

### Include Examples

```bash id="6d7aqm"
npx notify-worker start --every 10
```

```bash id="7fjks5"
npx notify-worker stop
```

```bash id="h9jlwm"
npx notify-worker status
```

---

## Task 26 — Add GitHub Usage Instructions

### Include

* clone repository
* install dependencies
* local development
* running tests
* publishing workflow

---

# npm Publishing

## Task 27 — Configure npm Package

### Requirements

* proper package name
* executable bin entry
* keywords
* version support
* npm publish support

### package.json

Must support:

```bash id="3y3vr7"
npm publish
```

---

## Task 28 — Configure Versioning

### Use Semantic Versioning

Format:

```txt id="brsqwf"
MAJOR.MINOR.PATCH
```

### Examples

```txt id="v5jvq0"
1.0.0
1.1.0
1.1.1
```

---

## Task 29 — Add Release Workflow

### Optional GitHub Actions

Automate:

* tests
* linting
* release validation

---

# Support Section

## Task 30 — Add Support Button

Add to README.md:

```md id="7oyy4n"
## Support

Found this useful? A coffee goes a long way ☕

<a href='https://ko-fi.com/P5P21ZQGK2' target='_blank'><img height='72' style='border:0px;height:72px;' src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
```

---

# Final Deliverables

## Required Files

```txt id="1mav1t"
README.md
plan.md
LICENSE
package.json
```

---

## Required Features

* CLI worker
* desktop notifications
* sequential cycling
* detached background process
* persistent state
* tests
* npm publishing
* semantic versioning
* complete documentation

---

# MVP Completion Checklist

## Core Features

* [ ] start command
* [ ] stop command
* [ ] restart command
* [ ] status command
* [ ] reload command

---

## Worker Features

* [ ] detached process
* [ ] notification scheduler
* [ ] sequential cycling
* [ ] persistent state

---

## Reliability

* [ ] unit tests
* [ ] integration tests
* [ ] error handling
* [ ] PID cleanup

---

## Documentation

* [ ] complete README
* [ ] installation guide
* [ ] usage examples
* [ ] npm publish instructions

---

## Release

* [ ] semantic versioning
* [ ] npm publish ready
* [ ] clean repository
* [ ] no AI co-author metadata

---

```
```
