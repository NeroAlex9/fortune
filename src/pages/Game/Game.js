import React, { useEffect, useRef } from 'react'; 
import Phaser from 'phaser'; 

// КЛАСС СЦЕНЫ ВРАЩЕНИЯ КОЛЕСА
class WheelScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WheelScene' }); // Вызов конструктора родительского класса Phaser.Scene с ключом сцены 'WheelScene'
    }

    preload() {
        // Предварительная загрузка графических ресурсов
        this.load.image('wheel', '/assets/wheel.png');         
        this.load.image('pin', '/assets/pin.png');             
        // this.load.image('bg', '/assets/bg.jpg');               
        this.load.image('topText', '/assets/textTop.png');     
        this.load.image('bottomText', '/assets/textBottom.png'); 
        this.load.image('winner', '/assets/winner.png');       
    }

    create() {
        // Инициализация переменных
        this.canSpin = true; // Флаг, указывающий, можно ли вращать колесо
        this.slicePrizes = [ // Массив призов с их весами для вероятности выпадения
            { name: "Скидка 10%", weight: 20 },       
            { name: "Промокод на скидку 30%", weight: 20 },      
            { name: "Без выигрыша", weight: 20 }, 
            { name: "Бесплатное капучино", weight: 20 },    
            { name: "Бесплатный РАФ", weight: 20 }     
        ];

        // Вычисление общей суммы весов для выбора приза
        this.totalWeight = this.slicePrizes.reduce((acc, prize) => acc + prize.weight, 0);
        this.cumulativeWeights = []; // Массив накопительных весов для определения границ вероятностей
        let cumulative = 0; // Переменная для накопления весов

        // Заполнение массива накопительных весов
        this.slicePrizes.forEach(prize => {
            cumulative += prize.weight; // Добавление веса текущего приза к накопленной сумме
            this.cumulativeWeights.push(cumulative); // Добавление накопленной суммы в массив
        });

        // // Добавление фонового изображения в центр холста
        // this.bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'bg');

        // Добавление верхнего текста
        this.topText = this.add.image(this.cameras.main.width / 2, 90, 'topText');

        // Добавление нижнего текста
        this.bottomText = this.add.image(this.cameras.main.width / 2, 600, 'bottomText');

        // Добавление колеса в центр холста
        this.wheel = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'wheel');
        this.wheel.setOrigin(0.5); // Установка точки привязки колеса в центр

        // Добавление булавки в центр холста
        this.pin = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'pin');
        this.pin.setOrigin(0.5); // Установка точки привязки булавки в центр

        // Добавление изображения победителя (скрыто изначально)
        this.winner = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'winner');
        this.winner.setVisible(false); 

        // Добавление текста для отображения выигрыша (скрыто изначально)
        this.prizeText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '', { // Создание текстового объекта ниже изображения победителя
            font: '24px Arial', 
            fill: '#ffffff',     
            align: 'center'      
        }).setOrigin(0.5); // Установка точки привязки текста в центр
        this.prizeText.setVisible(false); // Скрытие текста до момента выигрыша

        // Обработчик клика для вращения колеса
        this.input.once('pointerdown', this.spinWheel, this); // Добавление однократного обработчика события 'pointerdown' для запуска функции spinWheel
    }

    // Функция для вращения колеса
    spinWheel() {
        if (this.canSpin) { // Проверка, можно ли вращать колесо
            this.canSpin = false; // Блокировка вращения до завершения текущего
            this.prizeText.setText(''); // Очистка текста выигрыша
            this.prizeText.setVisible(false); // Скрытие текста
            this.winner.setVisible(false); // Скрытие изображения победителя

            // Выбор приза на основе весов
            const rand = Phaser.Math.Between(1, this.totalWeight); // Генерация случайного числа от 1 до общей суммы весов
            let selectedPrizeIndex = 0; // Индекс выбранного приза

            // Определение, в какую категорию попадает случайное число
            for (; selectedPrizeIndex < this.cumulativeWeights.length; selectedPrizeIndex++) {
                if (rand <= this.cumulativeWeights[selectedPrizeIndex]) { // Если случайное число меньше или равно текущему накопленному весу
                    break; // Прерывание цикла, найден соответствующий приз
                }
            }

            // Вычисление целевого угла для вращения
            // Здесь угол не связан с призом, так как выбор независим
            const rotations = Phaser.Math.Between(3, 6); // Количество полных оборотов (от 3 до 6)
            const extraAngle = Phaser.Math.Between(0, 360); // Дополнительный случайный угол
            const targetAngle = rotations * 360 + extraAngle; // Общий целевой угол

            // Анимация вращения колеса
            this.tweens.add({ // Создание твина для анимации
                targets: this.wheel, // Цель анимации - объект колеса
                angle: targetAngle, // Установка целевого угла
                duration: 3000, // Продолжительность анимации в миллисекундах (3 секунды)
                ease: 'Cubic.easeOut', // Функция сглаживания анимации
                onComplete: () => { // Функция, вызываемая после завершения анимации
                    this.displayPrize(selectedPrizeIndex); // Вызов функции для отображения выигрыша
                }
            });
        }
    }

    // Функция для отображения выигрыша
    displayPrize(selectedPrizeIndex) {
        this.canSpin = true; // Разблокировка возможности вращения колеса
        const prize = this.slicePrizes[selectedPrizeIndex].name; // Получение названия выигранного приза по индексу
        this.winner.setVisible(true); // Отображение изображения 'winner'
        this.prizeText.setText(prize); // Установка текста выигрыша
        this.prizeText.setVisible(true); // Отображение текста

        // Повторное добавление обработчика клика для следующего вращения
        this.input.once('pointerdown', this.spinWheel, this); // Добавление однократного обработчика события 'pointerdown' для запуска функции spinWheel
    }
}

// КОМПОНЕНТ Game
const Game = () => {
    const gameRef = useRef(null); // Создание рефа для контейнера Phaser
    const phaserGame = useRef(null); // Создание рефа для экземпляра игры Phaser

    useEffect(() => { 
        const config = { 
            type: Phaser.AUTO, // Автоматический выбор рендерера (WebGL или Canvas)
            parent: gameRef.current, // Контейнер для игры - текущий реф
            width: 450, // Фиксированная ширина игры
            height: 700, // Фиксированная высота игры
            scale: {
                mode: Phaser.Scale.FIT,  // Автоматическое масштабирование
                autoCenter: Phaser.Scale.CENTER_BOTH,  // Центрирование игры
            },
            backgroundColor: '#d13b3c', 
            scene: [WheelScene], // Массив сцен, используемых в игре (в данном случае только WheelScene)
            physics: { // Настройки физического движка
                default: 'arcade', // Использование 'arcade' физики
                arcade: { // Настройки для 'arcade' физики
                    gravity: { y: 0 }, // Отсутствие гравитации по оси Y
                    debug: false // Отключение режима отладки физики
                }
            }
        };

        // Инициализация Phaser игры
        phaserGame.current = new Phaser.Game(config); // Создание нового экземпляра игры Phaser с заданной конфигурацией

        // Очистка при размонтировании компонента
        return () => { // Функция очистки, вызываемая при размонтировании компонента
            if (phaserGame.current) { // Проверка, существует ли экземпляр игры
                phaserGame.current.destroy(true); // Уничтожение экземпляра игры и удаление его из DOM
            }
        };
    }, []); // Пустой массив зависимостей означает, что эффект выполняется только один раз при монтировании

    return (
        <div 
            id="phaser-container" 
            ref={gameRef} 
        ></div>
    );
};

export default Game; 
