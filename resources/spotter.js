;(function() {
  var delay = 1000;

  function World(canvas) {
    this.size = { x:canvas.width, y:canvas.height };
    this.ctx = canvas.getContext('2d');
    this.sm = new Glazz.SolidityMap(this.size.x, this.size.y);

    this.radar = new Radar(this, this.size.x, this.size.y);

    this.submarines = [];
  }

  World.prototype = {
    run: function() {
      var self = this;
      setInterval(function() {
        self.draw()
      }, 50);

      setInterval(function() {
        self.update()
      }, delay);
    },

    maxSubmarines: 50,
    update: function() {
      var submarine = new Submarine(this);
      this.submarines.push(submarine);
      if(this.submarines.length > this.maxSubmarines) {
        var oldSubmarine = this.submarines.shift();
        oldSubmarine.destroy();
      }

      this.radar.update(submarine);
    },

    draw: function() {
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(0, 0, this.size.x, this.size.y)

      this.radar.draw();
      _.map(this.submarines, function(x) { x.draw(); });

      this.ctx.strokeStyle = "black";
      this.ctx.strokeRect(0.5, 0.5, this.size.x - 1, this.size.y - 1);
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
    update: function(submarine) {
      this.lineOfSight = this.eyes.lookAt(submarine);

      if(this.lineOfSight.obj === submarine) {
        submarine.update("black");
      }
      else {
        submarine.update("#999");
      }
    },

    draw: function() {
      if(this.lineOfSight !== undefined) {
        this.world.ctx.strokeStyle = "black";
        this.world.ctx.beginPath();
        this.world.ctx.moveTo(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
        this.world.ctx.lineTo(this.lineOfSight.point.x, this.lineOfSight.point.y);
        this.world.ctx.closePath();
        this.world.ctx.stroke();
      }
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
    draw: function() {
      this.world.ctx.save();
      this.world.ctx.lineWidth = 1.5;
      helper.drawCircle(this.world.ctx, this, "black", this.fillStyle);
      this.world.ctx.restore();
    },

    update: function(fillStyle) {
      this.fillStyle = fillStyle;
      var self = this;
      setTimeout(function() {
        self.fillStyle = "white";
      }, delay);
    },

    destroy: function() {
      this.world.sm.clearMaterial(this.getMaterial());
    }
  }

  var canvas = $('#spotter')[0];
  var helper = new Helper();
  new World(canvas).run();
}).call(this);
