class MenuState extends Phaser.State {

    create() {
        console.log('[menu] showing main menu');

        window.state = this;

        if (config.AUTO_PLAY) {
            this.next();
        }

        this.music = this.game.add.audio('MenuMusic', 0.7, true);
        this.music.play();

        const bg = this.game.add.sprite(0, 0, 'background');
        bg.tint = 0x3f3f3f;

        const logo = this.game.add.sprite(this.game.world.centerX, 120, 'logo');
        logo.anchor.set(0.5, 0);
        logo.scale.set(0.96, 0.96);

        const btnHum = this.game.add.button(
            this.game.world.centerX,
            this.game.world.height - 130,
            'btn',
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
