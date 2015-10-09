define([
    'jquery',
    // 'socketio',
    'fabric',
    'jquery.fileupload',
    'jquery.ui.widget',
    'bootstrap'
//  ], function($, io, fabric) {
//  var fabricCanvas,
//      socket = io.connect('http://localhost');
    ], function($, fabric) {

  $(function() {

    /*******************************
     * Variables
     *******************************/
    var canvas;
    var fabricCanvas

    var lastX, lastY;
    var dragStart, dragged;

    var scaleFactor = 1.1;
    var spacePressed = false;
    var selectionEnabled = true;

    var splashScreen = $('.splash-screen');

    /*******************************
     * AJAX calls
     *******************************/
    var ajaxSaveCanvas = function() {
      // update all media
      var objects = fabricCanvas.getObjects();
      for (i in objects) {
        ajaxUpdateMedia(objects[i]);
      }
    }

    var ajaxUpdateMedia = function(media) {
      // sync to server
      /*socket.emit('update media', {
        name: media.name,
        scale: media.get('scaleX'),
        angle: media.get('angle'),
        x: media.get('left'),
        y: media.get('top')
      });*/

      // save data
      $.ajax({
        url: '/media/' + media.name,
        type: 'PUT',
        accepts: {
          json: 'application/json'
        },
        contentType: 'application/json',
        data: JSON.stringify({
          scale: media.get('scaleX'),
          angle: media.get('angle'),
          x: media.get('left'),
          y: media.get('top')
        }),
        beforeSend: function(xhr) {
          // WORKAROUND. For any reason the 'accepts' fields isn't applied
          xhr.setRequestHeader('Accept', 'application/json');
        },
        success: function(data, textStatus, jqXHR) {
          console.log('media updated: "' + media.name);
        }
      });
    };

    var ajaxDeleteMedia = function(media) {
      $.ajax({
        // url: '/media/' + media.name,
        url: media.delete_url,
        type: 'DELETE',
        accepts: {
          json: 'application/json'
        },
        beforeSend: function(xhr) {
          // WORKAROUND. For any reason the 'accepts' fields isn't applied
          xhr.setRequestHeader('Accept', 'application/json');
        },
        success: function(data, textStatus, jqXHR) {
          fabricCanvas.remove(media);
          console.log('media deleted: ' + media.name);
        }
      });
    };

    var ajaxGetMedia = function(name) {
      name = name || '';
      $.getJSON('/media/' + name, function(data) {
        // console.log('data.length=' + data.length);
        if (data.length) {
          $.each(data, function(key, value) {
            console.log('media loaded (' + key + '): ' + value.name);
            fabric.Image.fromURL(value.url, function(img) {
              addZoomoodImage(img, value);
              if (key == data.length - 1) {
                hideSplashScreen();
              }
            });
          });
        } else {
          if (!$.isEmptyObject(data)) {
            console.log('media loaded: ' + data.name);
            fabric.Image.fromURL(data.url, function(img) {
              addZoomoodImage(img, data);
            });
          } else {
            hideSplashScreen();
          }
        }
      });
    };

    var addZoomoodImage = function(img, data) {
      // var radius = 15;
      // var x = -img.width / 2;
      // var y = -img.height / 2;
      // img.clipTo = function(ctx) {
      //  // start at left top
      //  ctx.moveTo(x + radius, y);
      //  // right top
      //  ctx.lineTo(x + img.width - radius, y);
      //  ctx.quadraticCurveTo(x + img.width, y, x + img.width, y + radius);
      //  // right bottom
      //  ctx.lineTo(x + img.width, y + img.height - radius);
      //  ctx.quadraticCurveTo(x + img.width, y + img.height, x + img.width - radius, y + img.height);
      //  // left bottom
      //  ctx.lineTo(x + radius, y + img.height);
      //  ctx.quadraticCurveTo(x, y + img.height, x, y + img.height - radius);
      //  // back to left top
      //  ctx.lineTo(x, y + radius);
      //  ctx.quadraticCurveTo(x, y, x + radius, y);
      // };

      img.set({
        angle: data.angle,
        left: data.x,
        top: data.y,
        lockUniScaling: true,
        name: data.name,
        delete_url: data.delete_url
      }).scale(data.scale).setShadow({
        color: 'rgba(0, 0, 0, 0.2)',
        blur: 10,
        offsetX: 0,
        offsetY: 0
      });

      fabricCanvas.add(img)
    };

    /*******************************
     * Functions
     *******************************/
    var initCanvas = function() {
      var canvasDomWidth = $('#canvas-wrapper').width();
      var canvasDomHeight = $('#canvas-wrapper').height();

      if (fabricCanvas == null) {
        fabricCanvas = new fabric.Canvas('canvas');
        fabricCanvas.on('object:modified', function(options) {
          // console.log('object was modified: ' + JSON.stringify(options.target));
          ajaxUpdateMedia(options.target);
        });
      }

      // take index [1] since fabric.js produces an extra canvas (buffer technique?)
      canvas = document.getElementsByTagName('canvas')[1];
      canvas.width = canvasDomWidth;
      canvas.height = canvasDomHeight;
      fabricCanvas.setWidth(canvasDomWidth);
      fabricCanvas.setHeight(canvasDomHeight);

      lastX = canvas.width / 2,
      lastY = canvas.height / 2;

      addCanvasEventListener(canvas);

      console.log('canvas initialized (w=' + canvasDomWidth + ', h=' + canvasDomHeight + ')');
    };

    var initFileUpload = function() {
      $('#fileupload').fileupload({
        dataType: 'json',
        dropZone: $('#dropzone'),
        done: function(e, data) {
          var name = data.result.files[0].name;
          console.log('file uploaded: ' + name);
          ajaxGetMedia(name);
        },
        progressall: function(e, data) {
          var progress = parseInt(data.loaded / data.total * 100, 10);
          $('#upload-progress .bar').css('width', progress + '%');
          $('#upload-progress .bar').text(progress + '%');
          if (progress == 100) {
            window.setTimeout(function() {
              $('#modal-upload').modal('hide');
            }, 300);
          }
        },
        start: function(e) {
          $('#modal-upload').modal({
            backdrop: 'static',
            keyboard: false
          });
        }
      });
    }

    var showCanvasBoundingRect = function(show) {
      fabricCanvas.on('after:render', show ? function() {
        fabricCanvas.contextContainer.strokeStyle = '#ff2800';
        var bound = calculateCanvasBound();
        if (bound) {
          fabricCanvas.contextContainer.strokeRect(
          bound.left + 0.5,
          bound.top + 0.5,
          bound.width,
          bound.height);
        }
      } : null);
    }

    /*socket.on('update media', function(data) {
      console.log('a client updated media', data);

      // var objects = fabricCanvas.getObjects();

      // for (var i in objects) {
      //   console.log('TEST', objects[i], data);
      //   if (data.name === objects[i].name) {
      //     objects[i].left += data.left;
      //     objects[i].top += data.top;
      //     objects[i].setCoords();
      //     console.log('YES');
      //   }
      // }

      // fabricCanvas.renderAll();
    })*/


    var translate = function(x, y) {
      var objects = fabricCanvas.getObjects();
      for (var i in objects) {
        var left = objects[i].left;
        var top = objects[i].top;

        var tempLeft = left + x;
        var tempTop = top + y;

        objects[i].left = tempLeft;
        objects[i].top = tempTop;

        objects[i].setCoords();
      }
      fabricCanvas.renderAll();
    };

    var zoomIn = function(originX, originY) {
      // canvasScale = canvasScale * scaleFactor;
      translate(-originX, -originY);
      var objects = fabricCanvas.getObjects();
      for (var i in objects) {
        var scaleX = objects[i].scaleX;
        var scaleY = objects[i].scaleY;
        var left = objects[i].left;
        var top = objects[i].top;

        var tempScaleX = scaleX * scaleFactor;
        var tempScaleY = scaleY * scaleFactor;
        var tempLeft = left * scaleFactor;
        var tempTop = top * scaleFactor;

        objects[i].scaleX = tempScaleX;
        objects[i].scaleY = tempScaleY;
        objects[i].left = tempLeft;
        objects[i].top = tempTop;

        objects[i].setCoords();
      }
      translate(originX, originY);
      fabricCanvas.renderAll();
    };

    function zoomOut(originX, originY) {
      // canvasScale = canvasScale / scaleFactor;
      translate(-originX, -originY);
      var objects = fabricCanvas.getObjects();
      for (var i in objects) {
        var scaleX = objects[i].scaleX;
        var scaleY = objects[i].scaleY;
        var left = objects[i].left;
        var top = objects[i].top;

        var tempScaleX = scaleX * (1 / scaleFactor);
        var tempScaleY = scaleY * (1 / scaleFactor);
        var tempLeft = left * (1 / scaleFactor);
        var tempTop = top * (1 / scaleFactor);

        objects[i].scaleX = tempScaleX;
        objects[i].scaleY = tempScaleY;
        objects[i].left = tempLeft;
        objects[i].top = tempTop;

        objects[i].setCoords();
      }
      translate(originX, originY);
      fabricCanvas.renderAll();
    };

    var scale = function(scale) {
      var vcx = fabricCanvas.getWidth() / 2;
      var vcy = fabricCanvas.getHeight() / 2;

      translate(-vcx, -vcy);
      var objects = fabricCanvas.getObjects();
      for (var i in objects) {
        var scaleX = objects[i].scaleX;
        var scaleY = objects[i].scaleY;
        var left = objects[i].left;
        var top = objects[i].top;

        var tempScaleX = scaleX * scale;
        var tempScaleY = scaleY * scale;
        var tempLeft = left * scale;
        var tempTop = top * scale;

        objects[i].scaleX = tempScaleX;
        objects[i].scaleY = tempScaleY;
        objects[i].left = tempLeft;
        objects[i].top = tempTop;

        objects[i].setCoords();
      }
      translate(vcx, vcy);
      fabricCanvas.renderAll();
    };

    var resetView = function() {
      var bound = calculateCanvasBound();

      var vw = fabricCanvas.getWidth();
      var vh = fabricCanvas.getHeight();
      var vr = vw / vh;

      var bw = bound.width;
      var bh = bound.height;
      var bx = bound.left;
      var by = bound.top;
      var br = bw / bh;

      // Translate to center
      var dx = vw / 2 - bx - bw / 2;
      var dy = vh / 2 - by - bh / 2;
      translate(dx, dy);

      // Scale to fit bounds
      var s = vr < br ? vw / bw : vh / bh;
      scale(s * 0.95);

      ajaxSaveCanvas();
    };

    var addCanvasEventListener = function(canvas) {
      canvas.addEventListener('mousedown', function(evt) {
        if (spacePressed) {
          document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
          lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
          lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
          dragStart = {
            x: lastX,
            y: lastY
          };
          dragged = false;
        }
      }, false);

      canvas.addEventListener('mousemove', function(evt) {
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        dragged = true;
        if (dragStart) {
          translate(lastX - dragStart.x, lastY - dragStart.y);
          dragStart = {
            x: lastX,
            y: lastY
          };

          // save current state
          ajaxSaveCanvas();
        }
      }, false);

      canvas.addEventListener('mouseup', function(evt) {
        dragStart = null;
      }, false);

      canvas.addEventListener('DOMMouseScroll', handleScroll, false);
      canvas.addEventListener('mousewheel', handleScroll, false);
    };

    var handleScroll = function(evt) {
      if (spacePressed) {
        var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        if (delta > 0) {
          zoomIn(lastX, lastY)
        } else {
          zoomOut(lastX, lastY);
        }

        // save current state
        ajaxSaveCanvas();

        return evt.preventDefault() && false;
      }
    };

    var setSelection = function(selection) {
      selectionEnabled = selection;
      fabricCanvas.selection = selection;
      var objects = fabricCanvas.getObjects();
      for (i in objects) {
        objects[i].hasControls = selection;
        objects[i].hasBorders = selection;
        objects[i].selection = selection;
      }
    };

    var calculateCanvasBound = function() {
      var xCoords = [];
      var yCoords = [];

      var objects = fabricCanvas.getObjects();
      for (i in objects) {
        var c = objects[i].oCoords;
        xCoords.push(c.tl.x);
        xCoords.push(c.tr.x);
        xCoords.push(c.br.x);
        xCoords.push(c.bl.x);
        yCoords.push(c.tl.y);
        yCoords.push(c.tr.y);
        yCoords.push(c.br.y);
        yCoords.push(c.bl.y);
      }

      var minX = fabric.util.array.min(xCoords);
      var maxX = fabric.util.array.max(xCoords);
      var width = Math.abs(minX - maxX);

      var minY = fabric.util.array.min(yCoords);
      var maxY = fabric.util.array.max(yCoords);
      var height = Math.abs(minY - maxY);

      return {
        left: minX,
        top: minY,
        width: width,
        height: height
      };
    };

    var showSplashScreen = function() {
      splashScreen.fadeIn();
    };

    var hideSplashScreen = function() {
      if (splashScreen) {
        setTimeout(function() { // simulate loading
          splashScreen.addClass('hide-start');
          setTimeout(function() {
            splashScreen.addClass('hide-end');
          }, 300); // animation time
        }, 1500);
      }
    };

    /*******************************
     * Events
     *******************************/
    $(window).on('resize', function() {
      console.log('canvas resized');
      initCanvas();
    });

    $(document).keyup(function(evt) {
      switch (evt.keyCode) {
        case 32:
          // SPACE
          spacePressed = false;
          dragStart = null;
          setSelection(true);
          break;
      }
    }).keydown(function(evt) {
      switch (evt.keyCode) {
        case 32:
          // SPACE
          spacePressed = true;
          setSelection(false);
          break;
        case 88:
          // 'x'
          if (fabricCanvas.getActiveGroup()) {
            fabricCanvas.getActiveGroup().forEachObject(function(obj) {
              ajaxDeleteMedia(obj);
            });
            fabricCanvas.discardActiveGroup().renderAll();
          } else {
            ajaxDeleteMedia(fabricCanvas.getActiveObject());
          }
          break;
      }
    });

    $('#btn-reset-view').click(function() {
      resetView();
      // showCanvasBoundingRect(true);
      // setSelection(true);
    });

    $(document).bind('dragover', function(e) {
      var timeout = window.dropZoneTimeout,
        dropZone = $('#dropzone');
      if (timeout) {
        clearTimeout(timeout);
      }
      window.dropZoneTimeout = setTimeout(function() {
        window.dropZoneTimeout = null;
        dropZone.hide();
      }, 100);
      dropZone.show();
    });

    /*******************************
     * Code
     *******************************/
    initCanvas();
    initFileUpload();
    ajaxGetMedia();
    // showCanvasBoundingRect(true);
  });
})
