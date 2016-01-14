var Terrarium = require('./terrarium.js');
var factory = require('./creature.js');

module.exports = {
  Terrarium: Terrarium,
  make: factory.make,
  registerCreature: factory.registerCreature,
  registerCA: factory.registerCA
};
