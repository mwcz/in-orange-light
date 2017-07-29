class PlayState extends Phaser.State {
    create() {
        console.log('[play] starting play state');

        // for easy access to this state for debugging in browser console
        window.state = this;

        this.createSounds();
        this.startSim();
        this.drawInitialScene();
        this.initEventHandlers();
    }

    update() {

    }

    render() {
        // this.game.debug.body(this.actors.earth);
        // this.game.debug.body(this.actors.barrier);
        // this.actors.asteroids.forEach(this.game.debug.body.bind(this.game.debug));
        // this.actors.comets.forEach(this.game.debug.body.bind(this.game.debug));
        // this.actors.booms.forEach(this.game.debug.body.bind(this.game.debug));
    }
    shutdown() {
        // _.forEach(this.sounds, sound => sound.stop());
    }

    createSounds() {
        this.sounds = {
            music          : new Phaser.Sound(this.game , 'music'           , 1.0) ,
            insanity       : new Phaser.Sound(this.game , 'insanity'        , 1.0, true) ,
            heater         : new Phaser.Sound(this.game , 'heater'          , 1.0, true) ,
            heaterOff      : new Phaser.Sound(this.game , 'heater-off'      , 1.0) ,
            generator      : new Phaser.Sound(this.game , 'generator'       , 1.0, true) ,
            generatorEmpty : new Phaser.Sound(this.game , 'generator-empty' , 1.0) ,
            generatorOff   : new Phaser.Sound(this.game , 'generator-off'   , 1.0) ,
        };
    }

    startSim() {
        this.sim = new Sim();
        this.sim.print();

        this.simLoop = this.game.time.events.loop(
            1 * Phaser.Timer.SECOND,
            this.updateSim,
            this
        );
    }

    updateSim() {
        // get the names of any actions that failed due to violating config.BOUNDS
        const { violations, stateChange } = this.sim.update();
        const violationProps = _.map(violations, 'prop');

        if (this.sim.state.deathCauses.length) {
            this.deathBy(this.sim.state.deathCauses);
        }

        // if generator is on and fuel tank is empty
        const tankEmpty = this.sim.state.fuelInUse <= config.BOUNDS.fuelInUse[0];
        const generatorOn = this.sim.state.generator;
        if (tankEmpty && generatorOn) {
            this.sim.toggleGenerator();
            this.sounds.generator.stop();
            this.sounds.generatorEmpty.play();
        }
    }

    stopSim() {
        this.simLoop.pendingDelete = true;
    }

    deathBy(causes) {
        this.stopSim();

        // also stop certain sounds
        if (this.sounds.insanity.isPlaying) {
            this.sounds.insanity.stop();
        }
        console.log(`[play] died from ${causes.join()}`);
    }

    drawInitialScene() {
        this.sprites = {};

        this.sprites.background = this.game.add.sprite(0, 0, 'background');
        this.sprites.mountain = this.game.add.sprite(0, 0, 'mountain');
        this.sprites.cabin = this.game.add.sprite(0, 0, 'cabin');
        this.sprites.cupboard = this.game.add.sprite(0, 0, 'cupboard');
        this.sprites.fuel = this.game.add.sprite(0, 0, 'fuel');
        this.sprites.generator = this.game.add.sprite(0, 0, 'generator');
        this.sprites.heater = this.game.add.sprite(0, 0, 'heater');
        this.sprites.you = this.game.add.sprite(0, 0, 'you');
        this.sprites.chair = this.game.add.sprite(0, 0, 'chair');

        _.each(this.sprites, sprite => {
            sprite.inputEnabled = true;
            // sprite.input.enableDrag(true);
            // sprite.events.onDragStop.add(() => console.log(`${sprite.x}, ${sprite.y}`));
        });

        // position the sprites individually
        this.sprites.mountain.anchor.set(1, 1);
        this.sprites.mountain.position.set(this.game.world.width, this.game.world.height);

        this.sprites.cabin.position.set(880, 300);
        this.sprites.generator.position.set(950, 630);
        this.sprites.chair.position.set(1063, 430);
        this.sprites.you.position.set(1047, 408);
        this.sprites.heater.position.set(901, 437);
        this.sprites.cupboard.position.set(954, 382);
        this.sprites.fuel.position.set(1133, 426);
    }

    initEventHandlers() {
        // generator handlers
        this.sprites.generator.events.onInputDown.add(this.sim.toggleGenerator, this.sim);
        this.sprites.generator.events.onInputDown.add(() => {
            if (this.sim.state.generator) {
                this.sounds.generator.play();
            }
            else {
                this.sounds.generator.stop();
                this.sounds.generatorOff.play();
            }
        });

        // heater handlers
        this.sprites.heater.events.onInputDown.add(this.sim.toggleHeater, this.sim);
        this.sprites.heater.events.onInputDown.add(() => {
            if (this.sim.state.heater) {
                this.sounds.heater.play();
            }
            else {
                this.sounds.heater.stop();
                this.sounds.heaterOff.play();
            }
        });

        // lamp handlers
        // this.sprites.lamp.events.onInputDown.add(this.sim.toggleLamp, this.sim);

        // cupboard handlers
        this.sprites.cupboard.events.onInputDown.add(this.sim.eatFood, this.sim);

        // refuel handlers
        this.sprites.fuel.events.onInputDown.add(this.sim.refuelGenerator, this.sim);
    }
}
