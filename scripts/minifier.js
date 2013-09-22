// Produces the minified version.

var packer = require( 'node.packer' ),
    path   = __dirname + '/../',
    src    = path + 'src/',
    out    = path;

var input = [
  src + 'glazz.js',
  src + 'eyes.js',
  src + 'raytracer.js',
  src + 'solidityMap.js'
];

packer({
  log: true,
  input: input,
  minify: true,
  output: out + 'glazz-min.js',
  callback: function ( err, code ){
    err && console.log( err );
  }
});

packer({
  log: true,
  input: input,
  minify: false,
  output: out + 'glazz.js',
  callback: function ( err, code ){
    err && console.log( err );
  }
});
