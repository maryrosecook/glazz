/*
  Glazz
  by mary rose cook
  http://github.com/maryrosecook/glazz

  The eyes of your objects.
*/


;(function(exports) {
  exports.Glazz = {};
})(typeof exports === 'undefined' ? this : exports);

;(function(exports) {
  var Glazz = null;
  if(typeof module !== 'undefined' && module.exports) {
    Glazz = require('./glazz').Glazz;
    Glazz.Raytracer = require('./raytracer').Raytracer;
  }
  else {
    Glazz = window.Glazz;
  }

  function Eyes(actor, sm, overlook) {
    this.actor = actor;
    this.raytracer = new Glazz.Raytracer(sm);

    this.overlook = overlook;
    if(this.overlook === undefined) {
      this.overlook = [];
    }
  };

  Eyes.prototype = {
    // returns end point of line of sight when look at obj
    lookAt: function(obj, inOverlook) {
      var overlook = getOverlook.call(this, inOverlook);
      var start = Maths.center(this.actor);
      var end = Maths.center(obj);

      var self = this;
      var endpoint = this.raytracer.trace(start, end, overlook, function(point, inOverlook) {
        return this.traversable(point, inOverlook)
          || this.inside(point, self.actor.getPosition(), self.actor.getSize())
          // || this.inside(point, obj.getPosition(), obj.getSize())
      });

      if(endpoint !== undefined) {
        if(this.raytracer.inside(endpoint.point, obj.getPosition(), obj.getSize())) {
          endpoint.obj = obj;
        }
      }

      return endpoint;
    },

    // returns endpoint of line of sight when look in direction of vector
    lookTo: function(vector, inOverlook) {
      var overlook = getOverlook.call(this, inOverlook);
      var start = Maths.center(this.actor);
      var end = this.raytracer.getVectorEnd(start, vector);
      return raytrace.call(this, start, end, overlook, this.actor);
    },

    // returns objs in view span
    lookAcross: function(objs, facing, span, inOverlook) {
      if(facing > 359 || facing < 0) throw "Facing must be between 0 and 359.";
      if(span > 360 || span < 0) throw "Span must be between 0 and 360.";

      var spannedObjs = [];

      var fov = Maths.angleSpan(facing, span);
      for(var i = 0; i < objs.length; i++) {
        var toObj = Maths.vectorToAngle(Maths.vectorTo(this.actor.getPosition(),
                                                       objs[i].getPosition()));
        if(span === 360 // special case for wide-eye view
           || Maths.withinAngles(toObj, fov.start, fov.end)) {
          var endpoint = this.lookAt(objs[i], inOverlook);
          if(endpoint !== undefined) {
            spannedObjs.push(endpoint);
          }
        }
      }

      return spannedObjs;
    }
  };

  var raytrace = function(start, end, overlook, actor) {
    return this.raytracer.trace(start, end, overlook, function(point, inOverlook) {
      return this.traversable(point, overlook)
        || this.inside(point, actor.getPosition(), actor.getSize())
    });
  }

  var getOverlook = function(overlook) {
    return overlook === undefined ? this.overlook : overlook;
  }

  Maths = {
    center: function(obj) {
      return {
        x: obj.pos.x + (obj.size.x / 2),
        y: obj.pos.y + (obj.size.y / 2),
      };
    },

    angleSpan: function(facing, span) {
      return {
        start: this.dial(facing, -span / 2),
        end: this.dial(facing, span / 2),
      };
    },

    dial: function(current, change) {
      var absolute = current + change;
      if(change < 0 && absolute < 0) {
        return 360 + (absolute % 360);
      }
      else if(change > 0 && absolute > 360) {
        return absolute % 360;
      }
      else {
        return absolute;
      }
    },

    vectorTo: function(start, end) {
      return { x: end.x - start.x, y: end.y - start.y };
    },

    vectorToAngle: function(v) {
      var mag = Math.sqrt(v.x * v.x + v.y * v.y);
      var unitVec = mag > 0 ? { x: v.x / mag, y: v.y / mag } : { x:0, y:0 };
      var uncorrectedDeg = Math.atan2(unitVec.x, -unitVec.y) / 0.01745;
      return uncorrectedDeg < 0 ? 360 + uncorrectedDeg : uncorrectedDeg;
    },

    // from: http://www.xarg.org/2010/06/is-an-angle-between-two-other-angles/
    withinAngles: function(n, a, b) {
      if(a === b) return false;
	    n = (360 + (n % 360)) % 360;
	    a = (3600000 + a) % 360;
	    b = (3600000 + b) % 360;
	    if (a < b) {
		    return a <= n && n <= b;
      }
	    return a <= n || n <= b;
    },
  };

  exports.Eyes = Eyes;
})(typeof exports === 'undefined' ? this.Glazz : exports);

