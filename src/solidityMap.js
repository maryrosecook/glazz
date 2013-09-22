;(function(exports) {
  function SolidityMap(width, height) {
    if(width === undefined || width === null || width <= 0) throw "SM width must be > 0.";
    if(height === undefined || height === null || height <= 0) throw "SM height must be > 0.";
    width = Math.floor(width);
    height = Math.floor(height);

    if(width >= -1)

    this.sm = [];
    this.materials = {};

    this.width = width;
    this.height = height;
    for(var x = 0; x < width; x++) {
      for(var y = 0; y < height; y++) {
        if(x === 0) {
          this.sm[y] = [];
        }

        this.sm[y][x] = 0;
      }
    }
  };

  SolidityMap.prototype = {
    updateWithObj: function(obj) {
      this.update(obj.getPosition(), obj.getSize(), obj.getMaterial());
    },

    clearObj: function(obj) {
      this.update(obj.getPosition(), obj.getSize(), 0);
    },

    // adds a block of material to the solidityMap
    update: function(point, dimensions, material) {
      var p = { x:Math.floor(point.x), y:Math.floor(point.y) };
      var d = { x:Math.floor(dimensions.x), y:Math.floor(dimensions.y) };

      if(p.x < 0 || p.y < 0 || d.x < 0 || d.y < 0
         || p.y + d.y > this.sm.length
         || p.x + d.x > this.sm[0].length) {
        throw "Section to update falls outside map."
      }

      if(this.materials[material] === undefined) {
        this.materials[material] = [];
      }

      for(var x = p.x; x < p.x + d.x; x++) {
        for(var y = p.y; y < p.y + d.y; y++) {
          this.sm[y][x] = material;
          this.materials[material].push({ x: x, y: y });
        }
      }
    },

    get: function(point) {
      var p = { x:Math.floor(point.x), y:Math.floor(point.y) };
      if(p.y >= this.sm.length || p.x >= this.sm[0].length) throw "Cell to get is outside sm.";
      return this.sm[p.y][p.x];
    },

    getArea: function(point, dimensions) {
      var p = { x:Math.floor(point.x), y:Math.floor(point.y) };
      var d = { x:Math.floor(dimensions.x), y:Math.floor(dimensions.y) };

      if(p.x < 0 || p.y < 0 || d.x < 0 || d.y < 0
         || p.y + d.y > this.sm.length
         || p.x + d.x > this.sm[0].length) {
        throw "Section to get falls outside map."
      }

      var area = [];
      for(var yi = 0; yi < d.y; yi++) {
        area[yi] = [];
        for(var xi = 0; xi < d.x; xi++) {
          var y = yi + p.y;
          var x = xi + p.x;
          area[yi][xi] = this.get({ x:x, y:y });
        }
      }

      return area;
    },

    // changes all instances of cells filled with passed material to 0
    clearMaterial: function(value) {
      if(this.materials[value] !== undefined) {
        for(var i = 0; i < this.materials[value].length; i++) {
          var entry = this.materials[value][i];
          this.sm[entry.y][entry.x] = 0;
        }
      }

      this.materials[value] = [];
    },

    print: function(tilesize) {
      var inc = 1;
      if(tilesize !== undefined) {
        inc = tilesize;
      }

      for(var y = 0; y < this.height; y += inc)
      {
        var str = "";
        for(var x = 0; x < this.width; x += inc) {
          str += this.sm[y][x];
        }

        console.log(str)
      }
    },
  };

  exports.SolidityMap = SolidityMap;
})(typeof exports === 'undefined' ? this.Glazz : exports);
