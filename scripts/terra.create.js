// consider changing name, adding ability to pause, reset, etc.
/*
terra.create = function ( selector, map, fps, steps ) {

  // Imports...
  Terrarium = terra.util.Terrarium;

  if ( typeof selector !== 'string' ) {
    throw new Error( 'You need to pass an element selector (string) as the first argument of terra.create (received "' + selector + '")');
  }

  map = map || terra.maps.mSmall( [ '*', 'C', ' ', '#' ] );
  fps = fps || 60;
  steps = steps || 1;

  var startTick = function ( fn ) {
    var tick = function () {
      setTimeout( function () {
        fn();
        requestAnimationFrame( tick );
      }, 1000 / fps );
    };

    requestAnimationFrame( tick );
  };

  var level = new Terrarium( map, selector );

  startTick( function () {
    for ( var i = steps; i; i-- ) {
      level.step();
    }
    level.toDom();
  });

};
*/