;(function() {
  function Amp() {
    this.listeners = {}; // holds arrays of listeners, keyed on soundType
  };

  Amp.prototype = {
    addListener: function(actor, soundType, response) {
      if(this.listeners[soundType] === undefined)
        this.listeners[soundType] = {};

      this.listeners[soundType][actor.id] = { actor: actor, response: response };
    },

    removeListener: function(actor, soundType) {
      for(var key in this.listeners[soundType])
        if(key == actor.id)
          delete this.listeners[soundType][key];
    },

    // make a sound that will be picked up by listeners
    sound: function(soundType, soundData) {
      if(this.listeners[soundType] !== undefined) {
        for(var key in this.listeners[soundType])
        {
          var actor = this.listeners[soundType][key].actor;
          var response = this.listeners[soundType][key].response;
          response.call(actor, soundData);
        }
      }
    }
  };

  this.Amp = Amp;
}).call(this);