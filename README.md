# zoomood

A virtual mood board that allows you to organize media on a zoomable canvas.

## Setup
```
npm install
```

## Build

- `gulp build` to convert less files into css
- `bower install` when bower packages for the front-end code changed or are non-existent

## Run

```
node app.js
```

Furthermore, MongoDB must be running.

## Debugging

Install debugger with `npm install -g node-inspector` and run `node-debug app.js`.

## Test

`(echo -n '{"session": "session_20151111_1740_56436f98002c2e94ed14811a", "image_base64": "'; base64 ~/Desktop/test.jpg; echo '"}') | curl -H "Content-Type: application/json" -d @- localhost:3000/media`

## Requirements

- node.js
- MongoDB

## API

### Session

- Create new session: `curl -X POST localhost:3000/session`
- Delete all sessions: `curl -X DELETE localhost:3000/session`
- Delete one session: `curl -X DELETE localhost:3000/session/session_20151111_1740_56436f98002c2e94ed14811a`
- List all sessions: `curl -X GET localhost:3000/session`

### Media

- Delete all meda: `curl -X DELETE localhost:3000/media`

