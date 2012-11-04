var Eyes = require('../src/eyes').Eyes;
var SolidityMap = require('../src/solidityMap').SolidityMap;

var _ = require("Underscore");

describe('eyes', function() {
  var Obj = function() {
    this.pos = {};
    this.size = {};

    this.getPosition = function() {
      return this.pos;
    },

    this.getSize = function() {
      return this.size;
    },

    this.getMaterial = function() {
      return 1;
    }
  }

  var updateObjs = function(sm, objs) {
    _.map(objs, function(x) {
      sm.updateObj(x);
    });
  }

  var sm, actor, obj, g;
  beforeEach(function () {
    sm = new SolidityMap(9, 9);

    actor = new Obj();
    obj = new Obj();

    actor.size = { x:1, y:1 };
    obj.size = { x:1, y:1 };

    g = new Eyes(actor, sm);
  });

  describe('lookAt', function() {
    describe('basics', function() {
      it('should see obj in plain sight', function() {
        actor.pos = { x:1, y:1 };
        obj.pos = { x:3, y:3 };
        sm.updateObj(obj);

        var endpoint = g.lookAt(obj);
        expect(endpoint.point).toEqual({ x:3, y:3 });
        expect(endpoint.obj).toEqual(obj);
      });

      it('should not see obj behind other obj', function() {
        sm.update({ x:3, y:3 }, { x:1, y:1 }, 1);
        actor.pos = { x:1, y:1 };
        obj.pos = { x:6, y:6 };

        var endpoint = g.lookAt(obj);
        expect(endpoint.point).toEqual({ x:3, y:3 });
        expect(endpoint.obj).toBeUndefined();
      });

      it('should not have sight blocked by own appearance in sm', function() {
        actor.pos = { x:1, y:1 };
        obj.pos = { x:3, y:3 };
        updateObjs(sm, [obj, actor]);

        var endpoint = g.lookAt(obj);
        expect(endpoint.point).toEqual({ x:3, y:3 });
      });
    });

    describe('overlook', function() {
      it('should overlook materials in overlook', function() {
        actor.pos = { x:1, y:1 };
        obj.pos = { x:3, y:3 };
        sm.updateObj(obj);

        expect(g.lookAt(obj).point).toEqual({ x:3, y:3 }); // check sees thing w/ no overlook
        expect(g.lookAt(obj, [1])).toBeUndefined(); // does not see thing if overlook provided
      });

      it('should use default overlook if specified', function() {
        actor.pos = { x:1, y:1 };
        obj.pos = { x:3, y:3 };
        sm.updateObj(obj);

        expect(g.lookAt(obj).point).toEqual({ x:3, y:3 }); // check sees thing w/ no overlook

        // does not see thing when default overlook provided
        g = new Eyes(actor, sm, [1]);
        expect(g.lookAt(obj)).toBeUndefined();
      });

      it('should override default overlook', function() {
        actor.pos = { x:1, y:1 };
        obj.pos = { x:3, y:3 };
        sm.updateObj(obj);

        // check sees thing w/ default overlook
        g = new Eyes(actor, sm, [1]);
        expect(g.lookAt(obj)).toBeUndefined();

        // check special overlook stops default overlook that overlooks thing
        expect(g.lookAt(obj, [2]).point).toEqual({ x:3, y:3 });
      });
    });
  });

  describe('lookTo', function() {
    describe('basics', function() {
      it('should see obj in plain sight', function() {
        actor.pos = { x:1, y:1 };
        obj.pos = { x:3, y:3 };
        sm.updateObj(obj);

        var endpoint = g.lookTo({ x:1, y:1 });
        expect(endpoint.point).toEqual({ x:3, y:3 });
      });

      it('should not see obj behind other obj', function() {
        sm.update({ x:3, y:3 }, { x:1, y:1 }, 1);
        actor.pos = { x:1, y:1 };
        obj.pos = { x:6, y:6 };

        var endpoint = g.lookTo({ x:1, y:1 });
        expect(endpoint.point).toEqual({ x:3, y:3 });
      });

      it('should not have sight blocked by own appearance in sm', function() {
        actor.pos = { x:1, y:1 };
        obj.pos = { x:3, y:3 };
        updateObjs(sm, [obj, actor]);

        var endpoint = g.lookTo({ x:1, y:1 });
        expect(endpoint.point).toEqual({ x:3, y:3 });
      });
    });

    describe('overlook', function() {
      it('should overlook materials in overlook', function() {
        actor.pos = { x:1, y:1 };
        obj.pos = { x:3, y:3 };
        sm.updateObj(obj);

        // check sees thing w/ no overlook
        expect(g.lookTo({ x:1, y:1 }).point).toEqual({ x:3, y:3 });

        // does not see thing if overlook provided
        expect(g.lookTo({ x:1, y:1 }, [1])).toBeUndefined();
      });

      it('should use default overlook if specified', function() {
        actor.pos = { x:1, y:1 };
        obj.pos = { x:3, y:3 };
        sm.updateObj(obj);

        // check sees thing w/ no overlook
        expect(g.lookTo({ x:1, y:1 }).point).toEqual({ x:3, y:3 });

        // does not see thing when default overlook provided
        g = new Eyes(actor, sm, [1]);
        expect(g.lookTo({ x:1, y:1 })).toBeUndefined();
      });

      it('should override default overlook', function() {
        actor.pos = { x:1, y:1 };
        obj.pos = { x:3, y:3 };
        sm.updateObj(obj);

        // check sees thing w/ default overlook
        g = new Eyes(actor, sm, [1]);
        expect(g.lookTo({ x:1, y:1 })).toBeUndefined();

        // check special overlook stops default overlook that overlooks thing
        expect(g.lookTo({ x:1, y:1 }, [2]).point).toEqual({ x:3, y:3 });
      });
    });
  });

  // check wrap around angles work

  describe('lookAcross', function() {
    var obj1, obj2, obj3;
    beforeEach(function () {
      obj1 = new Obj();
      obj2 = new Obj();
      obj3 = new Obj();
      obj1.size = { x:1, y:1 };
      obj2.size = { x:1, y:1 };
      obj3.size = { x:1, y:1 };

      actor.pos = { x:4, y:4 };
    });

    describe('basics', function() {
      describe('SE', function() {
        beforeEach(function () {
          obj1.pos = { x:6, y:4 };
          obj2.pos = { x:6, y:6 };
          obj3.pos = { x:4, y:6 };
          updateObjs(sm, [obj1, obj2, obj3]);
        });

        it('should return all objs in field of view', function() {
          var endpoints = g.lookAcross([obj1, obj2, obj3], 135, 100);
          expect(endpoints[0].obj).toEqual(obj1);
          expect(endpoints[1].obj).toEqual(obj2);
          expect(endpoints[2].obj).toEqual(obj3);
        });

        it('should omit all objs not in field of view', function() {
          var endpoints = g.lookAcross([obj1, obj2, obj3], 135, 10);
          expect(endpoints[0].obj).toEqual(obj2);
          expect(endpoints.length).toEqual(1);
        });
      });

      describe('SW', function() {
        beforeEach(function () {
          obj1.pos = { x:2, y:4 };
          obj2.pos = { x:2, y:6 };
          obj3.pos = { x:4, y:6 };
          updateObjs(sm, [obj1, obj2, obj3]);
        });

        it('should return all objs in field of view', function() {
          var endpoints = g.lookAcross([obj1, obj2, obj3], 225, 100);
          expect(endpoints[0].obj).toEqual(obj1);
          expect(endpoints[1].obj).toEqual(obj2);
          expect(endpoints[2].obj).toEqual(obj3);
        });

        it('should omit all objs not in field of view', function() {
          var endpoints = g.lookAcross([obj1, obj2, obj3], 225, 10);
          expect(endpoints[0].obj).toEqual(obj2);
          expect(endpoints.length).toEqual(1);
        });
      });

      describe('NW', function() {
        beforeEach(function () {
          obj1.pos = { x:2, y:4 };
          obj2.pos = { x:2, y:2 };
          obj3.pos = { x:4, y:2 };
          updateObjs(sm, [obj1, obj2, obj3]);
        });

        it('should return all objs in field of view', function() {
          var endpoints = g.lookAcross([obj1, obj2, obj3], 315, 100);
          expect(endpoints[0].obj).toEqual(obj1);
          expect(endpoints[1].obj).toEqual(obj2);
          expect(endpoints[2].obj).toEqual(obj3);
        });

        it('should omit all objs not in field of view', function() {
          var endpoints = g.lookAcross([obj1, obj2, obj3], 315, 10);
          expect(endpoints[0].obj).toEqual(obj2);
          expect(endpoints.length).toEqual(1);
        });
      });

      describe('NE', function() {
        beforeEach(function () {
          obj1.pos = { x:4, y:2 };
          obj2.pos = { x:6, y:2 };
          obj3.pos = { x:6, y:4 };
          updateObjs(sm, [obj1, obj2, obj3]);
        });

        it('should return all objs in field of view', function() {
          var endpoints = g.lookAcross([obj1, obj2, obj3], 45, 100);
          expect(endpoints[0].obj).toEqual(obj1);
          expect(endpoints[1].obj).toEqual(obj2);
          expect(endpoints[2].obj).toEqual(obj3);
        });

        it('should omit all objs not in field of view', function() {
          var endpoints = g.lookAcross([obj1, obj2, obj3], 45, 10);
          expect(endpoints[0].obj).toEqual(obj2);
          expect(endpoints.length).toEqual(1);
        });
      });
    });

    describe('weird input', function() {
      it('should return no objs if span is 0', function() {
        obj1.pos = { x:6, y:4 };
        obj2.pos = { x:6, y:6 };
        obj3.pos = { x:4, y:6 };
        updateObjs(sm, [obj1, obj2, obj3]);
        var endpoints = g.lookAcross([obj1, obj2, obj3], 135, 0);
        expect(endpoints.length).toEqual(0);
      });

      it('should throw exception if facing is out of range', function() {
        expect(function() {
          g.lookAcross([], -1, 1);
        }).toThrow("Facing must be between 0 and 359.");

        expect(function() {
          g.lookAcross([], 360, 1);
        }).toThrow("Facing must be between 0 and 359.");
      });

      it('should throw exception if span is out of range', function() {
        expect(function() {
          g.lookAcross([], 1, -1);
        }).toThrow("Span must be between 0 and 360.");

        expect(function() {
          g.lookAcross([], 1, 361);
        }).toThrow("Span must be between 0 and 360.");
      });
    });

    it('should return objs directly in front and behind w/ 360 span', function() {
      obj1.pos = { x:4, y:2 };
      obj2.pos = { x:4, y:6 };
      updateObjs(sm, [obj1, obj2]);
      var endpoints = g.lookAcross([obj1, obj2], 0, 360);
      expect(endpoints[0].obj).toEqual(obj1);
      expect(endpoints[1].obj).toEqual(obj2);
    });

    it('should return objs w/ fov spanning origin (0 degrees - vertical)', function() {
      obj1.pos = { x:3, y:2 };
      obj2.pos = { x:5, y:2 };
      updateObjs(sm, [obj1, obj2]);
      var endpoints = g.lookAcross([obj1, obj2], 0, 100);
      expect(endpoints[0].obj).toEqual(obj1);
      expect(endpoints[1].obj).toEqual(obj2);
    });
  });
});
