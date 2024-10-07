import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
// Класс сцены вращения колеса
class WheelScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WheelScene' });
    }

    preload() {
        const assets = ['wheel', 'pin', 'textTop', 'textBottom', 'winner'];
        assets.forEach(asset => this.load.image(asset, `/assets/${asset}.png`));
    }

    create() {
        this.canSpin = true;
        this.slicePrizes = [
            { name: "Скидка 10%", weight: 20 },
            { name: "Промокод на скидку 30%", weight: 20 },
            { name: "Без выигрыша", weight: 20 },
            { name: "Бесплатное капучино", weight: 20 },
            { name: "Бесплатный РАФ", weight: 20 }
        ];

        this.totalWeight = this.slicePrizes.reduce((acc, prize) => acc + prize.weight, 0);
        this.cumulativeWeights = this.slicePrizes.reduce((acc, prize) => {
            acc.push((acc.length ? acc[acc.length - 1] : 0) + prize.weight);
            return acc;
        }, []);

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.add.image(centerX, 90, 'textTop');
        this.add.image(centerX, 600, 'textBottom');

        this.wheel = this.add.image(centerX, centerY, 'wheel').setOrigin(0.5);
        this.pin = this.add.image(centerX, centerY, 'pin').setOrigin(0.5);
        this.winner = this.add.image(centerX, centerY, 'winner').setVisible(false);

        this.prizeText = this.add.text(centerX, centerY, '', {
            font: '24px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setVisible(false);

        this.input.once('pointerdown', this.spinWheel, this);
    }

    spinWheel() {
        if (!this.canSpin) return;
        this.canSpin = false;
        this.prizeText.setVisible(false);
        this.winner.setVisible(false);

        const rand = Phaser.Math.Between(1, this.totalWeight);
        const selectedPrizeIndex = this.cumulativeWeights.findIndex(weight => rand <= weight);

        const rotations = Phaser.Math.Between(3, 6);
        const extraAngle = Phaser.Math.Between(0, 360);
        const targetAngle = rotations * 360 + extraAngle;

        this.tweens.add({
            targets: this.wheel,
            angle: targetAngle,
            duration: 3000,
            ease: 'Cubic.easeOut',
            onComplete: () => this.displayPrize(selectedPrizeIndex)
        });
    }

    displayPrize(index) {
        this.canSpin = true;
        const prize = this.slicePrizes[index].name;
        this.winner.setVisible(true);
        this.prizeText.setText(prize).setVisible(true);
        this.input.once('pointerdown', this.spinWheel, this);
    }
}

// Компонент Game
const Game = () => {
    const gameRef = useRef(null);
    const phaserGame = useRef(null);

    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            parent: gameRef.current,
            width: 450,
            height: 700,
            transparent: true,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            
            scene: [WheelScene]
        };

        phaserGame.current = new Phaser.Game(config);

        return () => phaserGame.current?.destroy(true);
    }, []);

    return <div ref={gameRef} />;
};

export default Game;
