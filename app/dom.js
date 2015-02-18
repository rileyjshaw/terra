// Creates an HD canvas element on page and
// returns a reference to the element
var createCanvasElement = function (width, height, cellSize, id, insertAfter, background) {
  width *= cellSize;
  height *= cellSize;

  // Creates a scaled-up canvas based on the device's
  // resolution, then displays it properly using styles
  function createHDCanvas () {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    // Creates a dummy canvas to test device's pixel ratio
    var ratio = (function () {
      var ctx = document.createElement('canvas').getContext('2d');
      var dpr = window.devicePixelRatio || 1;
      var bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;
      return dpr / bsr;
    })();

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(ratio, ratio);
    ctx.font = 'bold ' + cellSize + 'px Arial';

    if (id) canvas.id = id;
    if (background) canvas.style.background = 'rgb(' + background + ')';

    return canvas;
  }

  var canvas = createHDCanvas();

  if (insertAfter) insertAfter.parentNode.insertBefore(canvas, insertAfter.nextSibling);
  else document.body.appendChild(canvas);

  return canvas;
};

module.exports = {
  createCanvasElement: createCanvasElement
};
