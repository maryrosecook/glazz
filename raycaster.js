;(function() {
  function Raycaster(solidityMap) {
    this.solidityMap = solidityMap;
  };

  Raycaster.prototype = {
    project: function(rayLine, start, overlook, altTraversable) {
      var observee = new Observee(rayLine);
      var start = ig.maths.floor(start);
      var runLineBackwards = this.runLineBackwards(rayLine, start);

      var traversable = this.traversable;
      if(altTraversable !== undefined)
        traversable = altTraversable;

      if(rayLine.length > 0)
      {
        var rayPointIndex = 0;
        if(runLineBackwards)
          rayPointIndex = rayLine.length - 1;

        while(true)
        {
          var rayPoint = rayLine[rayPointIndex];
          if(!traversable.call(this, rayPoint, overlook))
          {
            observee.lineOfSight = rayLine.slice(0, rayPointIndex);
            observee.setPoint(rayPoint, this.solidityMap.get(rayPoint));
            break;
          }

          if(runLineBackwards)
          {
            rayPointIndex--;
            if(rayPointIndex < 0) {
              break;
            }
          }
          else
          {
            rayPointIndex++;
            if(rayPointIndex >= rayLine.length) {
              break;
            }
          }
        }
      }

      return observee;
    },

    runLineBackwards: function(rayLine, start) {
      return rayLine[0].x != start.x || rayLine[0].y != start.y;
    },

    // produces end point of a line from start in direction of passed vector
    vectorToEndPoint: function(start, vector) {
      var p = { x: start.x, y: start.y};
      var width = this.solidityMap.width - 1;
      var height = this.solidityMap.height - 1;
      while(true)
      {
        if(p.x < 0 || p.x > width || p.y < 0 || p.y > height)
          break;
        p.x += vector.x;
        p.y += vector.y;
      }

      var x = p.x;
      var y = p.y;
      if(p.x < 0)
        x = 0;
      else if(p.x > width)
        x = width - 1;

      if(p.y < 0)
        y = 0;
      else if(p.y > height)
        y = height - 1;

      return { x:x, y:y };
    },

    bresenhamLinePoints: function(start, end) {
      var start = ig.maths.floor(start);
      var end = ig.maths.floor(end);
      return this.bresenhamLine(start.x, start.y,
                                end.x, end.y);
    },

    bresenhamLine: function(x0, y0, x1, y1) {
      var result = [];

      var steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
      var temp = null;
      if(steep === true)
      {
        temp = x0;
        x0 = y0;
        y0 = temp;

        temp = x1;
        x1 = y1;
        y1 = temp;
      }

      if(x0 > x1)
      {
        temp = x0;
        x0 = x1;
        x1 = temp;

        temp = y0;
        y0 = y1;
        y1 = temp;
      }

      var deltaX = x1 - x0;
      var deltaY = Math.abs(y1 - y0);
      var error = 0;
      var yStep;
      var y = y0;
      if(y0 < y1)
        yStep = 1;
      else
        yStep = -1;

      for(var x = x0; x <= x1; x++)
      {
        if(steep === true)
          result.push({ x: y, y: x });
        else
          result.push({ x: x, y: y });

        error += deltaY;
        if(2 * error >= deltaY)
        {
          y += yStep;
          error -= deltaX;
        }
      }

      return result;
    },

    printLine: function(line) {
      var newSm = this.solidityMap.copy();

      var coords = "";
      for(var i = 0; i < line.length; i++)
      {
        coords += line[i].x + "," + line[i].y + " | "
        newSm.sm[line[i].y][line[i].x] = "L";
      }

      console.log(coords);
      newSm.print();
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
      if(SolidityMap.isMaterial(material, 0)) {
        return true;
      }
      else if(overlook !== undefined) {
        for(var i = 0; i < overlook.length; i++) {
          if(SolidityMap.isMaterial(material, overlook[i])) {
            return true;
          }
        }
      }

      return false;
    },
  };


  function Observee(line) {
    this.lineOfSight = line;
    this.point = null;
    this.material = null;
  };

  Observee.prototype = {
    setPoint: function(point, material) {
      this.point = point;
      this.material = material;
    }
  };

  this.Raycaster = Raycaster;
}).call(this);