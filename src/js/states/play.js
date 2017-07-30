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
        _.forEach(this.sounds, sound => sound.stop());
    }

    createSounds() {
        this.sounds = {
            music          : new Phaser.Sound(this.game , 'music'           , 1.0) ,
            starvation     : new Phaser.Sound(this.game , 'insanity'        , 0.0, true) ,
            heater         : new Phaser.Sound(this.game , 'heater'          , 1.5, true) ,
            refuel         : new Phaser.Sound(this.game , 'refuel'          , 1.0) ,
            nom            : new Phaser.Sound(this.game , 'nom'             , 1.0) ,
            heaterOff      : new Phaser.Sound(this.game , 'heater-off'      , 1.0) ,
            generator      : new Phaser.Sound(this.game , 'generator'       , 1.0, true) ,
            generatorEmpty : new Phaser.Sound(this.game , 'generator-empty' , 1.0) ,
            generatorOff   : new Phaser.Sound(this.game , 'generator-off'   , 1.0) ,
        };
        this.sounds.starvation.play();
    }

    introText() {
        this.createTextBubble({
            text: `In a teetering cabin high in the mountains, you attempt to survive the winter.

An aging diesel generator powers a space heater, your only source of warmth.  Cans of food collect dust in the cupboard.  Stay warm and fed, and you might make it to Spring.`,
        });
    }

    createTextBubble({ text='NO TEXT', final=false, speed=15, x=110, y=680, callback=_.noop }={}) {
        const overlaySprite = this.game.add.sprite(0, 0, 'background');
        overlaySprite.inputEnabled = true;
        overlaySprite.alpha = 0.0;
        overlaySprite.tint = 0x1f1f1f;

        if (final) {
            const finalVeil = this.game.add.tween(overlaySprite);
            finalVeil.to({ alpha: 1 }, 12 * Phaser.Timer.SECOND, Phaser.Easing.Cubic.InOut);
            finalVeil.start();
        }

        // clear meter highlighting
        this.meterNames.forEach(meterName => {
            this.sprites[`${meterName}Meter`].alpha = 0.5;
        });

        const textObj = this.game.add.text(
            0,
            0,
            '',
            {
                // https://photonstorm.github.io/phaser-ce/Phaser.Text.html
                font: '24px monospace',
                fill: '#ffffff',
                // backgroundColor: '#070707',
                // boundsAlignH: 'center',
                // boundsAlignV: 'middle',
                wordWrap: true,
                wordWrapWidth: 500,
            }
        );
        textObj.position.set(x, y);
        textObj.inputEnabled = true;
        textObj.blendMode = Phaser.blendModes.SCREEN;

        let i = 0;
        const typing = this.game.time.events.repeat(
            speed,
            text.length,
            () => {
                textObj.setText(text.substr(0, i+1));
                i += 1;

                // to avoid accidental dismissal, don't allow immediately dismissing
                // the text by clicking the overlay until the text printing is
                // complete.
                if (i+1 === text.length) {
                    overlaySprite.events.onInputDown.add(dismiss, this);
                }
            },
            this
        );

        this.simPaused = true;

        const dismiss = () => {
            textObj.destroy(true);
            this.simPaused = false;
            callback.call(this);
            overlaySprite.destroy();
        };

        textObj.events.onInputDown.add(dismiss, this);

        return textObj;
    }

    startSim() {
        this.sim = new Sim();
        this.sim.print();

        this.winTimer = 0;

        this.simLoop = this.game.time.events.loop(
            1 * Phaser.Timer.SECOND,
            this.updateSim,
            this
        );
    }

    win() {
        this.createTextBubble({
            text: 'A warm front blows in from the East.  Winter is over, and you have survived!',
            speed: 40,
            callback: this.toMenu,
        });
    }

    toMenu() {
        this.game.stateTransition.to('MenuState');
    }

    updateSim() {
        if (this.simPaused) return;

        // make win!
        if (this.winTimer >= config.WIN_TIME) {
            this.win();
        }
        this.winTimer += 1;

        // get the names of any actions that failed due to violating config.BOUNDS
        const { violations, stateChange } = this.sim.update();
        const violationProps = _.map(violations, 'prop');

        if (this.sim.state.deathCauses.length) {
            this.deathBy(this.sim.state.deathCauses);
        }

        // update starvation sound
        this.sounds.starvation.volume = Math.max(0, -0.5 + this.sim.state.hunger / config.BOUNDS.hunger[1]);

        this.meterNames.forEach(meter => this.updateMeter(meter));

        // if generator is on and fuel tank is empty
        const tankEmpty = this.sim.state.fuelInUse <= config.BOUNDS.fuelInUse[0];
        const generatorOn = this.sim.state.generator;
        if (tankEmpty && generatorOn) {
            this.sim.toggleGenerator();
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
                message = 'Your empty stomch feels oddly calm, even as your strength fails.  You slip first into a deep sleep, then drift away.';
                break;
            default:
                message = 'DIED BUT NO MESSAGE WAS GIVEN';
        }
        this.createTextBubble({
            text: message,
            speed: 40,
            callback: this.toMenu,
            final: true,
        });
    }

    drawInitialScene() {
        this.sprites = {};

        this.sprites.sky        = this.game.add.sprite(0, 0, 'sky');
        this.sprites.sky2       = this.game.add.sprite(0, 0, 'sky');
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

        // try tinting the main mountain?
        this.skyBMD  = this.game.add.bitmapData(this.sprites.sky.width, this.sprites.sky.height);
        this.skyBMD.draw('sky', 0, 0);
        this.skyBMD.update();
        // this.skyBMD.addToWorld();

        // animate the sky
        this.sprites.sky2.position.y = this.sprites.sky2.height;
        const skyTween = this.game.add.tween(this.sprites.sky);
        skyTween.to(
            { y: -this.sprites.sky.height },
            40 * Phaser.Timer.SECOND,
            Phaser.Easing.Linear.None,
            true,
            0,
            -1
        );
        skyTween.onUpdateCallback(() => {
            const y = Math.floor(Math.abs(-this.sprites.sky.position.y + 1/2*this.game.world.height) % this.sprites.sky.height);
            const color = this.skyBMD.getPixelRGB(20, y).color;
            // console.log(`maybe it is ${y}, ${color}`);
            state.sprites.mountain.tint = color;
            state.sprites.you.tint = color;
            state.sprites.generator.tint = color;
            state.sprites.cupboard.tint = color;
            state.sprites.fuel.tint = color;
        }, this);
        const sky2Tween = this.game.add.tween(this.sprites.sky2);
        sky2Tween.to(
            { y: 0 },
            40 * Phaser.Timer.SECOND,
            Phaser.Easing.Linear.None,
            true,
            0,
            -1
        );
        this.sprites.mountain.tint = 0x000000;
        this.sprites.cabin.tint = 0x3f3f3f;

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
        this.meterNames = [/*'sanity',*/ 'warmth', 'hunger', 'food', 'fuelInUse', 'fuelReserve'];
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

        // add some meter "backgrounds" so you can see the valid range of meters
        this.meterNames.forEach(meterName => {
            const sprite = this.game.add.sprite(0, 0, 'meter');
            sprite.tint = 0x202020;
            sprite.anchor.set(1, 1);
            sprite.height = 100;
            const mainMeter = this.sprites[`${meterName}Meter`];
            sprite.position.copyFrom(mainMeter);
            sprite.position.add(this.meterGroup.position.x, this.meterGroup.position.y);
            sprite.moveDown();
            // sprite.alpha = 0.5;
        });
        // this.meterGroup.bringToTop();

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

        this.sprites.heater.input.useHandCursor = true;

        this.sprites.heater.input.useHandCursor = true;
        this.sprites.generator.input.useHandCursor = true;
        this.sprites.cupboard.input.useHandCursor = true;
        this.sprites.fuel.input.useHandCursor = true;
        this.sprites.you.input.useHandCursor = true;

        // position the sprites individually
        [''].forEach(num => {
            const sprite = this.sprites[`mountain${num}`]
            sprite.anchor.set(1, 1);
            let blurOffset = 0;
            if (num >= 1) {
                blurOffset = 10 * num;
            }
            sprite.position.set(this.game.world.width + blurOffset, this.game.world.height + blurOffset);
        });
        // set blendmode for some sprites
        ['mountain1', 'mountain2', 'mountain3', 'mountain4'].forEach(num => {
            const sprite = this.sprites[num]
            sprite.blendMode = Phaser.blendModes.MULTIPLY;
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
                this.stopHeater();
                this.stopGenerator(false);
            }
        });
        this.sprites.generator.events.onInputDown.add(() => {
            if (this.sim.state.fuelInUse > 0) {
                if (!this.sprites.generator.data.used) {
                    this.sprites.generator.data.used = true;
                    this.createTextBubble({
                        text: `You flip a switch and the generator rewards you with a reassuring rumble.`,
                    });
                }
            }
            else {
                if (!this.sprites.generator.data.usedNoPower) {
                    this.sprites.generator.data.usedNoPower = true;
                    this.createTextBubble({
                        text: `The generator's complaining rumble indicates a lack of fuel.`,
                    });
                }
            }
        }, this.sim);

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
        this.sprites.heater.events.onInputDown.add(() => {
            if (this.sim.state.generator) {
                if (!this.sprites.heater.data.used) {
                    this.sprites.heater.data.used = true;
                    this.createTextBubble({
                        text: `You click on the heater, and the comforting orange glow bathes the cabin in warmth and light.`,
                    });
                }
            }
            else {
                if (!this.sprites.heater.data.usedNoPower) {
                    this.sprites.heater.data.usedNoPower = true;
                    this.createTextBubble({
                        text: `You click on the heater, but without the generator running, there is no power.`,
                    });
                }
            }
        }, this.sim);

        // lamp handlers
        // this.sprites.lamp.events.onInputDown.add(this.sim.toggleLamp, this.sim);

        // cupboard handlers
        this.sprites.cupboard.events.onInputDown.add(this.sim.eatFood, this.sim);
        this.sprites.cupboard.events.onInputDown.add(() => this.sounds.nom.play(), this.sim);
        this.sprites.cupboard.events.onInputDown.add(() => {
            if (!this.sprites.cupboard.data.used) {
                this.sprites.cupboard.data.used = true;
                let text;
                if (this.sim.state.heater) {
                    text = `You pull a can of beans from the cupboard and warm them a bit in front of the heater.\n\nAll things considered, they don't taste half bad.`;
                }
                else {
                    text = `You pull a can from the cupboard and crack it open. The beans inside are nearly frozen. They abate your hunger, though, and provide some scant nourishment.`;
                }
                this.createTextBubble({ text });
            }
        }, this.sim);

        // refuel handlers
        this.sprites.fuel.events.onInputDown.add(() => {
            if (!this.sprites.fuel.data.used) {
                this.sprites.fuel.data.used = true;
                this.createTextBubble({
                    text: 'After trudging up the mountain path, you give the generator a much-needed refueling. On the way back, the door is frozen shut, but you manage to bust it open at the cost of a bruised shoulder.',
                });
            }
        }, this.sim);
        this.sprites.fuel.events.onInputDown.add(this.sim.refuelGenerator, this.sim);
        this.sprites.fuel.events.onInputDown.add(() => {
            this.sounds.refuel.play()
        }, this.sim);

        // you handlers
        this.sprites.you.events.onInputDown.add(() => {
            let text;
            if (this.sim.state.hunger / config.BOUNDS.hunger[1] > 0.9) {
                text = `You feel very hungry.`;
            }
            else if (this.sim.state.warmth <= 2) {
                text = `You are shivering.`;
            }
            else if (this.sim.state.fuelReserve <= 2) {
                text = `Worry over fuel reserves is everpresent in your thoughts.`;
            }
            else if (this.sim.state.hungerSlope < -10) {
                text = `You overdid it a little with the beans.  Ugh.`;
            }
            else {
                text = `You feel lonely.`;
            }
            this.createTextBubble({ text });
        }, this.sim);

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
