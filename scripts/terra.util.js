// Utility and helper functions
;( function ( exports ) {

  var arrayOfArrays = function ( height, width ) {
    var instance;

    if ( typeof height !== 'number' || typeof width !== 'number' ) {
      throw 'Input error: arrayOfArrays() requires two numbers as inputs';
    }

    instance = new Array( height );
    while( width-- ) {
      instance[ width ] = [];
    }

    return instance;
  };

  var grid = new arrayOfArrays(500, 800);

//  grid.map

  exports.grid = grid;

})( terra.util = terra.util || {} );
