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
                ['background', 'images/big/background.png'],
                ['cabin', 'images/big/cabin.png'],
                ['chair', 'images/big/chair.png'],
                ['cupboard', 'images/big/cupboard.png'],
                ['fuel', 'images/big/fuel.png'],
                ['generator', 'images/big/generator.png'],
                ['heater', 'images/big/heater.png'],
                ['mountain', 'images/big/mountain.png'],
                ['smoke', 'images/big/smoke.png'],
                ['you', 'images/big/you.png'],
                ['meter', 'images/meter.png'],
            ],
            spritesheet: [
                // ['btn-play', 'images/big/button-play.png', 64*10, 24*10],
            ],
            audio: [
                ['music', 'sounds/melody.wav'],
                ['insanity', 'sounds/insanity.wav'],
                ['heater', 'sounds/heater.wav'],
                ['heater-off', 'sounds/heater-off.wav'],
                ['generator', 'sounds/generator.wav'],
                ['generator-empty', 'sounds/generator-empty.wav'],
                ['generator-off', 'sounds/generator-off.wav'],
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

