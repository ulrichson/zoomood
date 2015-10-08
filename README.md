# zoomood

A virtual mood board that allows you to organize media on a zoomable canvas.

## Setup
```
npm install
```

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

