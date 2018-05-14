class MenuState extends Phaser.State {

    create() {
        console.log('[menu] showing main menu');

        window.state = this;

        if (config.AUTO_PLAY) {
            this.next();
        }
    }

    update() {
    }

    next() {
        this.game.stateTransition.to('PlayState');
    }

    shutdown() {
    }

}
