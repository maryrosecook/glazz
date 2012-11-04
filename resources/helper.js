;(function() {
  function Helper() { };

  Helper.prototype = {
    drawCircle: function(ctx, obj, strokeStyle, fillStyle) {
      ctx.strokeStyle = strokeStyle;
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      var r = obj.getSize().x / 2;
      ctx.arc(obj.getPosition().x + r, obj.getPosition().y + r, r, 0, Math.PI*2, true);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    },

    addGlazzSupport: function(obj) {
      var glazzSupport = {
        id: null,
        pos: null,
        size: null,
        getPosition: function() {
          return this.pos;
        },

        getSize: function() {
          return this.size;
        },

        getMaterial: function() {
          return this.id;
        }
      }

      for(var i in glazzSupport) {
        obj[i] = glazzSupport[i];
      }

      return obj;
    },

    // adds change to current.  Resets to zero and continues changing if limit passed.
    // doesn't allow for change that encompasses more than one revolution
    dial: function(current, change, limit) {
      var absolute = current + change;
      if(current === 0 && limit === 0) {
        return 0;
      }
      else if(change < 0 && absolute < 0) {
        return limit + (absolute % limit);
      }
      else if(change > 0 && absolute > limit) {
        return absolute % limit;
      }
      return absolute;
    },

    vectorTo: function(start, end) {
      return { x: end.x - start.x, y: end.y - start.y };
    },

    // vectorToAngle: function(v) {
    //   var mag = Math.sqrt(v.x * v.x + v.y * v.y);
    //   var unitVec = mag > 0 ? { x: v.x / mag, y: v.y / mag } : { x:0, y:0 };
    //   var uncorrectedDeg = Math.atan2(unitVec.x, -unitVec.y) / 0.01745;
    //   return uncorrectedDeg < 0 ? 360 + uncorrectedDeg : uncorrectedDeg;
    // },

    angleToVector: function(angle) {
      var r = this.degToRad(angle);

      var x = Math.cos(r) * 0 - Math.sin(r) * -1;
      var y = Math.sin(r) * 0 + Math.cos(r) * -1;
      var normalisedVec = this.normalise({ x: x, y: y });
      return normalisedVec;
    },

    normalise: function(v) {
      var mag = Math.sqrt(v.x * v.x + v.y * v.y);
      return mag > 0 ? { x: v.x / mag, y: v.y / mag } : { x:0, y:0 }
    },

    // wrapCoord: function(c) {
    //   return new Coordinate(c.x, c.y);
    // },

    // getRandomSearchPos: function(forest, sm, obj) {
    //   var rad = 50;
    //   var pos = {
    //     x: Math.floor(obj.pos.x - rad + Math.random() * rad * 2),
    //     y: Math.floor(obj.pos.y - rad + Math.random() * rad * 2)
    //   };

    //   if(!this.validPos(forest, sm, pos, obj.getSize())) {
    //     return this.getRandomSearchPos(forest, sm, obj);
    //   }

    //   return pos;
    // },

    getRandomWorldPos: function(world, sm, obj) {
      var pos = {
        x: Math.floor(Math.random() * world.getSize().x),
        y: Math.floor(Math.random() * world.getSize().y)
      };

      if(!this.validPos(world, sm, pos, obj.getSize())) {
        return this.getRandomWorldPos(world, sm, obj);
      }

      return pos;
    },

    getRandomDirection: function() {
      return { x: Math.random() - 0.5, y: Math.random() - 0.5 };
    },

    validPos: function(world, sm, pos, size) {
      return pos.x >= 0 && pos.x + size.x < world.getSize().x
        && pos.y >= 0 && pos.y + size.y < world.getSize().y
        && !this.occupied(sm, pos, size);
    },

    occupied: function(sm, pos, size) {
      return _.any(_.flatten(sm.getArea(pos, size)), function(x) {
        return x > 0;
      });
    },

    intersecting: function(obj1, obj2) {
      var p1 = obj1.getPosition();
      var s1 = obj1.getSize();
      var p2 = obj2.getPosition();
      var s2 = obj2.getSize();
      return !(p1.x + s1.x < p2.x
               || p1.x > p2.x + s2.x
               || p1.y > p2.y + s2.y
               || p1.y + s1.y < p2.y);
    },

    degToRad: function(degrees) { return 0.01745 * degrees; },

    angleSpan: function(facing, span) {
      return {
        start: this.dial(facing, -span / 2, 359),
        end: this.dial(facing, span / 2, 359),
      };
    },

    inside: function(point, objPos, objSize) {
      return point.x >= objPos.x
        && point.y >= objPos.y
        && point.x <= objPos.x + objSize.x
        && point.y <= objPos.y + objSize.y;
    },

    id: 1,
    getId: function() {
      return ++this.id;
    }
  }

  this.Helper = Helper;
}).call(this);
