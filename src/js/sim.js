class Sim {
    constructor() {
        this.state = _.clone(config.INITIAL_STATE);
    }
    eatFood() {
        return this.applyStateChange(config.STATE_CHANGES.eatFood);
    }
    refuelGenerator() {
        return this.applyStateChange(config.STATE_CHANGES.refuelGenerator);
    }
    toggleHeater() {
        if (this.state.heater) {
            return this.applyStateChange(config.STATE_CHANGES.heaterOff);
        }
        else {
            return this.applyStateChange(config.STATE_CHANGES.heaterOn);
        }
    }
    toggleGenerator() {
        if (this.state.generator) {
            return this.applyStateChange(config.STATE_CHANGES.generatorOff);
        }
        else {
            return this.applyStateChange(config.STATE_CHANGES.generatorOn);
        }
    }
    toggleLamp() {
        if (this.state.lamp) {
            return this.applyStateChange(config.STATE_CHANGES.lampOff);
        }
        else {
            return this.applyStateChange(config.STATE_CHANGES.lampOn);
        }
    }
    update(timeScale=1) {
        // // update sanity
        // this.state.sanity += this.state.sanitySlope;

        // // update hunger
        // this.state.hunger += this.state.hungerSlope;

        // // update warmth
        // this.state.warmth += this.state.warmthSlope;
        const violations = this.applyStateChange(config.STATE_CHANGES.update);
        document.querySelector('#debug').textContent = JSON.stringify(this.state, null, 4);
        return violations;
    }
    endLife(deathCauses) {
        // set props to death states
        this.state.alive = false;
        this.state.hunger = 0;
        this.state.sanity = 0;
        this.state.hungerSlope = 0;
        this.state.sanitySlope = 0;
        this.state.deathCauses = deathCauses;

        // left warmth off because corpse still holds heat ~_~
    }
    checkStateChange(stateChange) {
        const violations = [];
        let proceed = true;

        // quit early if already dead
        if (!this.state.alive) {
            return [{ prop: 'alive', currentValue: false, attemptedValue: false, tooHigh: false, tooLow: true }];
        }

        // check each updated prop to be sure it stays within valid bounds
        _.each(
            stateChange,
            (v,k,i) => {
                let change = v;
                if (_.isFunction(v)) {
                    change = v.call(this);
                }

                // skip arithmetic for boolean values
                if (_.isBoolean(v)) {
                    return;
                }

                const newValue = this.state[k] + change;
                if (newValue < config.BOUNDS[k][0]) {
                    violations.push({
                        prop: k,
                        currentValue: this.state[k],
                        attemptedValue: newValue,
                        tooHigh: false,
                        tooLow: true,
                    });
                    proceed = false;
                    // console.log(`[sim] ${k} can't be set to ${newValue}, it is below ${config.BOUNDS[k][0]}`);
                }
                if (newValue > config.BOUNDS[k][1]) {
                    violations.push({
                        prop: k,
                        current: this.state[k],
                        invalid: newValue,
                        tooHigh: true,
                        tooLow: false,
                    });
                    proceed = false;
                    // console.log(`[sim] ${k} can't be set to ${newValue}, it is above ${config.BOUNDS[k][1]}`);
                }
            }
        );
        return violations;
    }
    applyStateChange(stateChange) {
        const violations = this.checkStateChange(stateChange);

        // catch any violations that cause death and react accordingly
        // if any of the props in violations also exist in config.DEATH_CAUSES, die
        const violationProps  = _.map(violations, 'prop');
        const deathCauses = _.intersection(violationProps, config.DEATH_CAUSES);
        if (deathCauses.length) {
            console.log(`[sim] dying due to ${JSON.stringify(deathCauses)}`);
            this.endLife(deathCauses);
        }

        // if all props are still within valid bounds, loop again and apply the new values
        if (violations.length) {
            return violations;
        }
        else {
            console.log(`[sim] applying state change: ${JSON.stringify(stateChange, null, 4)}`)
            _.each(
                stateChange,
                (v,k,i) => {
                    let newValue;
                    let change = v;
                    if (_.isFunction(v)) {
                        change = v.call(this);
                    }

                    if (_.isBoolean(v)) {
                        // if boolean, assign incoming value
                        newValue = change;
                    }
                    else {
                        // if not boolean, add incoming value
                        newValue = this.state[k] + change;
                    }

                    this.state[k] = newValue;
                }
            );
            return [];
        }
    }
    print() {
        console.log(JSON.stringify(this.state, null, 4));
    }
}
