var _ = require('./util');
var factory = require('./creature.js');
var display = require('./display.js');
var dom = require('./dom.js');

/**
 * Terrarium constructor function
 * @param {int} width             number of cells in the x-direction
 * @param {int} height            number of cells in the y-direction
 * @param {object} options
 *   @param {string} id             id assigned to the generated canvas
 *   @param {int} cellSize          pixel width of each cell (default 10)
 *   @param {string} insertAfter    id of the element to insert the canvas after
 *   @param {float} trails          a number from [0, 1] indicating whether trails should
 *                                    be drawn (0 = no trails, 1 = neverending trails)
 *                                    "background" option is required if trails is set
 *   @param {array} background      an RGB triplet for the canvas' background
 */
function Terrarium (width, height, options) {
  var cellSize, neighborhood;
  options = options || {};
  cellSize = options.cellSize || 10;
  neighborhood = options.neighborhood || options.neighbourhood;
  if (typeof neighborhood === 'string') neighborhood = neighborhood.toLowerCase();

  this.width = width;
  this.height = height;
  this.cellSize = cellSize;
  this.trails = options.trails;
  this.background = options.background;
  this.canvas = dom.createCanvasElement(width, height, cellSize, options.id, options.insertAfter, this.background);
  this.grid = [];
  this.nextFrame = false;
  this.hasChanged = false;
  this.getNeighborCoords = _.getNeighborCoordsFn(width, height, neighborhood === 'vonneumann', options.periodic);
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
  var grid = [], type = typeof content;
  for (var x = 0, _w = this.width; x < _w; x++) {
    grid.push([]);
    for (var y = 0, _h = this.height; y < _h; y++) {
      grid[x].push(factory.make(
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
      grid[x].push(factory.make(_.pickRandomWeighted(distribution)));
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
      var dead = copy && copy.isDead();
      if (dead && !self.hasChanged) self.hasChanged = true;
      copy.age++;

      return !dead ? copy : false;
    } else return false;
  }

  function copyAndRemove (origCols) {
    return _.map(origCols, copyAndRemoveInner);
  }

  // TODO: Switch coords to just x and y to be consistent w/ pickWinnerInner
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
        self.getNeighborCoords(x, y, creature.actionRadius),
        zipCoordsWithNeighbors
      );
      var result = creature.process(neighbors, x, y);
      if (typeof result === 'object') {
        var eigenColumn = eigenGrid[result.x];
        var returnedCreature = result.creature;
        var returnedY = result.y;

        if (!eigenColumn[returnedY]) eigenColumn[returnedY] = [];

        eigenColumn[returnedY].push({
          x: x,
          y: y,
          creature: returnedCreature
        });
        if (!self.hasChanged && result.observed) self.hasChanged = true;
      } else {
        if (result && !self.hasChanged) self.hasChanged = true;
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
      // TODO: so many calls to this. Can we just run it once at the start of a step?
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

  var self = this;
  var gridWidth = this.width;
  var gridHeight = this.height;
  var oldGrid = this.grid, newGrid, eigenGrid;

  if (typeof steps !== 'number') steps = 1;

  while (steps--) {
    this.hasChanged = false;

    oldGrid = newGrid ? _.clone(newGrid) : this.grid;

    // copy the old grid & remove dead creatures
    newGrid = _.map(oldGrid, copyAndRemove);

    // create an empty grid to hold creatures competing for the same square
    eigenGrid = this.makeGrid();

    // Add each creature's intended destination to the eigenGrid
    _.each(newGrid, processCreatures);

    // Choose a winner from each of the eigenGrid's superpositions
    _.each(eigenGrid, pickWinner);

    if (!this.hasChanged) return false;
  }

  return newGrid;
};

/**
 * Updates the canvas to reflect the current grid
 */
Terrarium.prototype.draw = function () {
  display(this.canvas, this.grid, this.cellSize, this.trails, this.background);
};

/**
 * Starts animating the simulation. Can be called with only a function.
 * @param  {int}   steps   the simulation will stop after <steps> steps if specified
 * @param  {Function} fn   called as a callback once the animation finishes
 */
Terrarium.prototype.animate = function (steps, fn) {
  function tick () {
    var grid = self.step();
    if (grid) {
      self.grid = grid;
      self.draw();
      if (++i !== steps) return self.nextFrame = requestAnimationFrame(tick);
    } // if grid hasn't changed || reached last step
    self.nextFrame = false;
    if (fn) fn();
  }

  if (typeof steps === 'function') {
    fn = steps;
    steps = null;
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

/**
 * Stops any currently running animation and cleans up the DOM
 */
Terrarium.prototype.destroy = function () {
  var canvas = this.canvas;
  this.stop();
  canvas.parentNode.removeChild(canvas);
};

module.exports = Terrarium;
