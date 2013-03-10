var zoom = 1.0;

// Variables for drawing frames
var x0, x1, y0, y1;
var isDrawingFrame = false;
var currentFrame = null;

// overlap() from http://jsfiddle.net/98sAG/
var overlaps = (function() {
    function getPositions(elem) {
        var pos, width, height;
        pos = $(elem).position();
        width = $(elem).width();
        height = $(elem).height();
        return [[pos.left, pos.left + width], [pos.top, pos.top + height]];
    }

    function comparePositions(p1, p2) {
        var r1, r2;
        r1 = p1[0] < p2[0] ? p1 : p2;
        r2 = p1[0] < p2[0] ? p2 : p1;
        return r1[1] > r2[0] || r1[0] === r2[0];
    }

    return function(a, b) {
        var pos1 = getPositions(a),
            pos2 = getPositions(b);
        return comparePositions(pos1[0], pos2[0]) && comparePositions(pos1[1], pos2[1]);
    };
})();

/***************************
 * AJAX calls
 ***************************/
ajaxUpdateMediaContainer = function(container) {
    $.ajax({
        // accepts: 'application/json',
        url: '/media/' + container.data('name'),
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({
            scale: container.data('scale'),
            x: container.data('x'),
            y: container.data('y')
        })
    });
}

/***************************
 * jQuery UI zoom fixes
 ***************************/
draggableStartFix = function(evt, ui) {
    ui.position.left = 0;
    ui.position.top = 0;
};

draggableDragFix = function(evt, ui) {
    // console.log("matrix="+matrix);
    var changeLeft = ui.position.left - ui.originalPosition.left; // find change in left
    var newLeft = ui.originalPosition.left + changeLeft / ((zoom)); // adjust new left by our zoom

    var changeTop = ui.position.top - ui.originalPosition.top; // find change in top
    var newTop = ui.originalPosition.top + changeTop / zoom; // adjust new top by our zoom

    ui.position.left = newLeft;
    ui.position.top = newTop;
};

resizableResizeFix = function(event, ui) {
    var changeWidth = ui.size.width - ui.originalSize.width; // find change in width
    var newWidth = ui.originalSize.width + changeWidth / zoom; // adjust new width by our zoom

    var changeHeight = ui.size.height - ui.originalSize.height; // find change in height
    var newHeight = ui.originalSize.height + changeHeight / zoom; // adjust new height by our zoom

    ui.size.width = newWidth;
    ui.size.height = newHeight;
}

/***************************
 * Helper
 ***************************/
calculateCssCoordinates = function(x0, y0, x1, y1) {
    return {
        left: x0 > x1 ? x1 : x0,
        top: y0 > y1 ? y1 : y0,
        width: x0 > x1 ? x0 - x1 : x1 - x0,
        height: y0 > y1 ? y0 - y1 : y1 - y0
    }
};

matrixToArray = function(matrix) {
    return matrix.substr(7, matrix.length - 8).split(', ');
};

updateFrame = function(frame, coords) {
    frame.data({
        x: coords.left,
        y: coords.top,
        width: coords.width,
        height: coords.height
    }).css({
        left: coords.left,
        top: coords.top,
        width: coords.width,
        height: coords.height,
        position: "absolute"
    });
};

/***************************
 * Media handling
 ***************************/
addMediaContainer = function(url, name, x, y, scale) {
    var container = $('<div class="mediaContainer" data-name="' + name + '" data-scale="' + scale + '" data-x="' + x + '" data-y="' + y + '"><img class="img-rounded" src="' + url + '" alt="' + name + '" /></div>').appendTo("#canvas");
    $(container).children('img:first').load(function() {
        initMediaContainer(container);
    });
    return container;
}

zoomHandler = function() {
    $(this).addClass("focused");
    $(this).zoomTo({
        animationendcallback: function() {
            // Update zoom factor
            zoom = matrixToArray($("#canvas").css("-webkit-transform"))[0];
            console.log("new zoom is " + zoom);
            $(this).removeClass("focused");
        },
        root: $("#canvas")
    });
};

