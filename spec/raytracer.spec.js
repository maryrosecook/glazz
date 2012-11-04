var Raytracer = require('../src/raytracer').Raytracer;
var SolidityMap = require('../src/solidityMap').SolidityMap;

describe('raytracer', function() {
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

  var sm, rt, obj;
  beforeEach(function () {
    sm = new SolidityMap(9, 9);
    rt = new Raytracer(sm);
    obj = new Obj();
  });

  describe('setup', function() {
    it('should throw exception if no sm', function() {
      expect(function() {
        new Raytracer();
      }).toThrow("You must provide a solidity map.");
    });
  });

  describe('inside', function() {
    it('should say point inside is inside', function() {
      obj.pos = { x:2, y:3 };
      obj.size = { x:3, y: 4 };
      expect(rt.inside({ x:3, y:4 }, obj.pos, obj.size)).toEqual(true);
    });

    it('should say point on edge is inside', function() {
      obj.pos = { x:2, y:3 };
      obj.size = { x:3, y: 4 };
      expect(rt.inside({ x:5, y:7 }, obj.pos, obj.size)).toEqual(true);
    });

    it('should say point outside is outside', function() {
      obj.pos = { x:2, y:3 };
      obj.size = { x:3, y: 4 };
      expect(rt.inside({ x:1, y:1 }, obj.pos, obj.size)).toEqual(false);
    });
  });

  describe('traversable', function() {
    it('should return true if point outside sm', function() {
      expect(rt.traversable({ x:-1, y:4 })).toEqual(true);
      expect(rt.traversable({ x:20, y:4 })).toEqual(true);
      expect(rt.traversable({ x:3, y:-1 })).toEqual(true);
      expect(rt.traversable({ x:1, y:20 })).toEqual(true);
    });

    it('should return true if material at point is 0', function() {
      expect(rt.traversable({ x:1, y:1 })).toEqual(true);
    });

    it('should return false if material at point is not 0', function() {
      sm.update({ x:1, y:1 }, { x:1, y:1 }, 1);
      expect(rt.traversable({ x:1, y:1 })).toEqual(false);
    });

    it('should return true if material at point not 0 is in overlook array', function() {
      sm.update({ x:1, y:1 }, { x:1, y:1 }, 1);
      expect(rt.traversable({ x:1, y:1 }, [2, 1])).toEqual(true);
    });

    it('should return false if material at point not 0 and not in overlook array', function() {
      sm.update({ x:1, y:1 }, { x:1, y:1 }, 1);
      expect(rt.traversable({ x:1, y:1 }, [2])).toEqual(false);
    });
  });

  describe('getVectorEnd', function() {
    describe('compass vectors', function() {
      it('should return point at right of sm for vector E', function() {
        expect(rt.getVectorEnd({ x:1, y:2 }, { x:1, y:0 })).toEqual({ x:8, y:2 });
      });

      it('should return point at left of sm for vector W', function() {
        expect(rt.getVectorEnd({ x:1, y:2 }, { x:-1, y:0 })).toEqual({ x:0, y:2 });
      });

      it('should return point at bottom of sm for vector S', function() {
        expect(rt.getVectorEnd({ x:1, y:2 }, { x:0, y:1 })).toEqual({ x:1, y:8 });
      });

      it('should return point at top of sm for vector N', function() {
        expect(rt.getVectorEnd({ x:1, y:2 }, { x:0, y:-1 })).toEqual({ x:1, y:0 });
      });

      it('should return bottom right corner of sm for vector SE', function() {
        expect(rt.getVectorEnd({ x:4, y:4 }, { x:1, y:1 })).toEqual({ x:8, y:8 });
      });
    });

    describe('off-kilter vectors', function() {
      it('should return integer point for vector that would produce fp num', function() {
        expect(rt.getVectorEnd({ x:3, y:1 }, { x:1.4, y:1.1 })).toEqual({ x:8, y:6 });
      });
    });

    describe('weird vectors', function() {
      it('should return undefined for vector 0,0', function() {
        expect(rt.getVectorEnd({ x:3, y:1 }, { x:0, y:0 })).toBeUndefined();
      });

      it('should return point at right of sm for huge vector pointing E', function() {
        expect(rt.getVectorEnd({ x:3, y:1 }, { x:1000, y:0 })).toEqual({ x: 8, y:1 });
      });
    });

    describe('weird start points', function() {
      it('should return undefined for start point outside sm', function() {
        expect(rt.getVectorEnd({ x:-1, y:1 })).toBeUndefined();
        expect(rt.getVectorEnd({ x:20, y:1 })).toBeUndefined();
        expect(rt.getVectorEnd({ x:1, y:-1 })).toBeUndefined();
        expect(rt.getVectorEnd({ x:1, y:20 })).toBeUndefined();
      });
    });
  });

  describe('trace', function() {
    describe('basic forwards', function() {
      it('should return undefined when ray does not hit anything', function() {
        expect(rt.trace({ x:1, y:1}, { x:8, y:8 }, [])).toBeUndefined();
      });

      it('should return point that is solid if part way along ray', function() {
        sm.update({ x:1, y:7 }, { x:1, y:1 }, 1);
        expect(rt.trace({ x:1, y:1 }, { x:1, y:8 }, []).point).toEqual({ x:1, y:7 });
      });

      it('should return point that is solid if on end of ray', function() {
        sm.update({ x:1, y:8 }, { x:1, y:1 }, 1);
        expect(rt.trace({ x:1, y:1 }, { x:1, y:8 }, []).point).toEqual({ x:1, y:8 });
      });

      it('should return point that is solid if on start of ray', function() {
        sm.update({ x:1, y:1 }, { x:1, y:1 }, 1);
        expect(rt.trace({ x:1, y:1 }, { x:1, y:8 }, []).point).toEqual({ x:1, y:1 });
      });
    });

    describe('basic backwards', function() {
      it('should return undefined when ray does not hit anything', function() {
        expect(rt.trace({ x:8, y:8}, { x:1, y:1 }, [])).toBeUndefined();
      });

      it('should return point that is solid if part way along ray', function() {
        sm.update({ x:1, y:7 }, { x:1, y:1 }, 1);
        expect(rt.trace({ x:1, y:8 }, { x:1, y:1 }, []).point).toEqual({ x:1, y:7 });
      });

      it('should return point that is solid if on end of ray', function() {
        sm.update({ x:1, y:8 }, { x:1, y:1 }, 1);
        expect(rt.trace({ x:1, y:8 }, { x:1, y:1 }, []).point).toEqual({ x:1, y:8 });
      });

      it('should return point that is solid if on start of ray', function() {
        sm.update({ x:1, y:1 }, { x:1, y:1 }, 1);
        expect(rt.trace({ x:1, y:8 }, { x:1, y:1 }, []).point).toEqual({ x:1, y:1 });
      });
    });

    describe('weird input', function() {
      it('should copy w/ floats for start and end points', function() {
        sm.update({ x:1, y:4 }, { x:1, y:1 }, 1);
        expect(rt.trace({ x:1.1, y:1.1 }, { x:1.1, y:8.1 }, []).point).toEqual({ x:1, y:4 });
      });
    });

    describe('line segment', function() {
      it('should return segment of line up to hit', function() {
        sm.update({ x:1, y:4 }, { x:1, y:1 }, 1);

        var lineOfSight = rt.trace({ x:1, y:1 }, { x:1, y:8 }, []).lineOfSight;
        expect(lineOfSight[0]).toEqual({ x:1, y:1 });
        expect(lineOfSight[1]).toEqual({ x:1, y:2 });
        expect(lineOfSight[2]).toEqual({ x:1, y:3 });
        expect(lineOfSight[3]).toBeUndefined();
      });

      it('should return segment of line up to hit when tracing backwards', function() {
        sm.update({ x:1, y:4 }, { x:1, y:1 }, 1);

        var lineOfSight = rt.trace({ x:1, y:7 }, { x:1, y:1 }, []).lineOfSight;
        expect(lineOfSight[0]).toEqual({ x:1, y:7 });
        expect(lineOfSight[1]).toEqual({ x:1, y:6 });
        expect(lineOfSight[2]).toEqual({ x:1, y:5 });
        expect(lineOfSight[3]).toBeUndefined();
      });
    });

    describe('overlook', function() {
      it('should overlook passed material', function() {
        sm.update({ x:1, y:4 }, { x:1, y:1 }, 1);
        expect(rt.trace({ x:1, y:1 }, { x:1, y:8 }, [1])).toBeUndefined();
      });
    });

    describe('altTraversable', function() {
      it('should use altTraversable if available', function() {
        sm.update({ x:1, y:4 }, { x:1, y:1 }, 1);

        // check behaviour w/ default traversable
        expect(rt.trace({ x:1, y:1 }, { x:1, y:8 }, []).point).toEqual({ x:1, y:4 });

        expect(rt.trace({ x:1, y:1 }, { x:1, y:8 }, [], function() {
          return true;
        })).toBeUndefined();
      });
    });
  });
});
