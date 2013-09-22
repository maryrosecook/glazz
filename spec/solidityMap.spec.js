var SolidityMap = require('../src/solidityMap').SolidityMap;
var _ = require("Underscore");

describe('solidity map', function() {
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

  var sm;
  beforeEach(function () {
    sm = new SolidityMap(5, 5);
  });

  describe('creation', function() {
    it('should be able to create SM of specified size', function() {
      expect(sm.sm.length).toEqual(5);
      expect(sm.sm[0].length).toEqual(5);
      _.map(_.flatten(sm.sm), function(x) {
        expect(x).toEqual(0);
      });
    });

    it('should require width and height > 0', function() {
      expect(function() {
        new SolidityMap();
      }).toThrow("SM width must be > 0.");

      expect(function() {
        new SolidityMap(1);
      }).toThrow("SM height must be > 0.");

      expect(function() {
        new SolidityMap(0);
      }).toThrow("SM width must be > 0.");

      expect(function() {
        new SolidityMap(1, 0);
      }).toThrow("SM height must be > 0.");
    });
  });

  describe('update', function() {
    it('should be able to update a central section', function() {
      sm.update({ x:2, y:3 }, { x:3, y:2 }, 1);
      expect(sm.sm).toEqual([[0, 0, 0, 0, 0],
                             [0, 0, 0, 0, 0],
                             [0, 0, 0, 0, 0],
                             [0, 0, 1, 1, 1],
                             [0, 0, 1, 1, 1]]);
    });

    it('should complain if try to start update outside sm', function() {
      expect(function() {
        sm.update({ x:-1, y:3 }, { x:1, y:1 }, 1);
      }).toThrow("Section to update falls outside map.");
    });

    it('should complain if update section extends outside sm', function() {
      expect(function() {
        sm.update({ x:0, y:3 }, { x:50, y:1 }, 1);
      }).toThrow("Section to update falls outside map.");
    });

    it('should be able to cope w/ fp input', function() {
      sm.update({ x:2.1, y:3.1 }, { x:3.1, y:2.1 }, 1);
      expect(sm.sm).toEqual([[0, 0, 0, 0, 0],
                             [0, 0, 0, 0, 0],
                             [0, 0, 0, 0, 0],
                             [0, 0, 1, 1, 1],
                             [0, 0, 1, 1, 1]]);
    });
  });

  describe('getArea', function() {
    it('should be able to get a central section', function() {
      sm.update({ x:2, y:3 }, { x:3, y:2 }, 1);
      expect(sm.getArea({ x:1, y:2 }, { x:4, y:3 }))
        .toEqual([[0, 0, 0, 0],
                  [0, 1, 1, 1],
                  [0, 1, 1, 1]]);
    });

    it('should complain if try to start outside sm', function() {
      expect(function() {
        sm.getArea({ x:-1, y:2 }, { x:4, y:3 })
      }).toThrow("Section to get falls outside map.");
    });

    it('should complain if update section extends outside sm', function() {
      expect(function() {
        sm.getArea({ x:0, y:3 }, { x:50, y:1 })
      }).toThrow("Section to get falls outside map.");
    });

    it('should be able to cope w/ fp input', function() {
      sm.update({ x:2, y:3 }, { x:3, y:2 }, 1);
      sm.getArea({ x:2.1, y:3.1 }, { x:3.1, y:2.1 })
      expect(sm.sm).toEqual([[0, 0, 0, 0, 0],
                             [0, 0, 0, 0, 0],
                             [0, 0, 0, 0, 0],
                             [0, 0, 1, 1, 1],
                             [0, 0, 1, 1, 1]]);
    });
  });

  describe('updateWithObj', function() {
    var obj;
    beforeEach(function () {
      obj = new Obj();
      obj.pos = { x:2, y:3 };
      obj.size = { x:3, y:2 };
    });

    it('should be able to update w/ an obj made for Glazz', function() {
      sm.updateWithObj(obj);
      expect(sm.sm).toEqual([[0, 0, 0, 0, 0],
                             [0, 0, 0, 0, 0],
                             [0, 0, 0, 0, 0],
                             [0, 0, 1, 1, 1],
                             [0, 0, 1, 1, 1]]);
    });

    it('should be able to cope w/ fp input', function() {
      sm.updateWithObj(obj);
      expect(sm.sm).toEqual([[0, 0, 0, 0, 0],
                             [0, 0, 0, 0, 0],
                             [0, 0, 0, 0, 0],
                             [0, 0, 1, 1, 1],
                             [0, 0, 1, 1, 1]]);
    });
  });
      expect(sm.sm).toEqual([[0, 0, 0, 0, 0],
                             [0, 0, 0, 0, 0],
                             [0, 0, 0, 0, 0],
                             [0, 0, 1, 1, 1],
                             [0, 0, 1, 1, 1]]);
    });
  });

  describe('get', function() {
    it('should get material in correct sm cell', function() {
      sm.update({ x:2, y:3 }, { x:3, y:2 }, 1);
      expect(sm.get({ x:1, y:1 })).toEqual(0);
      expect(sm.get({ x:4, y:4 })).toEqual(1);
    });

    it('should throw if try to get cell w/ x outside sm', function() {
      expect(function() {
        sm.get({ x:1, y:50 });
      }).toThrow("Cell to get is outside sm.");
    });

    it('should throw if try to get cell w/ x outside sm', function() {
      expect(function() {
        sm.get({ x:50, y:1 });
      }).toThrow("Cell to get is outside sm.");
    });
  });


  describe('clearMaterial', function() {
    it('should be able to clear all material from sm', function() {
      sm.update({ x:0, y:0 }, { x:2, y:2 }, 1);
      sm.update({ x:2, y:2 }, { x:3, y:3 }, 1);
      expect(sm.sm).toEqual([[1, 1, 0, 0, 0],
                             [1, 1, 0, 0, 0],
                             [0, 0, 1, 1, 1],
                             [0, 0, 1, 1, 1],
                             [0, 0, 1, 1, 1]]);

      sm.clearMaterial(1);
      _.map(_.flatten(sm.sm), function(x) {
        expect(x).toEqual(0);
      });
    });

    it('should not fuck up if no instances of requested material', function() {
      sm.clearMaterial(1);
      _.map(_.flatten(sm.sm), function(x) {
        expect(x).toEqual(0);
      });
    });

    it('should only clear requested material from sm', function() {
      sm.update({ x:0, y:0 }, { x:2, y:2 }, 1);
      sm.update({ x:2, y:2 }, { x:3, y:3 }, 2);
      expect(sm.sm).toEqual([[1, 1, 0, 0, 0],
                             [1, 1, 0, 0, 0],
                             [0, 0, 2, 2, 2],
                             [0, 0, 2, 2, 2],
                             [0, 0, 2, 2, 2]]);

      sm.clearMaterial(1);
      expect(sm.sm).toEqual([[0, 0, 0, 0, 0],
                             [0, 0, 0, 0, 0],
                             [0, 0, 2, 2, 2],
                             [0, 0, 2, 2, 2],
                             [0, 0, 2, 2, 2]]);
    });
  });
});