initMediaContainer = function(container) {
    var origWidth = $(container).children("img:first").width();
    var origHeight = $(container).children("img:first").height();
    var aspectRatio = origWidth / origHeight;

    var scale = container.data("scale");
    var x = container.data("x");
    var y = container.data("y");

    if (origWidth != NaN && origHeight != NaN) {
        container.width(origWidth * scale);
        container.height(origHeight * scale);
    }

    // Set position
    container.css({
        left: x,
        top: y
    });

    // fix for draggable & resizable when scaled: http://gungfoo.wordpress.com/2013/02/15/jquery-ui-resizabledraggable-with-transform-scale-set/
    // Set behavior
    container.draggable({
        distance: 20,
        opacity: 0.2,
        drag: draggableDragFix,
        start: draggableStartFix,
        stop: function() {
            $(this).data("x", parseInt(container.css("left")));
            $(this).data("y", parseInt(container.css("top")));
            var element = $(this);
            ajaxUpdateMediaContainer(element);

            // Check to which frames it belongs
            // $(".frame").each(function(key, value) {
            //   if (overlaps(value, element)) {
            //     console.log("image overlaps with a frame");
            //     console.log("image:\tl=" + $(element).position().left + "\tt=" + $(element).position().top + "\tw=" + $(element).width() + "\th=" + $(element).height());
            //     console.log("frame:\tl=" + $(value).position().left + "\tt=" + $(value).position().top + "\tw=" + $(value).width() + "\th=" + $(value).height());
            //     // Move element in DOM
            //     element.prependTo(value);

            //     var newX = $(element).position().left - $(value).position().left;
            //     var newY = $(element).position().top - $(value).position().top
            //     // Recalculate position
            //     element.css({
            //       left: newX,
            //       top: newY
            //     }).data({
            //       x: newX,
            //       y: newY
            //     });
            //   }
            // });
        }
    }).resizable({
        aspectRatio: aspectRatio,
        maxWidth: origWidth,
        maxHeight: origHeight,
        minWidth: origWidth * 0.05,
        minHeight: origHeight * 0.05,
        resize: resizableResizeFix,
        start: function() {},
        stop: function(event, ui) {
            $(this).data("scale", ui.size.width / origWidth);
            ajaxUpdateMediaContainer($(this));
        }
    });

    container.dblclick(zoomHandler);
};

$(function() {
    $(".mediaContainer img").load(function() {
        initMediaContainer($(this).parent());
    });

    // Events
    $("#btn-add-image").click(function() {
        var canvasWidth = $("#canvas").width();
        var canvasHeight = $("#canvas").height();
        var scale = Math.random() * 0.5 + 0.05;
        var x = Math.random() * 1024 - 1024 * scale;
        var y = Math.random() * 768 - 768 * scale;

        if (x < 0) x = 0;
        if (y < 0) y = 0;

        addMediaContainer('img/test-pattern.jpg', 'Test pattern', x, y, scale);
    });

    $("#btn-add-frames").click(function() {
        if (!$(this).hasClass('active')) {
            console.log("enter add frames mode");
            $("#canvas").mousedown(function(e) {
                e.preventDefault();
                isDrawingFrame = true;
                x0 = e.pageX - $(this).offset().left;
                y0 = e.pageY - $(this).offset().top;
            });

            $("#canvas").mousemove(function(e) {
                if (isDrawingFrame) {
                    x1 = e.pageX - $(this).offset().left;
                    y1 = e.pageY - $(this).offset().top;
                    coords = calculateCssCoordinates(x0, y0, x1, y1);
                    if (currentFrame == null) currentFrame = $("<div/>").addClass("frame").prependTo($("#canvas"));
                    updateFrame(currentFrame, coords);
                }
            });

            $("#canvas").mouseup(function(e) {
                if (isDrawingFrame) {
                    e.preventDefault();
                    currentFrame.dblclick(zoomHandler);
                    currentFrame.draggable({
                        drag: draggableDragFix,
                        start: draggableStartFix,
                        stop: function() {
                            $(this).data({
                                x: $(this).css("left"),
                                y: $(this).css("top")
                            });
                        }
                    }).resizable({
                        resize: resizableResizeFix,
                        stop: function() {
                            $(this).data({
                                width: $(this).width(),
                                height: $(this).height()
                            });
                        }
                    });
                    currentFrame = null;
                    isDrawingFrame = false;
                }
            });
        } else {
            console.log("exit add frames mode");
            $("#canvas").unbind("mousedown");
            $("#canvas").unbind("mousemove");
            $("#canvas").unbind("mouseup");
        }
    });

    $("#btn-reset-view").click(function() {
        zoom = 1.0;
        // $("#canvas").removeAttr('style');
        $("#canvas").animate({
            transform: "scale(1.0) translate(0)"
        });
    });
});