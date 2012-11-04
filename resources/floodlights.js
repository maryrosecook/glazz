;(function() {
  function World(canvas) {
    this.size = { x:canvas.width, y:canvas.height };
    this.ctx = canvas.getContext('2d');
    this.sm = new Glazz.SolidityMap(this.size.x, this.size.y);

    this.radar = new Radar(this, this.size.x, this.size.y);

    this.submarines = [];
    _.map(_.range(4), function() {
      this.submarines.push(new Submarine(this));
    }, this);
  }

  World.prototype = {
    run: function() {
      var self = this;
      setInterval(function() {
        self.update()
      }, 50);
    },

    update: function() {
      this.ctx.fillStyle = "black";
      this.ctx.fillRect(0, 0, this.size.x, this.size.y)

      this.radar.update();
      _.map(this.submarines, function(x) { x.update(); });

      this.ctx.strokeStyle = "black";
      this.ctx.strokeRect(0.5, 0.5, this.size.x, this.size.y);
    },

    radarResult: function(endpoints) {
      _.map(this.submarines, function(x) { x.radarResult(endpoints); });
    },

    getSize: function() {
      return this.size;
    }
  }

  function Radar(world, worldWidth, worldHeight) {
    this.world = world;
    helper.addGlazzSupport(this);
    this.pos = { x:worldWidth / 2, y:worldHeight / 2 };
    this.size = { x:1, y:1 };
    this.id = helper.getId();

    this.world.sm.updateObj(this);

    this.angle = 0;
    this.eyes = new Glazz.Eyes(this, this.world.sm);
  }

  Radar.prototype = {
    turnAmount: 5,
    fov: 44,
    update: function() {
      this.angle = helper.dial(this.angle, this.turnAmount, 359);
      this.drawFov();

      // pick out subs
      var endpoints = this.eyes.lookAcross(this.world.submarines, this.angle, this.fov);
      this.world.radarResult(endpoints);
    },

    drawFov: function() {
      var center = { x:this.pos.x + this.size.y / 2, y: this.pos.y + this.size.y / 2 };
      var angles = helper.angleSpan(this.angle, this.fov);
      for(var i = 0; i <= 360; i += 45) {
        if(angles.end <= i ) {
          angles.mid = i - 45;
          break;
        }
      }

      var start = this.eyes.raytracer.getVectorEnd(center, helper.angleToVector(angles.start));
      var mid = this.eyes.raytracer.getVectorEnd(center,helper.angleToVector(angles.mid));
      var end = this.eyes.raytracer.getVectorEnd(center, helper.angleToVector(angles.end));

      this.world.ctx.fillStyle = "white";
      this.world.ctx.beginPath();

      this.world.ctx.moveTo(center.x, center.y);
      this.world.ctx.lineTo(start.x, start.y);
      this.world.ctx.lineTo(mid.x, mid.y);
      this.world.ctx.lineTo(end.x, end.y);

      this.world.ctx.closePath();
      this.world.ctx.fill();
    }
  }

  function Submarine(world, worldWidth, worldHeight) {
    this.world = world;

    helper.addGlazzSupport(this);
    this.size = { x:8, y:8 };
    this.pos = helper.getRandomWorldPos(this.world, this.world.sm, this);
    this.id = helper.getId();

    this.world.sm.updateObj(this);
  }

  Submarine.prototype = {
    update: function() {
      if(this.visible === true) {
        helper.drawCircle(this.world.ctx, this, "black", "black");
      }
    },

    radarResult: function(endpoints) {
      this.visible = false;
      var self = this;
      _.map(endpoints, function(x) {
        if(helper.inside(x.point, self.pos, self.size)) {
          self.visible = true;
        }
      });
    }
  }

  var canvas = $('#floodlights')[0];
  var helper = new Helper();
  new World(canvas).run();
}).call(this);
