class MenuState extends Phaser.State {

    create() {
        console.log('[menu] showing main menu');

        window.state = this;

        if (config.AUTO_PLAY) {
            this.next();
        }

        this.music = this.game.add.audio('MenuMusic', 0.7, true);
        this.music.play();

        const bg = this.game.add.sprite(0, 0, 'backdrop');
        bg.tint = 0x3f3f3f;

        const logoOff = this.game.add.sprite(this.game.world.centerX, 150, 'logo-off');
        logoOff.anchor.set(0.5, 0.5);

        const logoOn = this.game.add.sprite(this.game.world.centerX, 150, 'logo-on');
        logoOn.anchor.set(0.5, 0.5);
        logoOn.alpha = 0;

        this.heaterGlowTween = this.game.add.tween(logoOn);
        this.heaterGlowTween.to({ alpha: 1 }, 2 * Phaser.Timer.SECOND, Phaser.Easing.Bounce.In);
        this.heaterGlowTween.start();

        this.heaterGlowTween.onComplete.add(() => {
            this.heaterFlickerTween = this.game.add.tween(logoOn);
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

        const btnHum = this.game.add.button(
            this.game.world.centerX,
            this.game.world.height - 130,
            'logo',
            this.next,
            this,
            1, // over
            0, // out
            2  // down
        );
        btnHum.anchor.set(0.5, 1);
        btnHum.input.useHandCursor = false;
    }

    update() {
    }

    next() {
        this.game.stateTransition.to('PlayState');
    }

    shutdown() {
        this.music.stop();
    }

}
