import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

// КЛАСС СЦЕНЫ ВРАЩЕНИЯ КОЛЕСА
class WheelScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WheelScene' });
    }

    preload() {
        // Предварительная загрузка графических ресурсов
        this.load.image('wheel', '/assets/wheel.png'); // Убедитесь, что путь правильный
        this.load.image('pin', '/assets/pin.png');     // Убедитесь, что путь правильный
    }

    create() {
        // Инициализация переменных
        this.canSpin = true;
        this.slicePrizes = [
            { name: "A KEY!!!", weight: 10 },       // 10%
            { name: "50 STARS", weight: 20 },      // 20%
            { name: "500 STARS", weight: 30 },     // 30%
            { name: "BAD LUCK!!!", weight: 10 },   // 10%
            { name: "200 STARS", weight: 15 },     // 15%
            { name: "100 STARS", weight: 5 },      // 5%
            { name: "150 STARS", weight: 5 },      // 5%
            { name: "BAD LUCK!!!", weight: 5 }     // 5%
        ];
        this.totalWeight = this.slicePrizes.reduce((acc, prize) => acc + prize.weight, 0);
        this.cumulativeWeights = [];
        let cumulative = 0;
        this.slicePrizes.forEach(prize => {
            cumulative += prize.weight;
            this.cumulativeWeights.push(cumulative);
        });
        this.slices = this.slicePrizes.length;
        this.anglePerSlice = 360 / this.slices;

        // Добавление текста для отображения выигрыша
        this.prizeText = this.add.text(this.cameras.main.width / 2, 650, '', {
            font: '24px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Добавление колеса в центр холста
        this.wheel = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, 'wheel');
        this.wheel.setOrigin(0.5);

        // Добавление булавки 
        const pin = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, 'pin');
        pin.setOrigin(0.5);

        // Обработчик клика для вращения колеса
        this.input.once('pointerdown', this.spinWheel, this);
    }

    // Функция для вращения колеса
    spinWheel() {
        if (this.canSpin) {
            this.canSpin = false;
            this.prizeText.setText('');

            // Выбор приза на основе весов
            const rand = Phaser.Math.Between(1, this.totalWeight);
            let selectedPrizeIndex = 0;
            for (; selectedPrizeIndex < this.cumulativeWeights.length; selectedPrizeIndex++) {
                if (rand <= this.cumulativeWeights[selectedPrizeIndex]) {
                    break;
                }
            }

            console.log('Random number:', rand, 'Selected prize index:', selectedPrizeIndex);

            // Вычисление целевого угла для вращения
            // Цель: выбранный приз должен оказаться под булавкой (0 градусов)
            const targetAngle = 360 * Phaser.Math.Between(2, 4) + (360 - (selectedPrizeIndex * this.anglePerSlice + this.anglePerSlice / 2));

            // Анимация вращения колеса
            this.tweens.add({
                targets: this.wheel,
                angle: targetAngle,
                duration: 3000,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    this.displayPrize(selectedPrizeIndex);
                }
            });
        }
    }

    // Функция для отображения выигрыша
    displayPrize(selectedPrizeIndex) {
        this.canSpin = true;
        const prize = this.slicePrizes[selectedPrizeIndex].name;
        this.prizeText.setText(`Вы выиграли: ${prize}`);

        // Повторное добавление обработчика клика для следующего вращения
        this.input.once('pointerdown', this.spinWheel, this);
    }
}

// КОМПОНЕНТ Game
const Game = () => {
    const gameRef = useRef(null);
    const phaserGame = useRef(null);

    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            parent: gameRef.current,
            width: 600,
            height: 700,
            backgroundColor: '#880044',
            scene: [WheelScene],
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            }
        };

        // Инициализация Phaser игры
        phaserGame.current = new Phaser.Game(config);

        // Очистка при размонтировании компонента
        return () => {
            if (phaserGame.current) {
                phaserGame.current.destroy(true);
            }
        };
    }, []);

    return (
        <div id="phaser-container" ref={gameRef}></div>
    );
};

export default Game;
