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
