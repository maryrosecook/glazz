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
