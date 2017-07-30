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

        this.updateMeter('hunger');
        this.updateMeter('sanity');
        this.updateMeter('warmth');

        // if generator is on and fuel tank is empty
        const tankEmpty = this.sim.state.fuelInUse <= config.BOUNDS.fuelInUse[0];
        const generatorOn = this.sim.state.generator;
        if (tankEmpty && generatorOn) {
            this.sim.toggleGenerator();
            this.sim.toggleHeater();
            this.stopHeater();
            this.stopGenerator(true);
        }
    }

    updateMeter(name) {
        const tween = this.game.add.tween(this.sprites[`${name}Meter`]);
        tween.to(
            {
                height: config.METER_HEIGHT * Math.max(0, Math.min(this.sim.state[name], 100)) / Math.min(config.BOUNDS[name][1], 100)
            },
            config.SIM_UPDATE_FREQUENCY,
            Phaser.Easing.Elastic.Out
        );
        tween.start();
    }

    startHeater() {
        this.sounds.heater.play();
        const heaterOnTween = this.game.add.tween(this.sprites.heaterOn);
        heaterOnTween.to({ alpha: 1 }, 1 * Phaser.Timer.SECOND, Phaser.Easing.Bounce.In);
        heaterOnTween.start();
    }

    stopHeater() {
        this.sounds.heater.stop();
        this.sounds.heaterOff.play();
        const heaterOffTween = this.game.add.tween(this.sprites.heaterOn);
        heaterOffTween.to({ alpha: 0 }, 2 * Phaser.Timer.SECOND, Phaser.Easing.Bounce.In);
        heaterOffTween.start();
    }

    startGenerator() {
        this.sounds.generator.play();
    }

    stopGenerator(outOfFuel) {
        this.sounds.generator.stop();
        if (outOfFuel) {
            this.sounds.generatorEmpty.play();
        }
        else {
            this.sounds.generatorOff.play();
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
        this.sprites.mountain4  = this.game.add.sprite(0, 0, 'mountain4');
        this.sprites.mountain3  = this.game.add.sprite(0, 0, 'mountain3');
        this.sprites.mountain2  = this.game.add.sprite(0, 0, 'mountain2');
        this.sprites.mountain1  = this.game.add.sprite(0, 0, 'mountain1');
        this.sprites.mountain   = this.game.add.sprite(0, 0, 'mountain');
        this.sprites.cabin      = this.game.add.sprite(0, 0, 'cabin');
        this.sprites.cupboard   = this.game.add.sprite(0, 0, 'cupboard');
        this.sprites.fuel       = this.game.add.sprite(0, 0, 'fuel');
        this.sprites.generator  = this.game.add.sprite(1285, 204, 'generator');
        this.sprites.heater     = this.game.add.sprite(0, 0, 'heater');
        this.sprites.heaterOn   = this.game.add.sprite(0, 0, 'heater-on');
        this.sprites.heaterGlow = this.game.add.sprite(0, 0, 'heater-glow');
        this.sprites.you        = this.game.add.sprite(0, 0, 'you');
        this.sprites.chair      = this.game.add.sprite(0, 0, 'chair');

        // put stuff in cabin
        this.cabinGroup = this.game.add.group();
        this.cabinGroup.position.set(710, 400);
        this.cabinGroup.addChild(this.sprites.cabin);
        this.cabinGroup.addChild(this.sprites.heater);
        this.cabinGroup.addChild(this.sprites.heaterOn);
        this.cabinGroup.addChild(this.sprites.heaterGlow);
        this.cabinGroup.addChild(this.sprites.fuel);
        this.cabinGroup.addChild(this.sprites.you);
        this.cabinGroup.addChild(this.sprites.chair);
        this.cabinGroup.addChild(this.sprites.cupboard);

        this.sprites.heater.anchor.set(0.5, 0.5);
        this.sprites.heater.position.set(102, 346);
        this.sprites.heaterOn.anchor.set(0.5, 0.5);
        this.sprites.heaterOn.position.set(102, 346);

        // hide heater on sprites
        this.sprites.heaterOn.alpha = 0;
        this.sprites.heaterGlow.alpha = 0;

        // meter sprites
        this.sprites.sanityMeter = this.game.add.sprite(this.game.world.width - 20,  this.game.world.height - 20, 'meter');
        this.sprites.hungerMeter = this.game.add.sprite(this.game.world.width - 70,  this.game.world.height - 20, 'meter');
        this.sprites.warmthMeter = this.game.add.sprite(this.game.world.width - 120, this.game.world.height - 20, 'meter');
        this.sprites.sanityMeter.width = 40;
        this.sprites.hungerMeter.width = 40;
        this.sprites.warmthMeter.width = 40;
        this.sprites.sanityMeter.anchor.set(1, 1);
        this.sprites.hungerMeter.anchor.set(1, 1);
        this.sprites.warmthMeter.anchor.set(1, 1);

        _.each(this.sprites, sprite => {
            // sprite.inputEnabled = true;
            // sprite.input.enableDrag(true);
            // sprite.events.onDragStop.add(() => console.log(`${sprite.x}, ${sprite.y}`));
        });
        this.sprites.heater.inputEnabled = true;
        this.sprites.generator.inputEnabled = true;
        this.sprites.cupboard.inputEnabled = true;

        // position the sprites individually
        ['', '1', '2', '3', '4'].forEach(num => {
            const sprite = this.sprites[`mountain${num}`]
            sprite.anchor.set(1, 1);
            let blurOffset = 0;
            if (num >= 1) {
                blurOffset = 10 * num;
            }
            sprite.position.set(this.game.world.width + blurOffset, this.game.world.height + blurOffset);
        });
    }

    initEventHandlers() {
        // generator handlers
        this.sprites.generator.events.onInputDown.add(this.sim.toggleGenerator, this.sim);
        this.sprites.generator.events.onInputDown.add(() => {
            if (this.sim.state.generator) {
                this.startGenerator();
            }
            else {
                this.stopGenerator(false);
            }
        });

        // heater handlers
        this.sprites.heater.events.onInputDown.add(() => {
            // only turn on heater if generator is on already
            if (this.sim.state.generator) {
                this.sim.toggleHeater();
            }
        }, this.sim);
        this.sprites.heater.events.onInputDown.add(() => {
            if (this.sim.state.heater) {
                this.startHeater();
            }
            else {
                this.stopHeater();
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
