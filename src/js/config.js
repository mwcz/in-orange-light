const config = Object.freeze({

    AUTO_PLAY: true,

    // canvas resolution
    CANVAS_WIDTH: 1600,
    CANVAS_HEIGHT: 1200,

    INITIAL_STATE: {
        alive       : true,
        lamp        : false,
        generator   : false,
        heater      : false,
        deathCauses : [],
        food        : 50,
        warmth      : 50,
        warmthSlope : -1,
        sanity      : 50,
        sanitySlope : 0,
        fuelReserve : 10,
        fuelInUse   : 10,
        fuelSlope   : 0,
        hunger      : 0,
        hungerSlope : 1,
    },

    // how low or high state values are allowed to go
    BOUNDS: {
        food: [0, Infinity],
        warmth: [0, 100],
        sanity: [0, Infinity],
        fuelReserve: [0, Infinity],
        fuelInUse: [0, 100],
        hunger: [-Infinity, 100],
        fuelSlope: [-Infinity, Infinity],
        sanitySlope: [-Infinity, Infinity],
        warmthSlope: [-Infinity, Infinity],
        hungerSlope: [-Infinity, Infinity],
    },

    // the names of the props that can cause death when out of bounds
    DEATH_CAUSES: [ 'hunger', 'sanity', 'warmth' ],

    // for each sim state change (like "eat food"), update following values
    STATE_CHANGES: {
        update: {
            hunger      : function() { return this.state.hungerSlope },
            sanity      : function() { return this.state.sanitySlope },
            warmth      : function() { return this.state.warmthSlope },
            fuelInUse   : function() { return this.state.fuelSlope },
            hungerSlope : 1, // hunger increases exponentially
        },
        eatFood: {
            hunger      : -1,
            hungerSlope : -10,
            food        : -1,
            sanity      : 1,
            sanitySlope : 1,
        },
        refuelGenerator: {
            fuelReserve : -1,
            fuelInUse   : 1,
            sanity      : 1,
            sanitySlope : 1,
        },
        heaterOn: {
            heater      : true,
            warmthSlope : 3,
            sanitySlope : 1,
        },
        heaterOff: {
            heater      : false,
            warmthSlope : -3,
            sanitySlope : -1,
        },
        generatorOn: {
            generator   : true,
            sanitySlope : 1,
            fuelSlope   : -1,
        },
        generatorOff: {
            generator   : false,
            sanitySlope : -1,
            fuelSlope   : 1,
        },
        lampOn: {
            lamp        : true,
            sanitySlope : 1,
        },
        lampOff: {
            lamp        : false,
            sanitySlope : -1,
        },
    }

});
