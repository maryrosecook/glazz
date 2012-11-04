;(function() {
  function Forest(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sm = new Glazz.SolidityMap(canvas.width, canvas.height);
    this.spawnTrees();
    this.spawnPeople();
    this.hearts = [];
  }

  Forest.prototype = {
    spawnPeople: function() {
      this.people = [];
      _.map(_.range(2), function() {
        this.people.push(new Person(this));
      }, this);
    },

    spawnTrees: function() {
      this.trees = [];
      _.map(_.range(8), function() {
        this.trees.push(new Tree(this));
      }, this);
    },

    run: function() {
      var self = this;
      setInterval(function() {
        self.update()
      }, 50);
    },

    update: function() {
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

      if(helper.intersecting(this.people[0], this.people[1])) {
        this.hearts.push(new Heart(this.ctx, this.people[0]));
        this.spawnPeople();
      }

      _.map(this.trees, function(x) { x.update(); });
      _.map(this.people, function(x) { x.update(); });
      _.map(this.hearts, function(x) { x.update(); });
    },
  }

  function Tree(forest) {
    this.forest = forest;
    addGlazzSupport(this);
    this.id = helper.getId();
    this.size = { x:40, y:40 };
    this.pos = helper.getRandomForestPos(forest, forest.sm, this);
    this.forest.sm.updateObj(this);
  }

  Tree.prototype = {
    update: function() {
      helper.drawCircle(this.forest.ctx, this, "red");
    }
  }

  function Person(forest) {
    this.forest = forest;
    addGlazzSupport(this);
    this.id = helper.getId();
    this.eyes = new Glazz.Eyes(this, forest.sm);
    this.pathFinder = new Astar(this.forest.sm, { x: canvas.width, y:canvas.height });

    this.size = { x:8, y:8 };
    this.pos = helper.getRandomForestPos(forest, forest.sm, this);
    this.lastPos = { x:this.pos.x + 1, y:this.pos.y + 1 };
  }

  Person.prototype = {
    path: [],
    update: function() {
      var facing = helper.vectorToAngle(helper.vectorTo(this.lastPos, this.pos));
      var endpoints = this.eyes.lookAcross(this.forest.people, facing, 180, []);
      if(endpoints.length > 0 && endpoints[0].obj !== undefined
        && endpoints[0].obj !== this) { // seen lover
        this.setPathTowardsLover(endpoints);
      }
      else if(this.path.length === 0) { // set random goal for searching
        var goal = helper.getRandomSearchPos(this.forest, this.forest.sm, this);
        this.path = this.pathFinder.astar(helper.wrapCoord(this.pos), helper.wrapCoord(goal));
      }
      this.walk();


      helper.drawCircle(this.forest.ctx, this, "red");
    },

    setPathTowardsLover: function(endpoints) {
      var goal = endpoints[0].point;
      var v = helper.vectorTo(this.pos, goal);
      var mag = Math.sqrt(v.x * v.x + v.y * v.y);
      var uv = { x: v.x / mag, y: v.y / mag };
      this.path = [{ x:Math.floor(this.pos.x + uv.x), y: Math.floor(this.pos.y + uv.y)}];
      console.log(this.path[0].x, this.path[0].y)
    },

    walk: function() {
      var nextCoordinate = this.path.shift();
      if(nextCoordinate !== undefined) {
        this.lastPos = { x:this.pos.x, y:this.pos.y };
        this.pos = { x:nextCoordinate.x, y:nextCoordinate.y };
        this.forest.sm.clearMaterial(this.getMaterial());
        this.forest.sm.updateObj(this);
      }
    }
  }

  function Heart(ctx, obj) {
    this.ctx = ctx;
    this.pos = { x:obj.getPosition().x, y:obj.getPosition().y };
  };

  Heart.prototype = {
    update: function() {
      this.ctx.drawImage(helper.heartImageObj, this.pos.x, this.pos.y);
    }
  }

  function addGlazzSupport(obj) {
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
  }

  var canvas = $('#canvas')[0];
  var helper = new Helper();
  var forest = new Forest(canvas);
  forest.run();
}).call(this);
