# PVP Spectator System Design

**Goal**
Add a public spectator system to the deployed PVP mode so website visitors can watch live matches between two players without joining as a player.

**Problem**
- The current PVP mode only supports two active players in a room.
- There is no public entry point for observing ongoing matches.
- The website cannot currently act as a live showcase screen during demos, judging, or social sharing.

**Chosen Approach**
Add a public spectator lobby that lists currently watchable rooms, then let visitors enter a dedicated spectator view over WebSocket.

This design keeps the existing room-based PVP model and extends it with a third participant type: spectator. Spectators receive room state and match events in real time, but they do not occupy player slots and cannot send gameplay actions.

## Scope

This change includes:
- a public spectator lobby on the website
- real-time listing of watchable rooms
- spectator-only room entry over WebSocket
- a dedicated spectator view for live match state
- broadcasting match state updates to spectators

This change does not include:
- chat
- replay scrubbing
- historical match archive
- spectator moderation tools
- video/audio streaming
- watching lobby-only rooms

## Product Behavior

### Spectator Entry

The website should expose a public spectator lobby inside the PVP area.

The spectator lobby shows only rooms that are currently watchable:
- `in_round`
- `between_rounds`

The spectator lobby does not show:
- `lobby`
- `finished`

Each lobby card should display:
- room code
- player A name
- player B name
- current round
- current wins
- match state label

Clicking a card opens a spectator session for that room.

### Spectator Experience

The spectator view should show full live match state:
- both player names
- current round
- regulation vs sudden-death state
- current wins
- per-round results as they are resolved
- current match phase, such as countdown, in round, or round settlement
- final result when the match ends

The spectator view should not show player-only controls:
- create room
- join room
- ready
- punch submission
- fallback charge controls

The spectator view should feel like a live match monitor, not like a playable game screen.

### Match Visibility Rules

Only active matches are spectatable:
- if a room is `in_round`, it appears
- if a room is `between_rounds`, it appears
- if a room returns to `lobby`, it disappears
- if a room becomes `finished`, it disappears from the public list, but current spectators may continue seeing the result state until they leave or return

If a match is interrupted because a player disconnects permanently, spectators should see a clear match interruption state and be able to return to the spectator lobby.

## Architecture

The system keeps the existing browser + WebSocket architecture and extends it in three places:
- server room state
- client PVP socket state
- PVP page UI

### Server Responsibilities

`server/server.js` remains the room authority and must now manage:
- player sockets
- spectator sockets
- public list of watchable rooms
- pushing room state and match events to spectators

Rooms should gain a new `spectators` collection:
- `spectators: Set<WebSocket>`

Spectators never occupy `players.A` or `players.B`.

### Client Responsibilities

`src/pvp.js` should add spectator-oriented client state and actions:
- spectatable room list
- watch-room action
- leave-spectator action
- spectator mode flag in the client snapshot

`src/app.js` should:
- render a spectator lobby
- open a spectator view when a room card is clicked
- update the live UI from room and match events
- hide player controls while spectating

## Data Model

### Watchable Room Summary

The public spectator list should use a small summary shape:
- `roomCode`
- `playerAName`
- `playerBName`
- `round`
- `maxRounds`
- `wins`
- `status`
- `isSuddenDeath`

This summary is used only for the public spectator list.

### Spectator Session State

The client snapshot should distinguish between:
- player mode
- spectator mode

Suggested fields:
- `viewMode: 'player' | 'spectator' | 'none'`
- `watchedRoomCode`
- `spectatableRooms`

## WebSocket Protocol

### New Client Messages

- `listSpectatableRooms`
- `watchRoom`
- `leaveSpectator`

### New Server Messages

- `spectatableRooms`
- `spectatorJoined`
- `spectatorLeft`
- existing `room`, `startRound`, `roundResult`, `matchResult`, and interruption-related messages should also be sent to active spectators for the watched room

### Watch Flow

1. spectator connects
2. spectator requests `listSpectatableRooms`
3. server returns current public watch list
4. spectator sends `watchRoom` with a room code
5. server validates the room is watchable
6. server registers the socket as a spectator for that room
7. server returns `spectatorJoined` plus the latest room state
8. server broadcasts future room updates and match events to that spectator

### Leave Flow

If the spectator clicks back or leaves the spectator view:
- send `leaveSpectator`
- remove socket from the room spectator set
- return to spectator lobby state

If the socket disconnects:
- remove it from the spectator set automatically

## UI Design

### Spectator Lobby

The PVP screen should gain a second public list area:
- existing joinable room list for players
- new spectatable room list for viewers

The spectatable list should be visually distinct from joinable rooms:
- title such as `公开观战大厅`
- match cards with player vs player presentation
- state chip such as `进行中`, `回合结算`, `Sudden Death`

If no watchable rooms exist, show an empty-state message:
- `当前暂无可观战比赛`

### Spectator View

The spectator view can reuse the battle status/result visual language, but must remove all player agency.

Core information:
- player names
- match phase
- current round
- scoreline
- sudden-death banner when applicable
- rolling round results

It is acceptable for the spectator view to reuse existing battle status and result surfaces as long as the copy clearly indicates spectator mode.

## State Rules

### Watchable Status

Use this rule:
- `watchable = room.status === 'in_round' || room.status === 'between_rounds'`

### Spectator Update Rules

Spectators should receive:
- full room snapshot on entry
- every room snapshot update
- `startRound`
- `roundResult`
- `matchResult`
- interruption or opponent-left resolution if the match cannot continue

### Finished Match Handling

When a room reaches `finished`:
- it should be removed from the public spectator list
- active spectators may still see the final result state for that room
- if they leave after that, they return to the public spectator lobby

## Error Handling

### Join Errors

If a spectator tries to watch a room that is no longer watchable:
- return an error like `Match is no longer available for spectating.`
- refresh the public spectator list

### Interrupted Matches

If a player disconnects and the room cannot continue:
- spectators should see a clear interruption state
- the watched room should disappear from the public list once it is no longer active

### Mixed Role Protection

A single socket should not be both:
- active player in one room
- spectator in another room

For simplicity, one connection should have one active role at a time:
- player
- spectator
- none

## Testing Plan

### Public Lobby

- verify that only `in_round` and `between_rounds` rooms appear
- verify that `lobby` and `finished` rooms do not appear
- verify empty state when there are no watchable rooms

### Spectator Session

- verify spectator can enter a live room
- verify spectator does not consume player slot A or B
- verify spectator cannot send player actions

### Live Match Updates

- verify spectator receives `startRound`
- verify spectator receives `roundResult`
- verify spectator sees sudden-death transition
- verify spectator sees `matchResult`

### Failure Cases

- verify clicking a no-longer-watchable room shows a clear error
- verify spectator is removed from room spectator set on disconnect
- verify interrupted matches surface a readable spectator message

## Success Criteria

This feature is successful when:
- the site exposes a public spectator lobby for live matches
- users can enter a live match as a spectator without affecting the two player slots
- spectators see full live match progress, including sudden death and final result
- finished or non-active rooms are not exposed as publicly watchable
- the spectator experience is stable and does not interfere with player gameplay
