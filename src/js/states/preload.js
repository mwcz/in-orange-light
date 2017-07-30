class PreloadState extends Phaser.State {
    preload() {
        console.log('[preload] preloading assets');

        // loading bar

        this.loadingBar = this.game.add.sprite(config.CANVAS_WIDTH/2 - 300, this.game.world.centerY, 'loading-bar');
        this.load.setPreloadSprite(this.loadingBar);
        this.loadingBar.anchor.set(0, 0.5);

        const assetManifest = {
            image: [
                ['logo-on', 'images/logo-on.png'],
                ['logo-off', 'images/logo-off.png'],
                ['play-on', 'images/play-on.png'],
                ['play-off', 'images/play-off.png'],
                ['background', 'images/background.png'],
                ['sky', 'images/sky.png'],
                ['backdrop', 'images/backdrop.png'],
                ['cabin', 'images/cabin.png'],
                ['cupboard', 'images/cupboard.png'],
                ['fuel', 'images/fuel.png'],
                ['generator', 'images/generator.png'],
                ['heater', 'images/heater.png'],
                ['heater-on', 'images/heater-on.png'],
                ['heater-glow', 'images/heater-glow.png'],
                ['mountain', 'images/mountain.png'],
                ['mountain1', 'images/mountain1.png'],
                ['mountain2', 'images/mountain2.png'],
                ['mountain3', 'images/mountain3.png'],
                ['mountain4', 'images/mountain4.png'],
                ['smoke', 'images/smoke.png'],
                ['you', 'images/you.png'],
                ['meter', 'images/meter.png'],
            ],
            spritesheet: [
                // ['btn-play', 'images/big/button-play.png', 64*10, 24*10],
            ],
            audio: [
                ['music', 'sounds/melody.wav'],
                ['insanity', 'sounds/insanity.wav'],
                ['refuel', 'sounds/refuel.wav'],
                ['nom', 'sounds/nom.wav'],
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

        // filters

        // this.game.load.script('BlurX', 'https://cdn.rawgit.com/photonstorm/phaser/master/v2/filters/BlurX.js');
        // this.game.load.script('BlurY', 'https://cdn.rawgit.com/photonstorm/phaser/master/v2/filters/BlurY.js');

    }

    create() {
        this.state.start('MenuState');
    }
}

