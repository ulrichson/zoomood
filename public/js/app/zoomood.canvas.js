define([
    'jquery',
    'socketio',
    'fabric',
    'moment',
    'jquery.fileupload',
    'jquery.ui.widget',
    'bootstrap'
], function($, io, fabric, moment) {
//  var fabricCanvas,
//      socket = io.connect('http://localhost');
//    ], function($, fabric) {

  $(function() {

    /*******************************
     * Variables
     *******************************/
    var canvas;
    var fabricCanvas;

    var lastX, lastY;
    var dragStart, dragged;

    var scaleFactor = 1.1;
    var spacePressed = false;
    var selectionEnabled = true;
    var canvasObjectsIndex = new Array();

    var splashScreen = $('.splash-screen');
    var drawnPathObjects = new Array();

    /*******************************
     * Socket.io handles
     *******************************/
    var socket = io();
    socket.on('media uploaded', function(data) {
      console.log('media was uploaded');
      var animate = data.type && data.type == 'whiteboard' ? false : true;
      ajaxGetMedia(data.name, animate);
    });

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

      var arr = [];
      var isGroup = false;
      if (media._objects) {
        arr = media._objects; 
        isGroup = true;
      } else {
        arr.push(media);
      }

      // save data
      for (var i = 0; i < arr.length; i++) {
        var name = arr[i].name;
        var obj = fabricCanvas.toJSON().objects[canvasObjectsIndex[name]];
        if (obj != null) {
          $.ajax({
            url: '/media/' + name,
            type: 'PUT',
            accepts: {
              json: 'application/json'
            },
            contentType: 'application/json',
            data: JSON.stringify({
              scale: obj.scaleX,
              angle: obj.angle,
              x: obj.left,
              y: obj.top
            }),
            beforeSend: function(xhr) {
              // WORKAROUND. For any reason the 'accepts' fields isn't applied
              xhr.setRequestHeader('Accept', 'application/json');
            },
            success: function(data, textStatus, jqXHR) {
              console.log('media updated: ' + name);
            }
          });
        }
      }
    };

    var ajaxDeleteMedia = function(media) {
      $.ajax({
        url: '/media/' + media.name,
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

    var ajaxGetMedia = function(name, animate) {
      animate = animate || false;
      name = name || '';

      $.getJSON('/media/' + name, function(data) {
        if (data.length) {
          $.each(data, function(key, value) {
            console.log('media loaded: ' + value.name);
            fabric.Image.fromURL(value.url, function(img) {
              addZoomoodImage(img, value, animate);
              if (key == data.length - 1) {
                hideSplashScreen();
              }
            });
          });
        } else {
          if (!$.isEmptyObject(data)) {
            console.log('media loaded: ' + data.name);
            fabric.Image.fromURL(data.url, function(img) {
              addZoomoodImage(img, data, animate);
            });
          } else {
            hideSplashScreen();
          }
        }
      });
    };

    var addZoomoodImage = function(img, data, animate) {
      animate = typeof animate !== 'undefined' ? animate : false;

      var animateFromY = canvas.height + 400;
      var animateToY = data.y;

      img.set({
        angle: data.angle,
        left: data.x,
        top: animate ? animateFromY : data.y,
        lockUniScaling: true,
        name: data.name,
        centeredRotation: true
      }).scale(data.scale);/*.setShadow({
        color: 'rgba(0, 0, 0, 0.2)',
        blur: 10,
        offsetX: 0,
        offsetY: 0
      });*/

      fabricCanvas.add(img);

      if (animate) {
        // Animate appearance
        img.animate('top', animateToY, {
          duration: 700,
          onChange: fabricCanvas.renderAll.bind(fabricCanvas),
          easing: fabric.util.ease.easeOutBounce
        });
      }
    };

    /*******************************
     * Functions
     *******************************/
    var initCanvas = function() {
      var canvasDomWidth = $('#canvas-wrapper').width();
      var canvasDomHeight = $('#canvas-wrapper').height();

      if (fabricCanvas == null) {
        fabricCanvas = new fabric.Canvas('canvas');

        // extend fabricjs with show/hide functionality
        // see https://groups.google.com/d/msg/fabricjs/cbdFgTH7UXc/jj6iVoNYmVUJ
        fabric.Object.prototype.hide = function() {
          this.set({
            opacity: 0,
            selectable: false
          });
        };

        fabric.Object.prototype.show = function() {
          this.set({
            opacity: 1,
            selectable: true
          });
        };

        fabricCanvas.on('object:modified', function(options) {
          ajaxUpdateMedia(options.target);
        });

        fabricCanvas.on('object:added', function(obj) {
          // add last added  to index
          canvasObjectsIndex[obj.target.name] = fabricCanvas.toJSON().objects.length - 1;
        });

        fabricCanvas.on('object:removed', function(obj) {;
          delete canvasObjectsIndex[obj.target.name]
        });

        fabricCanvas.on('path:created', function(obj) {
          if (fabricCanvas.isDrawingMode) {
            console.log("free-drawing path created");

            // save path in array to merge when drawing finished
            drawnPathObjects.push(obj.path);

            fabricCanvas.renderAll();
          }
        });

        fabricCanvas.on('after:render', function() {
          // draw bounding box for free-drawn objects
          if (fabricCanvas.isDrawingMode) {
            drawFreeDrawingBoundingBox();
          }
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

      console.log('canvas initialized (w: ' + canvasDomWidth + 'px, h: ' + canvasDomHeight + 'px)');
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
        var bound = calculateBounds();
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
      fabricCanvas.deactivateAllWithDispatch();
      var bound = calculateBounds();

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

    var calculateBounds = function(objects) {
      objects = objects || fabricCanvas.getObjects();

      var xCoords = [];
      var yCoords = [];

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

    var drawFreeDrawingBoundingBox = function(strokeStyle, padding) {
      padding = padding || 20;
      strokeStyle = strokeStyle || 'rgba(0, 180, 190, 0.3)';
      fabricCanvas.contextContainer.strokeStyle = strokeStyle;
      var bound = calculateBounds(drawnPathObjects);
      fabricCanvas.contextContainer.strokeRect(
        bound.left - padding,
        bound.top - padding,
        bound.width + 2 * padding,
        bound.height + 2 * padding
      );
    };

    var populateSession = function() {
      $.get('/session', function(data, status) {
        $('#dropdown-session>li.session').remove();
        $.each(data, function(index, session) {
          $('#dropdown-session').append('<li class="session"><a href="#" data-id=' + session._id + '><strong>' + session.name + '</strong><br><small>' + moment(session.created).fromNow() + '</small></a></li>');
        });
      });
    }

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
      var deleteMedia = function() {
        if (fabricCanvas.getActiveGroup()) {
          fabricCanvas.getActiveGroup().forEachObject(function(obj) {
            ajaxDeleteMedia(obj);
          });
          fabricCanvas.discardActiveGroup().renderAll();
        } else {
          ajaxDeleteMedia(fabricCanvas.getActiveObject());
        }
      };
      switch (evt.keyCode) {
        case 32: // SPACE
          spacePressed = true;
          setSelection(false);
          break;
        case 88: // 'x'
          deleteMedia();
          break;
        case 8: // BACKSPACE
          deleteMedia();
          break;

        case 46: // DELETE
          deleteMedia();
          break;
      }
    });

    $('#btn-create-session').click(function() {
      $.post('/session', function(data, status) {
        populateSession();
      });
    });

    $('#btn-reset-view').click(function() {
      resetView();
      // showCanvasBoundingRect(true);
      // setSelection(true);
    });

    $('#btn-undo-draw').click(function() {
      if (fabricCanvas.isDrawingMode) {
        // remove last added path
        fabricCanvas.remove(drawnPathObjects[drawnPathObjects.length - 1]);
        drawnPathObjects.pop();

        fabricCanvas.renderAll();
      }
    });

    $('#btn-switch-draw-mode').click(function() {
      var btn = $('#btn-switch-draw-mode');
      var isDrawingMode = false;
      btn.toggleClass('active');
      fabricCanvas.isDrawingMode = isDrawingMode = btn.hasClass('active');

      if (isDrawingMode) {
        $('#btn-switch-draw-mode>span').text('Save drawing');
        $('#btn-undo-draw').removeClass('hide');
      } else {
        $('#btn-switch-draw-mode>span').text('Start drawing');
        $('#btn-undo-draw').addClass('hide');
      }
      
      // save when drawing is finished
      if (!isDrawingMode && drawnPathObjects.length > 0) {
        var objects = fabricCanvas.getObjects();
        var objectsToGroup = new Array();

        // clone path as images and create group
        for (i in drawnPathObjects) {
          objectsToGroup.push(drawnPathObjects[i].cloneAsImage());
        }

        // group new image objects
        var group = new fabric.Group(objectsToGroup);
        fabricCanvas.add(group);

        console.log('free-drawing with ' + objectsToGroup.length + ' paths merged');

        // hide all existing images to avoid that overlapping areas will be saved as image
        for (i in objects) {
          if (objects[i].type == 'image') {
            objects[i].hide();
          } 
        }

        group.cloneAsImage(function (img) {

          // fabricCanvas.contextContainer.fillStyle = "rgb(255,255,255)";
          // fabricCanvas.contextContainer.fillRect(group.left, group.top, group.width, group.height);
          
          var density = 2.0;
          var base64_image = fabricCanvas.toDataURL({
            format: 'png',
            // quality: 1,
            multiplier: density,
            left: group.left,
            top: group.top,
            width: group.width, 
            height: group.height
          });

          // save on server
          $.post('/media', {
            image_base64: base64_image.substr(base64_image.indexOf(';base64,') + ';base64,'.length),
            scale: 1.0 / density,
            angle: 0.0,
            x: group.left,
            y: group.top,
            type: 'whiteboard'
          },
          function(data, status) {
            // clean canvas
            fabricCanvas.remove(group);
            for (i in drawnPathObjects) {
              fabricCanvas.remove(drawnPathObjects[i]);
            }
            drawnPathObjects = new Array();

            // show all objects
            for (var i = 0; i < fabricCanvas.getObjects().length; i++) {
              fabricCanvas.item(i).show();
            }
          }); 
        });
      }
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
    // initFileUpload();
    ajaxGetMedia();
    // showCanvasBoundingRect(true);
    populateSession();
  });
})
