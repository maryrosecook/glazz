;(function() {
  function SolidityMap(width, height) {
    this.sm = [];
    this.materials = {};

    this.width = width;
    this.height = height;
    for(var x = 0; x < width; x++) {
      for(var y = 0; y < height; y++) {
        if(x === 0)
          this.sm[y] = [];

        this.sm[y][x] = 0;
      }
    }

    SolidityMap.isMaterial = function(material, materials) {
      if(materials instanceof Array) // is a material type
      {
        for(var i = 0; i < materials.length; i++) {
          if(material === materials[i]) {
            return true
          }
        }

        return false;
      }
      else // specific material check
        return material === materials;
    };
  };

  SolidityMap.prototype = {
    // adds a block of filler to the solidityMap
    updateSection: function(p, width, height, filler) {
      if(this.materials[filler] === undefined)
        this.materials[filler] = [];

      for(var x = p.x; x < p.x + width; x++) {
        for(var y = p.y; y < p.y + height; y++) {
          this.sm[y][x] = filler;
          this.materials[filler].push({ x: x, y: y });
        }
      }
    },

    get: function(p) {
      try {
        return this.sm[p.y][p.x];
      }
      catch(e) {
        if(e instanceof TypeError)
          console.log(p.y, p.x)
        throw e;
      }
    },

    isMaterialPos: function(p, materials) {
      return SolidityMap.isMaterial(this.get(p), materials);
    },

    unoccupied: function(p) {
      return this.get(p) === 0;
    },

    occupied: function(p) {
      return this.get(p) !== 0;
    },

    // changes all instances of cells filled with passed material to 0
    clear: function(value) {
      if(this.materials[value] !== undefined) {
        for(var i = 0; i < this.materials[value].length; i++)
        {
          var entry = this.materials[value][i];
          this.sm[entry.y][entry.x] = 0;
        }
      }

      this.materials[value] = [];
    },

    copy: function() {
      var newSm = new SolidityMap(this.width, this.height);

      for(var x = 0; x < this.width; x++)
        for(var y = 0; y < this.height; y++)
      {
        if(x === 0)
          newSm.sm[y] = [];

        newSm.sm[y][x] = this.sm[y][x];
      }

      return newSm;
    },

    print: function(tilesize) {
      var inc = 1;
      if(tilesize !== undefined)
        inc = tilesize;

      for(var y = 0; y < this.height; y += inc)
      {
        var str = "";
        for(var x = 0; x < this.width; x += inc)
          str += this.sm[y][x];

        console.log(str)
      }
    },
  };

  this.SolidityMap = SolidityMap;
}).call(this);