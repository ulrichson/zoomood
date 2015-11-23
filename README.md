# Zoomood

Zoomod is a virtual moodboard that allows you to organize media on a zoomable canvas.
It can e.g. be used on a whiteboard and offers following features:

- Panning and zooming into canvas
- Upload media via API
- Create free-drawn media on canvas
- Adjust media layer position on canvas
- Transforming media or a group of media on cavnas (move, scale and rotate)
- Save canvas state as image
- Organize moodboards into sessions

## Setup

To setup the project or when new packages are included run following command (install npm and bower depencies):

```
npm install
```

## Development Environment

```
npm install -g bower
npm install -g gulp
npm install -g apidoc
```

## Build

- `gulp build` generateds apidoc and compiles less

## Run

```
node app.js
```

Furthermore, MongoDB must be running (e.g. `mongod --dbpath ~/.mongodb/data`).

## Debug

Install debugger with `npm install -g node-inspector` and run `node-debug app.js`.

## Requirements

To run the project the server must meet following requirements:

- Node.js
- MongoDB

## API

Documentation is also available under [docs/index.html](doc/index.html) (generated with [apiDocs](http://apidocjs.com), can be installed via `npm install apidoc -g`).

In case of errors the API responds with a HTTP error code and contains an error message in the response `error` field.

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
