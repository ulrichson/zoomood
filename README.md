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

Furthermore, MongoDB must be running (e.g. `mongod --dbpath ~/.mongodb/data`).

## Debugging

Install debugger with `npm install -g node-inspector` and run `node-debug app.js`.

## Test

`(echo -n '{"session": "session_20151111_1951_56438e38ec8f255336000001", "image_base64": "'; base64 ~/Desktop/test.jpg; echo '"}') | curl -H "Content-Type: application/json" -d @- localhost:3000/media`

## Requirements

- node.js
- MongoDB

## API

### Session

- Create new session: `curl -X POST localhost:3000/session` or `curl -X POST -H "Content-Type: application/json" -d '{"name":"session_20151111_1951_56438e38ec8f255336000001"}' localhost:3000/session`
- Delete all sessions: `curl -X DELETE localhost:3000/session`
- Delete one session: `curl -X DELETE localhost:3000/session/session_20151111_1951_56438e38ec8f255336000001`
- List all sessions: `curl -X GET localhost:3000/session`

### Media

- Delete all media: `curl -X DELETE localhost:3000/media`
- Delete one media: `curl -X DELETE localhost:3000/media/5a7fb421-b888-419f-9565-1b4b0c0218a6.jpg`
