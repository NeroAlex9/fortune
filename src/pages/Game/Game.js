import React, { useEffect, useRef } from 'react'; // Импорт React и хуков useEffect и useRef из библиотеки 'react'
import Phaser from 'phaser'; // Импорт библиотеки Phaser для создания игр

// КЛАСС СЦЕНЫ ВРАЩЕНИЯ КОЛЕСА
class WheelScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WheelScene' }); // Вызов конструктора родительского класса Phaser.Scene с ключом сцены 'WheelScene'
    }

    preload() {
        // Предварительная загрузка графических ресурсов
        this.load.image('wheel', '/assets/wheel.png'); // Загрузка изображения колеса с ключом 'wheel'
        this.load.image('pin', '/assets/pin.png');       // Загрузка изображения булавки с ключом 'pin'
        this.load.image('bg', '/assets/bg.jpg');         // Загрузка фонового изображения с ключом 'bg'
        this.load.image('topText', '/assets/textTop.png');  
        this.load.image('bottomText', '/assets/textBottom.png');       
    }

    create() {
        // Инициализация переменных
        this.canSpin = true; // Флаг, указывающий, можно ли вращать колесо
        this.slicePrizes = [ // Массив призов, разделенных на секции колеса с их весами для вероятности выпадения
            { name: "A KEY!!!", weight: 10 },       // Приз "A KEY!!!" с весом 10%
            { name: "50 STARS", weight: 20 },      // Приз "50 STARS" с весом 20%
            { name: "500 STARS", weight: 30 },     // Приз "500 STARS" с весом 30%
            { name: "BAD LUCK!!!", weight: 10 },   // Приз "BAD LUCK!!!" с весом 10%
            { name: "200 STARS", weight: 15 },     // Приз "200 STARS" с весом 15%
            { name: "100 STARS", weight: 5 },      // Приз "100 STARS" с весом 5%
            { name: "150 STARS", weight: 5 },      // Приз "150 STARS" с весом 5%
            { name: "BAD LUCK!!!", weight: 5 }     // Приз "BAD LUCK!!!" с весом 5%
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
        this.slices = this.slicePrizes.length; // Количество секций на колесе
        this.anglePerSlice = 360 / this.slices; // Угол, соответствующий одной секции колеса

        

        // Добавление фонового изображения в центр холста
        this.bg = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, 'bg');

        this.topText = this.add.sprite(this.cameras.main.width / 2, 90, 'topText');
        this.bottomText = this.add.sprite(this.cameras.main.width / 2, 600, 'bottomText');

        // Добавление колеса в центр холста
        this.wheel = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, 'wheel');
        this.wheel.setOrigin(0.5); // Установка точки привязки колеса в центр

        // Добавление булавки в центр холста
        const pin = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, 'pin');
        pin.setOrigin(0.5); // Установка точки привязки булавки в центр

        // Добавление текста для отображения выигрыша
        this.prizeText = this.add.text(this.cameras.main.width / 2, 650, '', { // Создание текстового объекта
            font: '24px Arial', // Установка шрифта и размера
            fill: '#ffffff',     // Установка цвета текста (белый)
            align: 'center'      // Выравнивание текста по центру
        }).setOrigin(0.5); // Установка точки привязки текста в центр

        // Обработчик клика для вращения колеса
        this.input.once('pointerdown', this.spinWheel, this); // Добавление однократного обработчика события 'pointerdown' для запуска функции spinWheel
    }

    // Функция для вращения колеса
    spinWheel() {
        if (this.canSpin) { // Проверка, можно ли вращать колесо
            this.canSpin = false; // Блокировка вращения до завершения текущего
            this.prizeText.setText(''); // Очистка текста выигрыша

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
            // Цель: выбранный приз должен оказаться под булавкой (0 градусов)
            const targetAngle = 360 * Phaser.Math.Between(2, 4) + // Вращение колеса от 2 до 4 полных оборотов
                (360 - (selectedPrizeIndex * this.anglePerSlice + this.anglePerSlice / 2)); // Добавление угла, необходимого для выравнивания выбранной секции под булавкой

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
        this.prizeText.setText(`Вы выиграли: ${prize}`); // Установка текста выигрыша

        // Повторное добавление обработчика клика для следующего вращения
        this.input.once('pointerdown', this.spinWheel, this); // Добавление однократного обработчика события 'pointerdown' для запуска функции spinWheel
    }
}

// КОМПОНЕНТ Game
const Game = () => {
    const gameRef = useRef(null); // Создание рефа для контейнера Phaser
    const phaserGame = useRef(null); // Создание рефа для экземпляра игры Phaser

    useEffect(() => { // Хук useEffect для инициализации и очистки Phaser игры
        const config = { // Конфигурация игры Phaser
            type: Phaser.AUTO, // Автоматический выбор рендерера (WebGL или Canvas)
            parent: gameRef.current, // Контейнер для игры - текущий реф
            width: 600, // Ширина игрового холста
            height: 700, // Высота игрового холста
            backgroundColor: '#880044', // Цвет фона холста
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
        <div id="phaser-container" ref={gameRef}></div> // Возврат контейнера div с рефом для размещения игры Phaser
    );
};

export default Game; // Экспорт компонента Game по умолчанию
