;(function() {
  function Coordinate(x, y, dynamic) {
    this.x = x;
    this.y = y;

    // a bit mental
    if(dynamic === true) {
      this.id = function() {
        return this.generateId();
      };
    }
    else {
      this._id = this.generateId();
      this.id = function() {
        return this._id;
      };
    }
  }

  Coordinate.prototype = {
    generateId: function() {
      return this.x + "," + this.y
    },

    neighbours: function(maxCoordinates) {
      var neighbours = [];

      if(this.x > 0) {
        neighbours.push(new Coordinate(this.x - 1, this.y));
      }
      if(this.y > 0) {
        neighbours.push(new Coordinate(this.x, this.y - 1));
      }
      if(this.x < maxCoordinates.x) {
        neighbours.push(new Coordinate(this.x + 1, this.y));
      }
      if(this.y < maxCoordinates.y) {
        neighbours.push(new Coordinate(this.x, this.y + 1));
      }
      if(this.x > 0 && this.y > 0) {
        neighbours.push(new Coordinate(this.x - 1, this.y - 1));
      }
      if(this.x < maxCoordinates.x && this.y < maxCoordinates.y) {
        neighbours.push(new Coordinate(this.x + 1, this.y + 1));
      }
      if(this.x > 0 && this.y < maxCoordinates.y) {
        neighbours.push(new Coordinate(this.x - 1, this.y + 1));
      }
      if(this.x < maxCoordinates.x && this.y > 0) {
        neighbours.push(new Coordinate(this.x + 1, this.y - 1));
      }

      return neighbours;
    },
  }

  this.Coordinate = Coordinate;
}).call(this);
