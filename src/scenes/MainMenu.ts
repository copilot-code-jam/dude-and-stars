import Phaser, { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Text;
    title: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(400, 300, 'background');

        this.logo = this.add.text(400, 200, 'Dude and Stars', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.title = this.add.text(400, 360, 'Start Game', {
            fontFamily: 'Arial Black', fontSize: 30, color: '#ffcc99', // Change color to light pale orange
            stroke: '#000000', strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('Game');

        });
    }
}
