class PlayState extends Phaser.State {
    create() {
        console.log('[play] starting play state');

        // for easy access to this state for debugging in browser console
        window.state = this;

        this.drawInitialScene();
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

    drawInitialScene() {
        this.sprites = {};

        const y = 0;

        this.sprites.sky        = this.game.add.sprite(0, y, 'sky');
        this.sprites.sky2       = this.game.add.sprite(0, y, 'sky');
        this.sprites.mountain4  = this.game.add.sprite(0, y, 'mountain4');
        this.sprites.mountain3  = this.game.add.sprite(0, y, 'mountain3');
        this.sprites.mountain2  = this.game.add.sprite(0, y, 'mountain2');
        this.sprites.mountain1  = this.game.add.sprite(0, y, 'mountain1');

        // animate the sky
        this.sprites.sky2.position.y = this.sprites.sky2.height + this.sprites.sky2.position.y;
        const skyTween = this.game.add.tween(this.sprites.sky);
        skyTween.to(
            { y: -this.sprites.sky.height },
            4 * Phaser.Timer.SECOND,
            Phaser.Easing.Linear.None,
            true,
            0,
            -1
        );
        const sky2Tween = this.game.add.tween(this.sprites.sky2);
        sky2Tween.to(
            { y },
            4 * Phaser.Timer.SECOND,
            Phaser.Easing.Linear.None,
            true,
            0,
            -1
        );

        ['mountain1', 'mountain2', 'mountain3', 'mountain4'].forEach(num => {
            const sprite = this.sprites[num]
            sprite.blendMode = Phaser.blendModes.MULTIPLY;
        });
    }

}
