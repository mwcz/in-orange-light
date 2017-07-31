class MenuState extends Phaser.State {

    create() {
        console.log('[menu] showing main menu');

        window.state = this;

        if (config.AUTO_PLAY) {
            this.next();
        }

        const bg = this.game.add.sprite(0, 0, 'backdrop');
        bg.tint = 0x7f7f7f;

        const logoOff = this.game.add.sprite(this.game.world.centerX, 160, 'logo-off');
        logoOff.anchor.set(0.5, 0.5);

        const logoOn = this.game.add.sprite(this.game.world.centerX, 160, 'logo-on');
        logoOn.anchor.set(0.5, 0.5);
        logoOn.alpha = 0;

        this.heaterGlowTween = this.game.add.tween(logoOn);
        this.heaterGlowTween.to({ alpha: 1 }, 2 * Phaser.Timer.SECOND, Phaser.Easing.Bounce.In);
        this.heaterGlowTween.start();

        this.heaterGlowTween.onComplete.add(() => {
            this.heaterFlickerTween = this.game.add.tween(logoOn);
            this.heaterFlickerTween.to(
                {
                    alpha: 0.5
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

        const playOff = this.game.add.sprite(this.game.world.centerX, this.game.world.height - 250, 'play-off');
        playOff.anchor.set(0.5, 0.5);

        this.playOn = this.game.add.sprite(this.game.world.centerX, this.game.world.height - 250, 'play-on');
        this.playOn.anchor.set(0.5, 0.5);
        this.playOn.alpha = 0;
        this.playOn.inputEnabled = true;
        this.playOn.input.useHandCursor = true;
        this.playOn.events.onInputDown.add(this.next, this);

        this.heaterSound = new Phaser.Sound(this.game, 'heater', 1.0, true);
        this.heaterOffSound = new Phaser.Sound(this.game, 'heater-off', 1.0);
        this.heaterSound.volume = 0;
        this.heaterSound.play();
        this.heaterOffSound.play();
    }

    update() {
        const mouseDist = Phaser.Point.distance(this.playOn.position, this.game.input);
        // console.log(mouseDist);
        const closeness = 1 - mouseDist/600;
        this.playOn.alpha = closeness;
        this.heaterSound.volume = closeness;
    }

    next() {
        this.game.stateTransition.to('PlayState');
    }

    shutdown() {
        this.heaterSound.stop();
        this.heaterOffSound.stop();
    }

}
