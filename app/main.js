var Terrarium = require('./terrarium.js');
var factory = require('./creature.js');

module.exports = {
  Terrarium: Terrarium,
  registerCreature: factory.registerCreature,
  registerCA: factory.registerCA
};
