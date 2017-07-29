class PlayState extends Phaser.State {
    create() {
        console.log('[play] starting play state');

        // for easy access to this state for debugging in browser console
        window.state = this;
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
}
