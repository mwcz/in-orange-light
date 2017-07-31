class BootState extends Phaser.State {
    preload() {
        this.game.load.image('loading-bar', 'images/big/loading-bar.png');
    }

    create() {
        console.log('[boot] booting');
        this.state.start('PreloadState');

        // resize the canvas to fit the screen
        this.game.scale.maxWidth = config.CANVAS_WIDTH;
        this.game.scale.maxHeight = config.CANVAS_HEIGHT;
        this.updateCanvasSize();
        window.addEventListener('resize', this.updateCanvasSize.bind(this));

        // Phaser will automatically pause if the browser tab the game is in
        // loses focus. Setting disableVisibilityChange to true disables the
        // auto-pausing.
        this.stage.disableVisibilityChange = true;

        // Initialize the state transition library
        this.game.stateTransition = this.game.plugins.add(Phaser.Plugin.StateTransition);

        this.game.stateTransition.configure({
            duration: 0.618 * Phaser.Timer.SECOND,
            ease: Phaser.Easing.Exponential.Out,
            properties: {
                alpha: 0,
            },
        });

        const credits = document.createElement('div');
        credits.id = 'credits';
        credits.innerHTML = 'Created in 48 hours for the Ludum Dare 39 compo by <a href="https://palebluepixel.org">Michael Clayton</a>.  Worked solo this time, but normally a member of team <a href="http://scripta.co">Scripta</a>.';
        document.body.appendChild(credits);
    }

    updateCanvasSize() {
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.updateLayout();
        console.log(`[boot] resized canvas`);
    }
}
