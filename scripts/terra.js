;( function () {
  if ( typeof terra !== 'undefined' &&
    terra !== document.getElementsByName( 'terra' ) &&
    terra !== document.getElementById( 'terra' )
  ) {
    throw 'Variable "terra" already exists, that\'s a problem.';
  } else {
    terra = {}; // global
  }
} )();
