class PreloadState extends Phaser.State {
    preload() {
        console.log('[preload] preloading assets');

        // loading bar

        this.loadingBar = this.game.add.sprite(config.CANVAS_WIDTH/2 - 300, this.game.world.centerY, 'loading-bar');
        this.load.setPreloadSprite(this.loadingBar);
        this.loadingBar.anchor.set(0, 0.5);

        const assetManifest = {
            image: [
                ['sky', 'images/sky.png'],
                ['mountain', 'images/mountain.png'],
                ['mountain1', 'images/mountain1.png'],
                ['mountain2', 'images/mountain2.png'],
                ['mountain3', 'images/mountain3.png'],
                ['mountain4', 'images/mountain4.png'],
            ],
        };

        _.forEach(assetManifest, (assets, type) => {
            _.forEach(assets, args => this.game.load[type](...args));
        });

        // filters

        // this.game.load.script('BlurX', 'https://cdn.rawgit.com/photonstorm/phaser/master/v2/filters/BlurX.js');
        // this.game.load.script('BlurY', 'https://cdn.rawgit.com/photonstorm/phaser/master/v2/filters/BlurY.js');

    }

    create() {
        this.state.start('PlayState');
    }
}

