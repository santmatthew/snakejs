const gridLength = 40;
const squareLength = 10;
const defaultFoodQuantity = 1;

class Snake {
    constructor(length, direction, onMove) {
        this.length = length;
        this.dead = false;
        this.onMove = onMove;
        this.directionQueue = [direction];
        this.direction = null;
    }

    move() {
        this.onMove(this);
    }

    incrementLength(amount) {
        this.length += amount;
    }

    setDirection(direction) {
        if (this.directionQueue.length == 0 || direction != a.slice(-1)[0]) {
            this.directionQueue.push(direction);
        }
    }

    isDead() {
        return this.dead;
    }
}

class Food {
    constructor(quantity) {
        this.quantity = quantity;
    }
}

class Board {
    constructor(targetId) {
        this.targetId = targetId;
        this.squares = [];
        this.snake = null;
        this.food = null;
    }

    init() {
        this.domElement = document.getElementById(this.targetId);
        this.domElement.style.position = 'absolute';
        this.domElement.style.background = 'black';
        this.domElement.style.boxSizing = 'border-box';
        this.domElement.style.width = (gridLength * squareLength) + 'px';
        for (let x=0; x<gridLength; x++) {
            for (let y=0; y<gridLength; y++) {
                addSquare(this, x, y);
            }
        }

        function addSquare(board, x, y) {
            const squareDomElement = document.createElement('div');
            squareDomElement.style.width = squareLength + 'px';
            squareDomElement.style.height = squareLength + 'px';
            squareDomElement.style.boxSizing = 'border-box';
            squareDomElement.style.position = 'absolute';
            squareDomElement.style.left = (x * 10) + 'px';
            squareDomElement.style.top = (y * 10) + 'px';
            squareDomElement.style.background = 'black';
            board.domElement.appendChild(squareDomElement);
            board.squares.push({ x, y, domElement: squareDomElement });
        }

        return board;
    }

    reset() {
        this.snake = null;
        this.food = null;
    }

    getSquare(x, y) {
        const matches = this.squares.filter(s => s.x == x && s.y == y);
        return matches.length > 0 ? matches[0] : null;
    }

    hasSquare(x, y) {
        return x > 0 && x < gridLength && y > 0 && y < gridLength;
    }

    putSnake(snake, x, y) {
        this.snake = { model: snake, squares: [this.getSquare(x, y)] };
        this.updateView();
    }

    getSnake() {
        return this.snake.model;
    }

    onSnakeMove(snakeModel) {
        const headSquare = this.snake.squares.slice(-1)[0];
        let newX = headSquare.x;
        let newY = headSquare.y;
        const direction = snakeModel.directionQueue.length == 0 ? snakeModel.direction : snakeModel.directionQueue.splice(-1)[0];
        switch (direction) {
            case 'R' : newX = newX + 1; break;
            case 'L' : newX = newX - 1; break;
            case 'U' : newY = newY - 1; break;
            case 'D' : newY = newY + 1; break;
            default: throw `Unknown direction: ${direction}`
        }
        const newSquare = this.getSquare(newX, newY);
        if (newSquare === null) {
            console.log('Move out of bounds!');
            snakeModel.dead = true;
        } else {
            this.snake.squares.push(newSquare);
            if (this.snake.squares.length > snakeModel.length) {
                this.snake.squares.splice(0, 1);
            }
            if (this.food && newSquare == this.food.square) {
                this.food.square.domElement.style.background = 'black';
                snakeModel.incrementLength(this.food.model.quantity);
                this.putFood(new Food(defaultFoodQuantity));
            }
        }
        this.updateView();
        snakeModel.direction = direction;
    }

    putFood(food) {
        const snakeSquares = this.snake.squares;
        const nonSnakeSquares = this.squares.filter(s => snakeSquares.indexOf(s) < 0);
        const randomNonSnakeSquare = nonSnakeSquares[Math.floor(Math.random() * nonSnakeSquares.length)];
        this.food = { model: food, square: randomNonSnakeSquare };
    }

    updateView() {
        for (const square of Object.values(this.squares)) {
            if (this.snake.squares.indexOf(square) >= 0 || (this.food && this.food.square == square)) {
                square.domElement.style.background = 'white';
            } else {
                square.domElement.style.background = 'black';
            }
        }
    }
}

function gameInit(board) {
    board.putSnake(new Snake(1, 'R', board.onSnakeMove.bind(board)), 0, 0);
    board.putFood(new Food(defaultFoodQuantity));
}

function gameLoop(board) {
    let snake = board.getSnake();
    if (!snake.isDead()) {
        snake.move();
    } else {
        alert('Game over');
        board.reset();
        gameInit(board);
    }
}

const board = new Board('board');
board.init();
gameInit(board);

document.onkeydown = (e) => {
    const snake = board.getSnake();
    switch (e.key) {
        case 'ArrowDown': {
            if (snake.direction != 'U') {
                snake.setDirection('D');
            }
            break;
        }
        case 'ArrowUp': {
            if (snake.direction != 'D') {
                snake.setDirection('U');
            }
            break;
        }
        case 'ArrowLeft': {
            if (snake.direction != 'R') {
                snake.setDirection('L');
            }
            break;
        }
        case 'ArrowRight': {
            if (snake.direction != 'L') {
                snake.setDirection('R');
            }
            break;
        }
    }
}

const interval = window.setInterval(() => gameLoop(board), 150);