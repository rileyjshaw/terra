var _ = require('./util');
var creatureFactory = require('./creature.js');
var display = require('./display.js');
var dom = require('./dom.js');

/**
 * Terrarium constructor function
 * @param {int} width             number of cells in the x-direction
 * @param {int} height            number of cells in the y-direction
 * @param {string} id             id assigned to the generated canvas
 * @param {int} cellSize          pixel width of each cell (default 10)
 * @param {string} insertAfter    id of the element to insert the canvas after
 */
function Terrarium(width, height, id, cellSize, insertAfter) {
  cellSize = cellSize || 10;
  this.cellSize = cellSize;
  this.width = width;
  this.height = height;
  this.grid = [];
  this.canvas = dom.createCanvasElement(width, height, cellSize, id, insertAfter);
  this.nextFrame = false;
}

/**
 * Create a grid and fill it by using a function, 2-d array, or uniform type
 * @param  {*} content  if  function, fill grid according to fn(x, y)
 *                        if array, fill grid cells with the corresponding creatureType
 *                        if string, fill grid with that creatureType
 *                        otherwise, create empty grid
 * @return {grid}       a grid adhering to the above rules
 */
Terrarium.prototype.makeGrid = function (content) {
  var grid = [], type = typeof content, creature;
  for (var x = 0, _w = this.width; x < _w; x++) {
    grid.push([]);
    for (var y = 0, _h = this.height; y < _h; y++) {
      grid[x].push(creatureFactory.make(
        type === 'function' ? content(x, y) :
        type === 'object' && content.length ? (content[y] || [])[x] :
        type === 'string' ? content :
        undefined
      ));
    }
  } return grid;
};

/**
 * Create a grid and fill it randomly with a set creature distribution
 * @param  {array} distribution   an array of arrays of the form [string 'creatureName', float fillPercent]
 */
Terrarium.prototype.makeGridWithDistribution = function (distribution) {
  var current, rand = 0, grid = [];
  for (var x = 0, _w = this.width; x < _w; x++) {
    grid.push([]);
    for (var y = 0, _h = this.height; y < _h; y++) {
      grid[x].push(creatureFactory.make(_.pickRandomWeighted(distribution)));
    }
  } return grid;
};

/**
 * Returns the next step of the simulation
 * @param  {} steps   the number of steps to run through before returning
 * @return {grid}     a new grid after <steps> || 1 steps
 */
Terrarium.prototype.step = function (steps) {
  function copyAndRemoveInner (origCreature) {
    if (origCreature) {
      var copy = _.assign(new (origCreature.constructor)(), origCreature);
      return copy && !copy.isDead() ? copy : false;
    } else return false;
  }

  function copyAndRemove (origCols) {
    return _.map(origCols, copyAndRemoveInner);
  }

  function zipCoordsWithNeighbors (coords) {
    return {
      coords: coords,
      creature: oldGrid[coords.x][coords.y]
    };
  }

  function processLoser (loser) {
    var loserCreature = loser.creature;
    if (loserCreature) {
      loserCreature.failureFn();
      loserCreature.boundEnergy();
    } else {
      loser.wait();
      loser.boundEnergy();
    }
  }

  function processCreaturesInner (creature, x, y) {
    if (creature) {
      var neighbors = _.map(
        _.getNeighborCoords(x, y, gridWidth - 1, gridHeight - 1, creature.actionRadius),
        zipCoordsWithNeighbors
      );
      var result = creature.queue(neighbors);
      if (result) {
        var eigenColumn = eigenGrid[result.x];
        if (!eigenColumn[result.y]) eigenColumn[result.y] = [];

        eigenColumn[result.y].push({
          x: x,
          y: y,
          creature: result.creature
        });
      } else {
        processLoser(creature);
      }
    }
  }

  function processCreatures (column, x) {
    _.each(column, function (creature, y) { processCreaturesInner(creature, x, y); });
  }

  function pickWinnerInner (superposition, x, y) {
    if (superposition) {
      var winner = superposition.splice(_.random(superposition.length - 1), 1)[0];
      var winnerCreature = winner.creature;

      // clear the original creature's square if successFn returns false
      if (!winnerCreature.successFn()) {
        newGrid[winner.x][winner.y] = false;
      }

      winnerCreature.boundEnergy();

      // put the winner in its rightful place
      newGrid[x][y] = winnerCreature;

      // ...and call wait() on the losers. We can do this without
      // affecting temporal consistency because all callbacks have
      // already been created with prior conditions
      _.each(superposition, processLoser);
    }
  }

  function pickWinner (column, x) {
    _.each(column, function (superposition, y) { pickWinnerInner(superposition, x, y); });
  }

  var gridWidth = this.width;
  var gridHeight = this.height;
  var oldGrid = this.grid, newGrid, eigenGrid;

  if (typeof steps !== 'number') steps = 1;

  while (steps--) {
    oldGrid = newGrid ? _.clone(newGrid) : this.grid;

    // copy the old grid & remove dead creatures
    newGrid = _.map(oldGrid, copyAndRemove);

    // create an empty grid to hold creatures competing for the same square
    eigenGrid = this.makeGrid();

    // Add each creature's intended destination to the eigenGrid
    _.each(newGrid, processCreatures);

    // Choose a winner from each of the eigenGrid's superpositions
    _.each(eigenGrid, pickWinner);
  }

  return newGrid;
};

/**
 * Updates the canvas to reflect the current grid
 */
Terrarium.prototype.draw = function () {
  display(this.canvas, this.grid, this.cellSize);
};

/**
 * Starts animating the simulation
 * @param  {int}   steps   the simulation will stop after <steps> steps if specified
 * @param  {Function} fn   called as a callback once the animation finishes
 */
Terrarium.prototype.animate = function (steps, fn) {
  function tick () {
    self.grid = self.step();
    self.draw();
    if (i++ !== steps) self.nextFrame = requestAnimationFrame(tick);
    else {
      self.nextFrame = false;
      fn();
    }
  }

  if (!this.nextFrame) {
    var i = 0;
    var self = this;
    self.nextFrame = requestAnimationFrame(tick);
  }
};

/**
 * Stops a currently running animation
 */
Terrarium.prototype.stop = function () {
  cancelAnimationFrame(this.nextFrame);
  this.nextFrame = false;
};

module.exports = Terrarium;
