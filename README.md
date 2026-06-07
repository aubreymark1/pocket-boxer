# Pocket Boxer

![Pocket Boxer QR](./pocketboxer-qr.png)

- Quick play: [https://pocketboxer.duckdns.org](https://pocketboxer.duckdns.org)

Pocket Boxer is a mobile-first neon boxing web game built for hackathon demo play.
Players hold a phone, throw a short punch motion, and turn that motion into arcade-style score, battle flow, and live PVP matches.

## Live Demo

- Website: [https://pocketboxer.duckdns.org](https://pocketboxer.duckdns.org)
- Best experience: mobile browser with motion sensors enabled
- Desktop fallback: available for UI browsing and charge-mode interaction

## Current Features

### 1. Punch Test

- Motion-permission request and calibration flow
- Short punch detection with score mapping
- Fallback charge mode when device motion is unavailable
- Result screen with rating, title, and feedback effects

### 2. Three-Round Robot Battle

- Local battle flow built on top of punch scoring
- Three-round robot fight presentation
- Round-by-round battle replay and result summary
- Theme-driven challenge copy and responsive battle UI

### 3. Online PVP

- Room creation and room-code join flow
- Ready check before match start
- Round-based punch submission over WebSocket
- Best-of-three match structure with `Sudden Death` overtime on ties
- Longer round-result display timing for readability
- Joinable room lobby for active public rooms

### 4. Public Spectator Mode

- Public spectator lobby for live matches
- Watch ongoing matches without taking a player slot
- Real-time room state updates for round flow, wins, and match result
- Match interruption handling for spectator clients

## Gameplay Flow

```text
Home
  -> Punch Test
  -> Robot Battle
  -> PVP Online Battle

PVP
  -> Create / Join Room
  -> Both Players Ready
  -> Start Round
  -> Submit Punch
  -> Resolve Round
  -> BO3 Winner or Sudden Death

Spectator
  -> Open Spectator Lobby
  -> Choose Active Match
  -> Watch Live Round State and Result
```

## Tech Stack

- Frontend: vanilla HTML, CSS, and JavaScript
- Motion input: `DeviceMotionEvent`
- PVP transport: Node.js WebSocket server using `ws`
- Deployment: Nginx + systemd

## Project Structure

```text
index.html
styles.css
src/
  app.js
  battle.js
  feedback.js
  motion.js
  pvp.js
  ui.js
server/
  package.json
  pvp-room-state.js
  pvp-room-state.test.js
  server.js
deploy/
  nginx/
    pocket-boxer.conf
  systemd/
    pocket-boxer-pvp.service
docs/
  TASKS.md
  HANDOFF.md
  GIT_WORKFLOW.md
  FRONTEND_BRANCH_TASKS.md
```

## Local Development

### Frontend

Serve the static site from the project root:

```bash
python -m http.server 8080
```

Open:

```text
http://localhost:8080
```

### PVP Server

Install dependencies and start the WebSocket server:

```bash
cd server
npm install
npm start
```

Default local WebSocket URL:

```text
ws://localhost:8787
```

### Run Server Tests

```bash
cd server
npm test
```

## Deployment Notes

- Nginx serves the static frontend and proxies `/ws` to the Node WebSocket server
- `deploy/nginx/pocket-boxer.conf` contains the site and WebSocket proxy template
- `deploy/systemd/pocket-boxer-pvp.service` runs the PVP server in production
- Production health endpoint:

```text
https://pocketboxer.duckdns.org/health-pvp
```

## Current Status

- Main gameplay loop is playable on mobile
- PVP rooms, room lobby, and spectator mode are live
- Local server tests are available for room-state and overtime logic
- The project is optimized for demo delivery rather than full production hardening
