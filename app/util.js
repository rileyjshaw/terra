// Seed Math.random() with seedrandom
require('../bower_components/seedrandom/seedrandom.js')('terra :)', {global: true});

// an extended custom build of lodash, generated with:
// lodash exports=commonjs include=assign,clone,filter,each,map,random,reduce,some
var _ = require('../lodash_custom/lodash.custom.min.js')._;

/**
 * Takes a cell and returns the coordinates of its neighbors
 * @param  {int} x0     - x position of cell
 * @param  {int} y0     - y position of cell
 * @param  {int} xMax   - maximum x index i.e. grid width
 * @param  {int} yMax   - maximum x index i.e. grid height
 * @param  {int} radius - (default = 1) neighbor radius
 * @return {array}      - an array of [x, y] pairs of the neighboring cells
 */
_.getNeighborCoordsFn = function (xMax, yMax, vonNeumann, periodic) {
  if (periodic) {
    if (vonNeumann) {
      // periodic von neumann
      return function (x0, y0, radius) {
        var coords = [], x, rX, y, rY, rYMax;

        for (rX = -radius; rX <= radius; ++rX) {
          rYMax = radius - Math.abs(rX);
          for (rY = -rYMax; rY <= rYMax; ++rY) {
            x = ((rX + x0) % xMax + xMax) % xMax;
            y = ((rY + y0) % yMax + yMax) % yMax;
            if (x !== x0 || y !== y0) {
              coords.push({
                x: x,
                y: y
              });
            }
          }
        }

        return coords;
      };
    }
    else {
      // periodic moore
      return function (x0, y0, radius) {
        var coords = [], x, xLo, xHi, y, yLo, yHi;

        xLo = x0 - radius;
        yLo = y0 - radius;
        xHi = x0 + radius;
        yHi = y0 + radius;

        for (x = xLo; x <= xHi; ++x) {
          for (y = yLo; y <= yHi; ++y) {
            if (x !== x0 || y !== y0) {
              coords.push({
                x: (x % xMax + xMax) % xMax,
                y: (y % yMax + yMax) % yMax
              });
            }
          }
        }

        return coords;
      };
    }
  } else {
    // non-periodic, need to restrict to within [0, max)
    xMax -= 1;
    yMax -= 1;

    if (vonNeumann) {
      //non-periodic von-neumann
      return function (x0, y0, radius) {
        var coords = [], x, rX, y, rY, rYMax;

        for (rX = -radius; rX <= radius; ++rX) {
          rYMax = radius - Math.abs(rX);
          for (rY = -rYMax; rY <= rYMax; ++rY) {
            x = rX + x0;
            y = rY + y0;
            if (x >= 0 && y >=0 && x <= xMax && y <= yMax && (x !== x0 || y !== y0)) {
              coords.push({
                x: x,
                y: y
              });
            }
          }
        }

        return coords;
      };
    }
    else {
      // non-periodic moore
      return function (x0, y0, radius) {
        var coords = [], x, xLo, xHi, y, yLo, yHi;

        xLo = Math.max(0, x0 - radius);
        yLo = Math.max(0, y0 - radius);
        xHi = Math.min(x0 + radius, xMax);
        yHi = Math.min(y0 + radius, yMax);

        for (x = xLo; x <= xHi; ++x)
          for (y = yLo; y <= yHi; ++y)
            if (x !== x0 || y !== y0)
              coords.push({ x: x, y: y });

        return coords;
      };
    }
  }
};

_.pickRandomWeighted = function (weightedArrays) {
  var sum = 0, rand = _.random(100, true);
  var cur, i;
  for (i = 0, _len = weightedArrays.length; i < _len; i++) {
    cur = weightedArrays[i];
    sum += cur[1];
    if (sum > rand) return cur[0];
  } return false;
};

/**
 * CommonJS exports
 * @type {Object}
 */
module.exports = _;
