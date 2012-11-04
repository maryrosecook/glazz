# Glazz

* by mary rose cook
* http://maryrosecook.com
* maryrosecook@maryrosecook.com

Give your objects eyes.

## Get the code

### npm

To install npm, visit https://github.com/isaacs/npm

Install Glazz

    $ npm install glazz

### Git

    $ git clone git://github.com/maryrosecook/glazz.git

## Import the code

### node

    var SolidityMap = require('solidityMap').SolidityMap;
    var Glazz = require('glazz').glazz;

### Browser

    <script type="text/javascript" src="glazz.js"></script>
    <script type="text/javascript" src="solidityMap.js"></script>
    <script type="text/javascript" src="raytracer.js"></script>
    <script type="text/javascript" src="eyes.js"></script>

## Documentation

See `/index.html`

## Example

Require <code>SolidityMap</code>.  Instantiate it, passing in the width and height
of your world.  This initialises every solidity map cell to 0, the empty material value.

    var SolidityMap = require('src/solidityMap').SolidityMap;
    var sm = new SolidityMap(10, 10);

Define an <code>Obj</code> constructor that includes <code>getPosition()</code>,
<code>getSize()</code> and <code>getMaterial()</code> accessors.  Use it to
instantiate the actor, the object that will have eyes.

    var Obj = function(posX, posY, sizeX, sizeY) {
      this.pos = { x:posX, y:posY };
      this.size = { x:sizeX, y:sizeY };

      this.getPosition = function() {
        return this.pos;
      },

      this.getSize = function() {
        return this.size;
      },

      this.getMaterial = function() {
        return 1;
      }
    }

    var actor = new Obj(1, 1, 1, 1);

Give the actor eyes.

    var eyes = new Eyes(actor, sm);

Instantiate an object for the actor to look at.  Put it in the solidity map.

    var obj = new Obj(3, 3, 1, 1);
    sm.updateObj(obj);

Make the actor look at the object.  See that he sees.

    var lookEndpoint = eyes.lookAt(obj);
    console.log(lookEndpoint.obj === obj); // => true

The object moves.  Update the solidity map with its new position.

    obj.pos = { x:4, y:4 };
    sm.clearMaterial(obj.getMaterial());
    sm.updateObj(obj);

## Run the tests

Install Node.js and npm: https://github.com/isaacs/npm

Install the node dependencies and run the tests

    $ cd path/to/glazz
    $ npm install
    $ npm test
