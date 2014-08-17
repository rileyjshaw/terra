// Seed Math.random() with seedrandom
require('../bower_components/seedrandom/seedrandom.js')('terra', {global: true});

// an extended custom build of lodash, generated with:
// lodash exports=commonjs include=assign,clone,filter,each,map,random,reduce,some
var _ = require('../lodash_custom/lodash.custom.min.js')._;

/**
 * Takes a cell and returns the coordinates of its neighbors
 * @param  {int} x0     - x position of cell
 * @param  {int} y0     - y position of cell
 * @param  {int} xMax   - maximum x index i.e. grid width - 1
 * @param  {int} yMax   - maximum x index i.e. grid height - 1
 * @param  {int} radius - (default = 1) neighbor radius
 * @return {array}      - an array of [x, y] pairs of the neighboring cells
 */
_.getNeighborCoords = function (x0, y0, xMax, yMax, radius) {
  var coords = [], current, xLo, xHi, yLo, yHi;
  if (typeof radius !== 'number' || radius < 1) radius = 1;

  xLo = Math.max(0, x0 - radius);
  yLo = Math.max(0, y0 - radius);
  xHi = Math.min(x0 + radius, xMax);
  yHi = Math.min(y0 + radius, yMax);

  for (var x = xLo; x <= xHi; x++)
    for (var y = yLo; y <= yHi; y++)
      if (x !== x0 || y !== y0)
        coords.push({ x: x, y: y });

  return coords;
};

/**
 * CommonJS exports
 * @type {Object}
 */
module.exports = _;
