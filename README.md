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

## Test

`(echo -n '{"image_base64": "'; base64 ~/Desktop/test.jpg; echo '"}') | curl -H "Content-Type: application/json" -d @- localhost:3000/media`

## Requirements
- node.js
- MongoDB

## Roadmap

