import Phaser, { Scene } from 'phaser';

export class Game extends Scene
{
    dude: Phaser.GameObjects.Image;
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    player: Phaser.Physics.Arcade.Sprite;
    stars: Phaser.Physics.Arcade.Group;
    platforms: Phaser.Physics.Arcade.StaticGroup;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    bombs: Phaser.Physics.Arcade.Group;
    score: number;
    scoreText: Phaser.GameObjects.Text;

    constructor ()
    {
        super('Game');
    }

    preload ()
    {
        this.load.image('space', 'https://labs.phaser.io/assets/skies/space3.png');
        this.load.image('dude', 'https://labs.phaser.io/assets/sprites/dude.png');
        this.load.image('stars', 'https://labs.phaser.io/assets/sprites/star.png');
        this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
        this.load.spritesheet('player', 'https://labs.phaser.io/assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
        this.load.image('bomb', 'https://labs.phaser.io/assets/sprites/shinyball.png');
    }

    create ()
    {
        // Add the background
        this.background = this.add.image(0, 0, 'space').setOrigin(0, 0).setDisplaySize(this.scale.width, this.scale.height);

        // Add platforms
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'ground').setScale(2, 0.5).refreshBody(); // Thinner platform
        this.platforms.create(600, 400, 'ground').setScale(1, 0.5).refreshBody(); // Thinner platform
        this.platforms.create(50, 250, 'ground').setScale(1, 0.5).refreshBody(); // Thinner platform
        this.platforms.create(750, 220, 'ground').setScale(1, 0.5).refreshBody(); // Thinner platform

        // Add the player (player)
        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        // Add animations
        const animations = [
            { key: 'left', frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }), frameRate: 10, repeat: -1 },
            { key: 'turn', frames: [ { key: 'player', frame: 4 } ], frameRate: 20 },
            { key: 'right', frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }), frameRate: 10, repeat: -1 }
        ];

        animations.forEach(anim => {
            this.anims.create(anim);
        });

        // Add stars
        this.stars = this.physics.add.group({
            key: 'stars',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        this.stars.children.iterate((child: Phaser.GameObjects.GameObject) => {
            const star = child as Phaser.Physics.Arcade.Sprite;
            star.setScale(0.3); // Scale down the stars
            star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
            return null;
        });

        // Add bombs
        this.bombs = this.physics.add.group();

        // Initialize score
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            fill: '#ffffff'
        });

        // Add collision detection
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.player, this.stars, (player, star) => {
            (star as Phaser.Physics.Arcade.Sprite).disableBody(true, true);

            // Update score
            this.score += 10;
            this.scoreText.setText('Score: ' + this.score);
        });
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, undefined, this);

        // Add input controls
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }
    }

    update ()
    {
        if (this.cursors)
        {
            if (this.cursors.left?.isDown)
            {
                this.player.setVelocityX(-160);
                this.player.anims.play('left', true);
            }
            else if (this.cursors.right?.isDown)
            {
                this.player.setVelocityX(160);
                this.player.anims.play('right', true);
            }
            else
            {
                this.player.setVelocityX(0);
                this.player.anims.play('turn');
            }

            if (this.cursors.up?.isDown && this.player.body?.touching.down)
            {
                this.player.setVelocityY(-330);
            }
        }

        if (this.stars.countActive(true) === 0)
        {
            this.stars.children.iterate((child: Phaser.GameObjects.GameObject) => {
                const star = child as Phaser.Physics.Arcade.Sprite;
                star.enableBody(true, star.x, 0, true, true);
                return null;
            });

            const x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
            const bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
    }

    hitBomb (player: Phaser.Types.Physics.Arcade.GameObjectWithBody, bomb: Phaser.Types.Physics.Arcade.GameObjectWithBody)
    {
        this.physics.pause();
        (player as Phaser.Physics.Arcade.Sprite).setTint(0xff0000);
        (player as Phaser.Physics.Arcade.Sprite).anims.play('turn');
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOver'); // Show Game Over scene after 1 second delay
        });
    }
}
