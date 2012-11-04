;(function() {
  var helper = new Helper();

  function World(canvas) {
    this.size = { x:canvas.width, y:canvas.height };
    this.ctx = canvas.getContext('2d');
    this.sm = new Glazz.SolidityMap(this.size.x, this.size.y);

    // add border to SM
    for(var y = 0; y < this.sm.sm.length; y++) {
      for(var x = 0; x < this.sm.sm[y].length; x++) {
        if(x === 0 || y === 0 || x === this.sm.sm[y].length -1 || y === this.sm.sm.length -1) {
          this.sm.update({ x:x, y:y }, { x:1, y:1 }, 1);
        }
      }
    }

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
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(0, 0, this.size.x, this.size.y)

      this.radar.update();
      _.map(this.submarines, function(x) { x.update(); });

      this.ctx.strokeStyle = "black";
      this.ctx.strokeRect(0.5, 0.5, this.size.x - 1, this.size.y - 1);
    },

    radarResult: function(endpoint) {
      _.map(this.submarines, function(x) { x.radarResult(endpoint); });
    },

    getSize: function() {
      return this.size;
    }
  }

  function Radar(world, worldWidth, worldHeight) {
    this.world = world;
    helper.addGlazzSupport(this);
    this.pos = { x:worldWidth / 2, y:worldHeight / 2 };
    this.size = { x:10, y:10 };
    this.id = helper.getId();

    this.world.sm.updateObj(this);

    this.angle = 0;

    this.eyes = new Glazz.Eyes(this, this.world.sm);
  }

  Radar.prototype = {
    turnAmount: 5,
    update: function() {
      this.angle = helper.dial(this.angle, this.turnAmount, 359);

      var endpoint = this.gazeEndpoint();

      // draw scan line
      this.world.ctx.strokeStyle = "black";
      this.world.ctx.beginPath();
      this.world.ctx.moveTo(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
      this.world.ctx.lineTo(endpoint.point.x, endpoint.point.y);
      this.world.ctx.closePath();
      this.world.ctx.stroke();

      this.world.radarResult(endpoint);
    },

    gazeEndpoint: function() {
      var sightVec = helper.angleToVector(this.angle);
      return this.eyes.lookTo(sightVec);
    }
  }

  function Submarine(world, worldWidth, worldHeight) {
    this.world = world;

    helper.addGlazzSupport(this);
    this.size = { x:8, y:8 };
    this.pos = helper.getRandomWorldPos(this.world, this.world.sm, this);
    this.id = helper.getId();

    this.world.sm.updateObj(this);

    this.alpha = 0;
  }

  Submarine.prototype = {
    fade: 0.02,
    update: function() {
      this.world.ctx.save();
      this.world.ctx.globalAlpha = this.alpha;
      helper.drawCircle(this.world.ctx, this, "black", "black");
      this.world.ctx.restore();

      if(this.alpha >= this.fade) {
        this.alpha -= this.fade;
      }
    },

    radarResult: function(endpoint) {
      if(helper.inside(endpoint.point, this.pos, this.size)) {
        this.alpha = 1.0;
      }
    }
  }

  var canvas = $('#sonar')[0];
  var helper = new Helper();
  new World(canvas).run();
}).call(this);
