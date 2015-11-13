# zoomood

A virtual mood board that allows you to organize media on a zoomable canvas.

## Setup
```
npm install
```

## Build

- `gulp less` to convert less files into css
- `bower install` when bower packages for the front-end code changed or are non-existent

## Run

```
node app.js
```

Furthermore, MongoDB must be running (e.g. `mongod --dbpath ~/.mongodb/data`).

## Debug

Install debugger with `npm install -g node-inspector` and run `node-debug app.js`.

## Requirements

- node.js
- MongoDB

## API

### Session

- Create new session: `curl -X POST localhost:3000/session` or `curl -X POST -H "Content-Type: application/json" -d '{"name":"<name>""}' localhost:3000/session`
- Delete all sessions: `curl -X DELETE localhost:3000/session`
- Delete one session: `curl -X DELETE localhost:3000/session/<id>`
- List all sessions: `curl -X GET localhost:3000/session`
- Get active session: `curl -X GET localhost:3000/session/active`
- Set active session: `curl -X PUT localhost:3000/session/active/<id>`

### Media

- Delete all media: `curl -X DELETE localhost:3000/media`
- Delete one media: `curl -X DELETE localhost:3000/media/<name>`
- Upload image to active session: `(echo -n '{ "image_base64": "'; base64 ~/Desktop/test.jpg; echo '"}') | curl -H "Content-Type: application/json" -d @- localhost:3000/media`
