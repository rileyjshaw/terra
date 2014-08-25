var _ = require('./util.js');

module.exports = function (canvas, grid, cellSize) {
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  _.each(grid, function (column, x) {
    _.each(column, function (creature, y) {
      if (creature) {
        var color = creature.colorFn ?
          creature.colorFn() :
          creature.color + ',' + creature.energy / creature.maxEnergy;

        ctx.fillStyle = 'rgba(' + color + ')';

        if (creature.character) {
          ctx.fillText(creature.character, x * cellSize, y * cellSize + cellSize);
        } else {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    });
  });
};