;(function(exports) {
  function Raytracer(sm) {
    if(sm === null || sm === undefined) throw "You must provide a solidity map.";
    this.solidityMap = sm;
  };

  Raytracer.prototype = {
    trace: function(start, end, overlook, altTraversable) {
      var endpoint = undefined;
      var start = floor(start);
      var end = floor(end);
      var rayLine = bresenhamLine(start.x, start.y, end.x, end.y);
      var runLineBackwards = isRunLineBackwards(rayLine, start);

      var traversable = this.traversable;
      if(altTraversable !== undefined) {
        traversable = altTraversable;
      }

      if(rayLine.length > 0) {
        var rayPointIndex = 0;
        if(runLineBackwards) {
          rayPointIndex = rayLine.length - 1;
        }

        while(true) {
          var rayPoint = rayLine[rayPointIndex];
          if(!traversable.call(this, rayPoint, overlook)) {
            var lineOfSight = runLineBackwards ? rayLine.slice(rayPointIndex + 1).reverse()
                                               : rayLine.slice(0, rayPointIndex);
            endpoint = new Endpoint(lineOfSight, rayPoint, this.solidityMap.get(rayPoint));
            break;
          }

          if(runLineBackwards) {
            rayPointIndex--;
            if(rayPointIndex < 0) {
              break; // traversed line w/o hitting anything - no endpoint
            }
          }
          else {
            rayPointIndex++;
            if(rayPointIndex >= rayLine.length) {
              break; // traversed line w/o hitting anything - no endpoint
            }
          }
        }
      }

      return endpoint;
    },

    // produces end point of a line from start in direction of passed vector
    getVectorEnd: function(start, v) {
      if(start.x < 0 || start.x > this.solidityMap.width) return undefined;
      if(start.y < 0 || start.y > this.solidityMap.height) return undefined;
      if(v.x === 0 && v.y === 0) return undefined;

      var p = { x: start.x, y: start.y };
      var mag = Math.sqrt(v.x * v.x + v.y * v.y);
      var unitVec = { x: v.x / mag, y: v.y / mag };
      while(true) {
        if(p.x < 0 || p.x > this.solidityMap.width || p.y < 0
           || p.y > this.solidityMap.height) {
          break;
        }

        p.x += v.x;
        p.y += v.y;
      }

      var x = p.x;
      var y = p.y;
      if(p.x < 0) {
        x = 0;
      }
      else if(p.x > this.solidityMap.width) {
        x = this.solidityMap.width - 1;
      }

      if(p.y < 0) {
        y = 0;
      }
      else if(p.y > this.solidityMap.height) {
        y = this.solidityMap.height - 1;
      }

      return { x:Math.floor(x), y:Math.floor(y) };
    },

    traversable: function(point, overlook) {
      if(point.x < 0) {
        return true;
      }

      if(point.x >= this.solidityMap.width) {
        return true;
      }

      if(point.y < 0) {
        return true;
      }

      if(point.y >= this.solidityMap.height) {
        return true;
      }

      var material = this.solidityMap.get(point);
      if(material === 0) {
        return true;
      }
      else if(overlook !== undefined) {
        for(var i = 0; i < overlook.length; i++) {
          if(material === overlook[i]) {

            return true;
          }
        }
      }

      return false;
    },

    inside: function(point, objPos, objSize) {
      return point.x >= objPos.x
        && point.y >= objPos.y
        && point.x <= objPos.x + objSize.x
        && point.y <= objPos.y + objSize.y;
    }
  };

  var isRunLineBackwards = function(rayLine, start) {
    return rayLine[0].x != start.x || rayLine[0].y != start.y;
  };

  var bresenhamLine = function(x0, y0, x1, y1) {
    var result = [];

    var steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
    var temp;
    if(steep === true) {
      temp = x0;
      x0 = y0;
      y0 = temp;

      temp = x1;
      x1 = y1;
      y1 = temp;
    }

    if(x0 > x1) {
      temp = x0;
      x0 = x1;
      x1 = temp;

      temp = y0;
      y0 = y1;
      y1 = temp;
    }

    var deltaX = x1 - x0;
    var deltaY = Math.abs(y1 - y0);
    var error = deltaX / 2;
    var yStep;
    var y = y0;
    if(y0 < y1) {
      yStep = 1;
    }
    else {
      yStep = -1;
    }

    for(var x = x0; x <= x1; x++) {
      if(steep === true) {
        result.push({ x:y, y:x });
      }
      else {
        result.push({ x:x, y:y });
      }

      error -= deltaY;
      if(error < 0) {
        y += yStep;
        error += deltaX;
      }
    }

    return result;
  };

  var floor = function(p) {
    return {
      x: Math.floor(p.x),
      y: Math.floor(p.y)
    };
  };

  function Endpoint(line, point, material) {
    this.lineOfSight = line;
    this.point = { x:point.x, y:point.y };
    this.material = material;
  };

  exports.Raytracer = Raytracer;
})(typeof exports === 'undefined' ? this.Glazz : exports);

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

    clearObj: function() {
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

