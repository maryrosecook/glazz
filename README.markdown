// note will floor all positions
// note not so good for objects 1x1
// note need to clear material


# Glazz

* by mary rose cook
* http://maryrosecook.com
* maryrosecook@maryrosecook.com

Give your objects eyes.

## Quick start

### Get the code

#### npm

To install npm, visit https://github.com/isaacs/npm

Install Glazz

    $ npm install glazz

#### Git

    $ git clone git://github.com/maryrosecook/glazz.git

### Import the code

#### node

    var SolidityMap = require('solidityMap').SolidityMap;
    var Glazz = require('glazz').glazz;

#### Browser

    <script type="text/javascript" src="solidityMap.js"></script>
    <script type="text/javascript" src="raytracer.js"></script>
    <script type="text/javascript" src="glazz.js"></script>

### Use the code

    // make jimmy, the object to be given eyes

    var Person = function(x, y) {
      this.pos = { x:x, y:y };
      this.getPosition = function() {
        return this.pos;
      },

      this.getSize = function() {
        return { x:1, y:1 };
      },

      getMaterial: function() {
        return 1;
      }
    }

    var jimmy = new Person(4, 4);

    // make the solidity map - the grid of object locations in the world

    var sm = new SolidityMap(9, 9);

    // give jimmy eyes

    jimmy.eyes = new Glazz(jimmy, sm);

    // make a friend for jimmy

    var ben = new Person(8, 8);

    // update the solidity map with the locations of jimmy and ben

    sm.updateObj(jimmy);
    sm.updateObj(ben);

    // can jimmy see ben?

    jimmy.eyes.lookAt(ben).visible; //-> true

    // yes, he can

## Run the tests

Install Node.js and npm: https://github.com/isaacs/npm

Install the node dependencies and run the tests

    $ cd path/to/glazz
    $ npm install
    $ npm test




// dont forget to tell them to update their sm w/ pos of actor and obj
