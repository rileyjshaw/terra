var _ = require('./util.js');

// abstract factory that adds a superclass of baseCreature
var factory = (function () {
  function baseCreature() {
    this.age = 0;
  }
  function baseCA() {
    this.age = 0;
  }

  baseCreature.prototype.initialEnergy = 50;
  baseCreature.prototype.maxEnergy = 100;
  baseCreature.prototype.efficiency = 0.7;
  baseCreature.prototype.size = 50;
  baseCreature.prototype.actionRadius = 1;
  baseCreature.prototype.sustainability = 2;
  // used as percentages of maxEnergy
  baseCreature.prototype.reproduceLv = 0.70;
  baseCreature.prototype.moveLv = 0;

  baseCreature.prototype.boundEnergy = function() {
    if (this.energy > this.maxEnergy)
      this.energy = this.maxEnergy;
  };

  baseCreature.prototype.isDead = function() {
    return this.energy <= 0;
  };

  baseCreature.prototype.reproduce = function (neighbors) {
    var spots = _.filter(neighbors, function (spot) {
      return !spot.creature;
    });

    if (spots.length) {
      var step = spots[_.random(spots.length - 1)];
      var coords = step.coords;
      var creature = factory.make(this.type);

      var successFn = (function () {
        this.energy -= this.initialEnergy;
        return true;
      }).bind(this);
      var failureFn = this.wait;

      return {
        x: coords.x,
        y: coords.y,
        creature: creature,
        successFn: successFn,
        failureFn: failureFn
      };
    } else return false;
  };

  baseCreature.prototype.move = function (neighbors) {
    var creature = this;

    // first, look for creatures to eat
    var spots = _.filter(neighbors, (function (spot) {
      return spot.creature.size < this.size;
    }).bind(this));

    // if there's not enough food, try to move
    if (spots.length < this.sustainability) {
      spots = _.filter(neighbors, function (spot) {
        return !spot.creature;
      });
    }

    // if we've got a spot to move to...
    if (spots.length) {
      // ...pick one
      var step = spots[_.random(spots.length - 1)];

      var coords = step.coords;

      var successFn = (function () {
        var foodEnergy = step.creature.energy * this.efficiency;
        // add foodEnergy if eating, subtract 10 if moving
        this.energy = this.energy + (foodEnergy || -10);
        // clear the original location
        return false;
      }).bind(this);

      return {
        x: coords.x,
        y: coords.y,
        creature: creature,
        successFn: successFn
      };
    } else return false;
  };

  baseCreature.prototype.wait = function () {
    this.energy -= 5;
    return true;
  };

  baseCreature.prototype.process = function (neighbors, x, y) {
    var step = {};
    var maxEnergy = this.maxEnergy;

    if (this.energy > maxEnergy * this.reproduceLv && this.reproduce) {
      step = this.reproduce(neighbors);
    } else if (this.energy > maxEnergy * this.moveLv && this.move) {
      step = this.move(neighbors);
    }

    var creature = step.creature;

    if (creature) {
      creature.successFn = step.successFn || creature.wait;
      creature.failureFn = step.failureFn || creature.wait;

      return {
        x: step.x,
        y: step.y,
        creature: creature
      };
    } else return false;
  };

  baseCA.prototype.boundEnergy = function () {};
  baseCA.prototype.isDead = function () { return false; };
  baseCA.prototype.process = function (neighbors, x, y) {};
  baseCA.prototype.wait = function () {};

  // Storage for our creature types
  var types = {};

  return {
    make: function (type, options) {
      var Creature = types[type];
      return (Creature ? new Creature(options) : false);
    },

    registerCreature: function (options, init) {
      // required attributes
      var type = options.type;
      // only register classes that fulfill the creature contract
      if (typeof type === 'string' && typeof types[type] === 'undefined') {
        // set the constructor, including init if it's defined
        if (typeof init === 'function') {
          types[type] = function () {
            this.energy = this.initialEnergy;
            init.call(this);
          };
        } else {
          types[type] = function () {
            this.energy = this.initialEnergy;
          };
        }

        var color = options.color;
        // set the color randomly if none is provided
        if (typeof color !== 'object' || color.length !== 3) {
          options.color = [_.random(255), _.random(255), _.random(255)];
        }

        types[type].prototype = new baseCreature();
        types[type].prototype.constructor = types[type];

        _.each(options, function(value, key) {
          types[type].prototype[key] = value;
        });

        types[type].prototype.successFn = types[type].wait;
        types[type].prototype.failureFn = types[type].wait;
        types[type].prototype.energy = options.initialEnergy;

        return true;
      } else return false;
    },

    registerCA: function (options, init) {
      // required attributes
      var type = options.type;
      // only register classes that fulfill the creature contract
      if (typeof type === 'string' && typeof types[type] === 'undefined') {
        // set the constructor, including init if it's defined
        types[type] = typeof init === 'function' ?
           function () { init.call(this); } :
           function () {};

        var color = options.color;
        // set the color randomly if none is provided
        if (typeof color !== 'object' || color.length !== 3) {
          options.color = [_.random(255), _.random(255), _.random(255)];
        }

        types[type].prototype = new baseCA();
        types[type].prototype.constructor = types[type];

        _.each(options, function(value, key) {
          types[type].prototype[key] = value;
        });

        return true;
      } else return false;
    }
  };
})();

module.exports = factory;
