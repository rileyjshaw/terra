// Creates an HD canvas element on page and
// returns a reference to the element
var createCanvasElement = function (width, height, id, insertAfter, supress) {
  // Creates a scaled-up canvas based on the device's
  // resolution, then displays it properly using styles
  function createHDCanvas (ratio) {
    var canvas = document.createElement('canvas');

    // Creates a dummy canvas to test device's pixel ratio
    ratio = (function () {
      var context = document.createElement('canvas').getContext('2d');
      var dpr = window.devicePixelRatio || 1;
      var bsr = context.webkitBackingStorePixelRatio ||
                context.mozBackingStorePixelRatio ||
                context.msBackingStorePixelRatio ||
                context.oBackingStorePixelRatio ||
                context.backingStorePixelRatio || 1;
      return dpr / bsr;
    })();

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
    if (id) canvas.id = id;

    return canvas;
  }

  var canvas = createHDCanvas();
  if(!supress){
    if (insertAfter) insertAfter.parentNode.insertBefore(canvas, insertAfter.nextSibling);
    else document.body.appendChild(canvas);
  }


  return canvas;
};

module.exports = {
  createCanvasElement: createCanvasElement
};
