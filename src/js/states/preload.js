class PreloadState extends Phaser.State {
    preload() {
        console.log('[preload] preloading assets');

        // loading bar

        this.loadingBar = this.game.add.sprite(config.CANVAS_WIDTH/2 - 300, this.game.world.centerY, 'loading-bar');
        this.load.setPreloadSprite(this.loadingBar);
        this.loadingBar.anchor.set(0, 0.5);

        const assetManifest = {
            image: [
                ['logo', 'images/big/logo.png'],
                ['intro', 'images/big/intro.png'],
                ['game-over', 'images/big/game-over.png'],
                ['playing', 'images/big/playing.png'],
                ['btn', 'images/big/btn.png'],
            ],
            spritesheet: [
                ['btn-play', 'images/big/button-play.png', 64*10, 24*10],
            ],
            audio: [
            ],
        };

        _.forEach(assetManifest, (assets, type) => {
            _.forEach(assets, args => this.game.load[type](...args));
        });

    }

    create() {
        this.state.start('MenuState');
    }
}

