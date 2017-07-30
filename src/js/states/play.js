class PlayState extends Phaser.State {
    create() {
        console.log('[play] starting play state');

        // for easy access to this state for debugging in browser console
        window.state = this;

        this.createSounds();
        this.startSim();
        this.drawInitialScene();
        this.initEventHandlers();

        this.introText();
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
            starvation     : new Phaser.Sound(this.game , 'insanity'        , 1.0, true) ,
            heater         : new Phaser.Sound(this.game , 'heater'          , 1.0, true) ,
            heaterOff      : new Phaser.Sound(this.game , 'heater-off'      , 1.0) ,
            generator      : new Phaser.Sound(this.game , 'generator'       , 1.0, true) ,
            generatorEmpty : new Phaser.Sound(this.game , 'generator-empty' , 1.0) ,
            generatorOff   : new Phaser.Sound(this.game , 'generator-off'   , 1.0) ,
        };
    }

    introText() {
        this.createTextBubble({
            text: 'High atop a mountain peak\nin orange light\nhe dreamed',
            speed: 40,
        });
    }

    createTextBubble({ text='NO TEXT', speed=15, x=70, y=400, callback=_.noop }={}) {
        const textObj = this.game.add.text(
            0,
            0,
            '',
            {
                // https://photonstorm.github.io/phaser-ce/Phaser.Text.html
                font: '24px monospace',
                fill: '#4793D1',
                backgroundColor: '#060C18',
                // boundsAlignH: 'center',
                // boundsAlignV: 'middle',
                wordWrap: true,
                wordWrapWidth: 500,
            }
        );
        textObj.position.set(x, y);

        let i = 0;
        const typing = this.game.time.events.repeat(
            speed,
            text.length,
            () => {
                textObj.setText(text.substr(0, i+1));
                i += 1;
            },
            this
        );

        this.simPaused = true;

        textObj.inputEnabled = true;
        textObj.events.onInputDown.add(() => {
            textObj.destroy(true);
            this.simPaused = false;
            callback.call(this);
        }, this);

        return textObj;
    }

    startSim() {
        this.sim = new Sim();
        this.sim.print();

        this.winTimer = this.game.time.events.add(config.WIN_TIME, this.win, this);

        this.simLoop = this.game.time.events.loop(
            1 * Phaser.Timer.SECOND,
            this.updateSim,
            this
        );
    }

    win() {
        this.createTextBubble({
            text: 'A warm front blows in.  Winter is over, and you have survived!',
            speed: 40,
            callback: this.toMenu,
        });
    }

    toMenu() {
        this.game.stateTransition.to('MenuState');
    }

    updateSim() {
        if (this.simPaused) return;

        // get the names of any actions that failed due to violating config.BOUNDS
        const { violations, stateChange } = this.sim.update();
        const violationProps = _.map(violations, 'prop');

        if (this.sim.state.deathCauses.length) {
            this.deathBy(this.sim.state.deathCauses);
        }

        this.meterNames.forEach(meter => this.updateMeter(meter));

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
            Phaser.Easing.Cubic.Out
        );
        tween.start();
    }

    startHeater() {
        this.sounds.heater.play();

        this.heaterOnTween = this.game.add.tween(this.sprites.heaterOn);
        this.heaterOnTween.to({ alpha: 1 }, 1 * Phaser.Timer.SECOND, Phaser.Easing.Bounce.In);
        this.heaterOnTween.start();

        this.heaterGlowTween = this.game.add.tween(this.sprites.heaterGlow);
        this.heaterGlowTween.to({ alpha: 1 }, 1 * Phaser.Timer.SECOND, Phaser.Easing.Bounce.In);
        this.heaterGlowTween.start();

        this.heaterGlowTween.onComplete.add(() => {
            this.heaterFlickerTween = this.game.add.tween(this.sprites.heaterGlow);
            this.heaterFlickerTween.to(
                {
                    alpha: 0.7
                },
                1 * Phaser.Timer.SECOND,
                Phaser.Easing.Bounce.In,
                true,
                0,
                -1,
                true
            );
            this.heaterFlickerTween.start();
        }, this);
    }

    stopHeater() {
        this.sounds.heater.stop();
        this.sounds.heaterOff.play();

        try {
            // try/catch because these tweens may not exist
            this.heaterOnTween.stop();
            this.heaterGlowTween.stop();
            this.heaterFlickerTween.stop();
        } catch(e) {}

        const heaterOffTween = this.game.add.tween(this.sprites.heaterOn);
        heaterOffTween.to({ alpha: 0 }, 2 * Phaser.Timer.SECOND, Phaser.Easing.Bounce.In);
        heaterOffTween.start();

        const heaterGlowOffTween = this.game.add.tween(this.sprites.heaterGlow);
        heaterGlowOffTween.to({ alpha: 0 }, 1 * Phaser.Timer.SECOND, Phaser.Easing.Bounce.In);
        heaterGlowOffTween.start();
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
        if (this.sounds.starvation.isPlaying) {
            this.sounds.starvation.stop();
        }

        let message = '';
        // for simplicity only mention the first cause of death
        switch (causes[0]) {
            case 'warmth':
                message = 'The last remnant of warmth leaves your body.  Your role in the grand convection of the universe has ended.';
                break;
            case 'hunger':
                message = 'Your stomch feels oddly calm, even as your strength fails.  You slip first into a deep sleep, then drift away.';
                break;
            default:
                message = 'DIED BUT NO MESSAGE WAS GIVEN';
        }
        this.createTextBubble({
            text: message,
            speed: 40,
            callback: this.toMenu,
        });
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
        this.sprites.cupboard   = this.game.add.sprite(116, 183, 'cupboard');
        this.sprites.fuel       = this.game.add.sprite(484, 319, 'fuel');
        this.sprites.generator  = this.game.add.sprite(1285, 239, 'generator');
        this.sprites.heater     = this.game.add.sprite(0, 0, 'heater');
        this.sprites.heaterOn   = this.game.add.sprite(0, 0, 'heater-on');
        this.sprites.heaterGlow = this.game.add.sprite(0, 0, 'heater-glow');
        this.sprites.you        = this.game.add.sprite(262, 275, 'you');

        // put stuff in cabin
        this.cabinGroup = this.game.add.group();
        this.cabinGroup.position.set(665, 448);
        this.cabinGroup.addChild(this.sprites.cabin);
        this.cabinGroup.addChild(this.sprites.heater);
        this.cabinGroup.addChild(this.sprites.heaterOn);
        this.cabinGroup.addChild(this.sprites.heaterGlow);
        this.cabinGroup.addChild(this.sprites.fuel);
        this.cabinGroup.addChild(this.sprites.you);
        this.cabinGroup.addChild(this.sprites.cupboard);

        this.sprites.heater.anchor.set(0.5, 0.5);
        this.sprites.heater.position.set(117, 361);
        this.sprites.heaterOn.anchor.set(0.5, 0.5);
        this.sprites.heaterOn.position.set(117, 361);
        this.sprites.heaterGlow.position.set(-29, 17);

        // hide heater on sprites
        this.sprites.heaterOn.alpha = 0;
        this.sprites.heaterGlow.alpha = 0;

        // meter sprites
        this.meterGroup = this.game.add.group();
        // add meters to group
        this.meterNames = [/*'sanity',*/ 'hunger', 'food', 'warmth', 'fuelInUse', 'fuelReserve'];
        this.meterNames.forEach(meterName => {
            const sprite = this.game.add.sprite(0, 0, 'meter');
            this.sprites[`${meterName}Meter`] = sprite;
            sprite.anchor.set(1, 1);
            sprite.alpha = 0.5;
            this.meterGroup.addChild(sprite);
        });
        // add meter labels
        this.meterNames.forEach(meterName => {
            const text = this.game.add.text(
                0,
                0,
                meterName.toUpperCase(),
                {
                    // https://photonstorm.github.io/phaser-ce/Phaser.Text.html
                    font: 'bold 16px monospace',
                    fill: '#4793D1',
                }
            );
            text.anchor.set(1, 1);
            this.meterGroup.addChild(text);
        });
        this.meterGroup.align(this.meterNames.length, 2, 70, 30, Phaser.BOTTOM_CENTER);
        this.meterGroup.position.set(
            this.game.world.width - 60 - this.meterGroup.width,
            this.game.world.height - 60 - this.meterGroup.height
            // this.game.world.centerX, this.game.world.centerY
        );

        _.each(this.sprites, sprite => {
            // sprite.inputEnabled = true;
            // sprite.input.enableDrag(true);
            // sprite.events.onDragStop.add(() => console.log(`${sprite.x}, ${sprite.y}`));
        });
        this.sprites.heater.inputEnabled = true;
        this.sprites.generator.inputEnabled = true;
        this.sprites.cupboard.inputEnabled = true;
        this.sprites.fuel.inputEnabled = true;
        this.sprites.you.inputEnabled = true;
        this.sprites.cabin.inputEnabled = true;

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

        // highlight meters when hovering over certain sprites
        this.sprites.generator.events.onInputOver.add(() => { this.sprites.fuelInUseMeter.alpha = 1 })
        this.sprites.generator.events.onInputOut.add(() => { this.sprites.fuelInUseMeter.alpha = 0.5 })
        this.sprites.fuel.events.onInputOver.add(() => { this.sprites.fuelReserveMeter.alpha = 1 })
        this.sprites.fuel.events.onInputOut.add(() => { this.sprites.fuelReserveMeter.alpha = 0.5 })
        this.sprites.fuel.events.onInputOver.add(() => { this.sprites.fuelInUseMeter.alpha = 1 })
        this.sprites.fuel.events.onInputOut.add(() => { this.sprites.fuelInUseMeter.alpha = 0.5 })
        this.sprites.heater.events.onInputOver.add(() => { this.sprites.warmthMeter.alpha = 1 })
        this.sprites.heater.events.onInputOut.add(() => { this.sprites.warmthMeter.alpha = 0.5 })
        this.sprites.cupboard.events.onInputOver.add(() => { this.sprites.foodMeter.alpha = 1 })
        this.sprites.cupboard.events.onInputOut.add(() => { this.sprites.foodMeter.alpha = 0.5 })
        this.sprites.cupboard.events.onInputOver.add(() => { this.sprites.hungerMeter.alpha = 1 })
        this.sprites.cupboard.events.onInputOut.add(() => { this.sprites.hungerMeter.alpha = 0.5 })

    }
}
