import React, { useState, useRef, useEffect } from "react";
import { useInterval } from "./useInterval";
import {
  CANVAS_SIZE,
  SNAKE_START,
  APPLE_START,
  SCALE,
  SPEED,
  DIRECTIONS
} from "./constants";
import style from './style.scss';


const create2DArray = (x, y) => {
  const column = new Array(y).fill(0)
  const row = new Array(x).fill(column)
  return row;
}

const X = Math.floor(CANVAS_SIZE[0]/SCALE);
const Y = Math.floor(CANVAS_SIZE[1]/SCALE);
let board = create2DArray(X, Y)
let path = [];

const createStack = () => {
  let item = [];
  const push = (el) => item.push(el)
  const pop = () => item.pop()
  const isEmpty = () => item.length === 0
  const size = () => item.length
  return {
    push,
    pop,
    isEmpty,
    size
  }
}
const createQueue = () => {
  let item = [];
  const enqueue = (el) => item.push(el)
  const dequeue = () => item.shift()
  const isEmpty = () => item.length === 0
  const head = () => item.length > 0 && item[0]
  const size = () => item.length
  return {
    enqueue,
    dequeue,
    isEmpty,
    size,
    head,
  }
}

const colorNames = [
  "#92dbff",
  "#9696ff",
  "#96f6a1",
  "#ff9793",
  "#acf49d",
  "#6ff3e4",
  "#f0aeff",
  "#f6abb6",
  "#dec3c3",
  "#63ace5",
  "#f9caa7",
  "#83d0c9",
  "#88d8b0",
]

const getRandomArbitrary = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
}

const random = (pallete) => {
  switch (pallete) {
    case 'light':
      const randomNumber = getRandomArbitrary(0, colorNames.length -1);
      return colorNames[randomNumber];
    default:
      return pallete;
  }
}

const isInRange = (x, y) => x >= 0 && x < X && y >= 0 && y < Y

const isVisited = (x, y) => board[x][y] === 1

const visit = (x, y) => {
  board = board.map((row, i) => {
    const r = row.map((tile, j) => {
      if (i === x && j === y) {
        return 1;
      }
      return tile;
    });
    return r
  })
}

const getNeighbors = (x, y) => {
  return DIRECTIONS.map((n) => [n[0] + x, n[1] + y])
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const dfs = (x, y) => {
  const stack = createStack();
  stack.push([x, y]);
  visit(x, y)
  path = [...path, [x, y]]
  while (!stack.isEmpty()) {
    let node = stack.pop();
    if (!isVisited(node[0], node[1])) {
      path = [...path, node]
    }
    visit(node[0], node[1]);
    const neighbors = getNeighbors(node[0], node[1]).filter(n => isInRange(n[0], n[1]) && !isVisited(n[0], n[1]));
    shuffle(neighbors);
    neighbors.forEach((n, i) => {
      stack.push(n)
    });

  }
  return path;
}

const bfs = (x, y) => {
  const queue = createQueue();
  queue.enqueue([x, y]);
  visit(x, y)
  path = [...path, [x, y]]
  while (!queue.isEmpty()) {
    let node = queue.dequeue();
    const neighbors = getNeighbors(node[0], node[1]).filter(n => isInRange(n[0], n[1]) && !isVisited(n[0], n[1]));
    shuffle(neighbors);
    neighbors.forEach((n, i) => {
      path = [...path, n]
      visit(n[0], n[1]);
      queue.enqueue(n)
    });
  }
  return path;
}

export const Maze = () => {
  const canvasRef = useRef();
  const [pause, setPause] = useState(false);
  const [isStarted, setStarted] = useState(false);
  const [dir, setDir] = useState([0, -1]);
  const [speed, setSpeed] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [counter , setCounter] = useState(0)
  const [pathing, setPathing] = useState([[1,1], [1,2]])
  const [design, setDesign] = useState('maze');
  const [color, setColor] = useState('black');

  useInterval(() => gameLoop(), speed);

  const endGame = () => {
    setSpeed(null);
    setGameOver(true);
    setStarted(false);
    setPause(false);
    setPathing([])
    const context = canvasRef.current.getContext("2d");
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    setCounter(0)
  };

  const pauseGame = () => {
    if (pause) {
      setPause(false)
      setSpeed(SPEED)
    } else {
      setPause(true);
      setSpeed(null)
    }
  }

  const renderDots = () => {
    const context = canvasRef.current.getContext("2d");
    context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    context.fillStyle = random();
    var circle = new Path2D();
    circle.moveTo(pathing[counter][0], pathing[counter][1]);
    circle.arc(pathing[counter][0] + 1, pathing[counter][1] + 1, 0.2, 0, 2 * Math.PI);
    context.fillStyle = random(color);;
    context.fill(circle);
  }
  const renderMaze = () => {
    const context = canvasRef.current.getContext("2d");
    context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    context.fillStyle = random();
    const a = pathing[counter - 1][0] - pathing[counter][0];
    const b = pathing[counter - 1][1] - pathing[counter][1];
    const c = Math.sqrt( a*a + b*b );
    if (c === 1) {
      context.beginPath();
      context.lineCap = "round";
      context.lineWidth = 0.25;
      context.moveTo(pathing[counter - 1][0] + 1, pathing[counter - 1][1] + 1);
      context.lineTo(pathing[counter][0] + 1, pathing[counter][1] + 1);
      context.strokeStyle = random(color);
      context.stroke();
    }
  }

  useEffect(() => {
    const context = canvasRef.current.getContext("2d");
    context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    context.fillStyle = random();
    if (counter > 1 && counter < pathing.length) {
      switch (design) {
        case 'maze':
          renderMaze()
          break;
        case 'dots':
          renderDots()
          break;
        default:
          renderMaze()
      }
    }
  }, [counter]);

  const gameLoop = () => {
    if (counter < path.length) {
      setCounter(counter + 1);
    }
  };

  const startGame = () => {
    const start = [getRandomArbitrary(0, X - 1), getRandomArbitrary(0, Y - 1)]
    setPathing(dfs(start[0],start[1]))
    setSpeed(SPEED);
    setGameOver(false);
    setStarted(true);
    setPause(false);
    setStarted(true);
  };

  return (
    <div role="button" tabIndex="0" className={style.container}>
      <select
        name="design"
        id="design"
        defaultValue={design}
        onChange={(e) => setDesign(e.currentTarget.value)}
      >
        <option value="dots">Dots</option>
        <option value="maze">Maze</option>
      </select>
      <select
        name="color"
        id="color"
        defaultValue={color}
        onChange={(e) => setColor(e.currentTarget.value)}
      >
        <option value="light">Light</option>
        <option value="black">Black</option>
        <option value="red">Red</option>
        <option value="blue">Blue</option>
        <option value="green">Green</option>
        <option value="gray">Gray</option>
      </select>

      <canvas
        onClick={isStarted ? pauseGame :startGame}
        className={style.game}
        ref={canvasRef}
        width={`${CANVAS_SIZE[0]}px`}
        height={`${CANVAS_SIZE[1]}px`}
      />
      <div className={style.controller}>
        <button className={style.start} onClick={startGame}>Start</button>
        <button className={style.pause} onClick={pauseGame}>Pause</button>
        <button className={style.end} onClick={endGame}>Quit</button>
      </div>
    </div>
  );
};
