/*
  Nervous.js
  by mary rose cook
  http://github.com/maryrosecook/nervousjs

  The eyes and ears of your objects.
*/

;(function() {
  function Nervous(actor) {
    this.actor = actor;
  };

  var inside = function(point, obj) {
    return point.x >= obj.getPosition().x - 1
      && point.y >= obj.getPosition().y - 1
      && point.x <= obj.getPosition().x + obj.size.x + 1
      && point.y <= obj.getPosition().y + obj.size.y + 1;
  };

  function Eyes(nervous, sm, overlook) {
    this.nervous = nervous;
    this.sm = sm;
    this.overlook = overlook;
  };

  Eyes.prototype = {
    lookAt: function(obj, overlook) {
      var self = this;
      if(overlook === undefined) {
        overlook = this.overlook;
      }

      var raycaster = new Raycaster(this.sm);
      var start = ig.maths.floor(this.nervous.actor.center());
      var line = raycaster.bresenhamLinePoints(start, obj.center());
      var observee = raycaster.project(line, start, overlook, function(point, inOverlook) {
        return (raycaster.traversable(point, inOverlook)
                && inside(point, obj) === false)
          || inside(point, self.nervous.actor);
      });

      observee.visible = function() {
        return this.point && inside(this.point, obj);
      };

      return observee;
    },

    // returns the material of obj that can be seen in direction of vector,
    // and pos obj was hit
    lookInDirection: function(vector, overlook) {
      if(overlook === undefined) {
        overlook = this.overlook;
      }

      var raycaster = new Raycaster(this.sm);
      var start = ig.maths.floor(this.nervous.actor.center());
      var end = raycaster.vectorToEndPoint(start, vector);
      var line = raycaster.bresenhamLinePoints(start, end);

      var self = this;
      var observee = raycaster.project(line, start, overlook, function(point, inOverlook) {
        return raycaster.traversable(point, inOverlook)
          || inside(point, self.nervous.actor);
      });

      return observee;
    }
  };


  function Ears(nervous, amp) {
    this.nervous = nervous;
    this.amp = amp;
  };

  Ears.prototype = {
    // Listen out for sounds of type soundType.
    // When they occur, run response, passing soundType and soundMaker.
    listenTo: function(soundType, response) {
      this.amp.addListener(this.nervous.actor, soundType, response);
    },

    // stop listening to everything
    stopListeningTo: function(soundType) {
      this.amp.removeListener(this.nervous.actor, soundType);
    },
  };

  this.Nervous = Nervous;
  this.Nervous.Eyes = Eyes;
  this.Nervous.Ears = Ears;
}).call(this);