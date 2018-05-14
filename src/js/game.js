class Game extends Phaser.Game {
    constructor() {
        super(
            config.CANVAS_WIDTH,
            config.CANVAS_HEIGHT,
            Phaser.AUTO,
            document.querySelector('#iol-sky-demo'),
            null,
            false,
            false
        );

        this.state.add('BootState'      , BootState      , false);
        this.state.add('PreloadState'   , PreloadState   , false);
        this.state.add('MenuState'      , MenuState      , false);
        this.state.add('PlayState'      , PlayState      , false);

        this.forceSingleUpdate = false; // decouple physics from framerate

        this.state.start('BootState');
    }
}
