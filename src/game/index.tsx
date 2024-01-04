// src/Game.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import './Game.css';
import avatar1 from '/assets/avatar1.png';
import avatar2 from '/assets/avatar2.png';
import { RiArrowLeftUpLine, RiArrowUpLine, RiArrowRightUpLine, RiArrowLeftLine, RiArrowRightLine, RiArrowLeftDownLine, RiArrowDownLine, RiArrowRightDownLine } from "react-icons/ri";
import { Config, AvatarPosition, LineDimensions, GameState, Direction } from './types';
import useAI from './ai';

export const CANVAS_PADDING = 20;
const ANIMATION_DURATION = 300;

const config: Config = {
    squareSize: 100,
    strokeColor: "#FFFFFF",
    stokeWidth: 3,
    cornerColor: "#FBB03B",
    cornerRadius: 6,
    avatarSize: 25,
    map: [[1, 1, 1, 1], [0, 0, 0, 2]]
}

const Game: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { squareSize, strokeColor, stokeWidth, cornerColor, cornerRadius, avatarSize, map } = config;
    const [playerPosition, setPlayerPosition] = useState<AvatarPosition>({ x: squareSize + CANVAS_PADDING, y: squareSize + CANVAS_PADDING });
    const [thiefPosition, setThiefPosition] = useState<AvatarPosition>({ x: CANVAS_PADDING, y: CANVAS_PADDING });
    const [lines, setLines] = useState<LineDimensions[]>([]);
    const [gameState, setGameState] = useState<GameState>('inactive')
    const [isPlayer1Turn, setIsPlayer1Turn] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    const [moves, setMoves] = useState(0);



    const startGame = (type: 'even' | 'odd') => {
        setMoves(0);
        setIsPlayer1Turn(true);
        setGameState('inactive');
        if (type === 'even') {
            setPlayerPosition({ x: squareSize + CANVAS_PADDING, y: squareSize + CANVAS_PADDING });
        } else {
            setPlayerPosition({ x: squareSize + CANVAS_PADDING, y: CANVAS_PADDING });
        }
        setThiefPosition({ x: CANVAS_PADDING, y: CANVAS_PADDING });
        setGameState('active');
        setTimeout(() => {
        }, 1000);
    };




    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const temp_corners: AvatarPosition[] = [];
        const temp_lines: LineDimensions[] = [];


        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const addCorners = (x: number, y: number) => {
            const exists = !!temp_corners?.find(corner => x === corner.x && y === corner.y);
            if (!exists) {
                temp_corners.push({ x, y });
            }
        };

        const addLines = (x1: number, y1: number, x2: number, y2: number) => {
            const exists = !!temp_lines?.find(line => x1 === line.x1 && y1 === line.y1 && x2 === line.x2 && y2 === line.y2);
            if (!exists) {
                temp_lines.push({ x1, y1, x2, y2 });
            }
        };

        const drawSquare = (x: number, y: number) => {
            ctx.lineWidth = stokeWidth;
            ctx.strokeStyle = strokeColor;
            ctx.strokeRect(x, y, squareSize, squareSize);
            addCorners(x, y);
            addCorners(x + squareSize, y);
            addCorners(x, y + squareSize);
            addCorners(x + squareSize, y + squareSize);

            addLines(x, y, x + squareSize, y);
            addLines(x, y, x, y + squareSize);
            addLines(x + squareSize, y, x + squareSize, y + squareSize);
            addLines(x, y + squareSize, x + squareSize, y + squareSize);
        };

        const drawSquareWithDiagonal = (x: number, y: number, variance: 2 | 3 = 2) => {
            ctx.lineWidth = stokeWidth;
            ctx.strokeStyle = strokeColor;
            ctx.strokeRect(x, y, squareSize, squareSize);
            ctx.beginPath();
            if (variance == 2) {
                ctx.moveTo(x, y);
                ctx.lineTo(x + squareSize, y + squareSize);
            } else if (variance == 3) {
                ctx.moveTo(x + squareSize, y);
                ctx.lineTo(x, y + squareSize);
            }
            ctx.stroke();
            addCorners(x, y);
            addCorners(x + squareSize, y);
            addCorners(x, y + squareSize);
            addCorners(x + squareSize, y + squareSize);

            addLines(x, y, x + squareSize, y);
            addLines(x, y, x, y + squareSize);
            addLines(x + squareSize, y, x + squareSize, y + squareSize);
            addLines(x, y + squareSize, x + squareSize, y + squareSize);

            if (variance === 2) {
                addLines(x, y, x + squareSize, y + squareSize);
            } else if (variance === 3) {
                addLines(x + squareSize, y, x, y + squareSize);
            }

        };

        const drawMap = () => {

            for (let i = 0; i < map.length; i++) {
                const level = map[i];
                for (let j = 0; j < level.length; j++) {
                    const cell = level[j];
                    if (cell === 1) {
                        drawSquare((j * squareSize) + CANVAS_PADDING, (squareSize * i) + CANVAS_PADDING);
                    } else if (cell === 2 || cell === 3) {
                        drawSquareWithDiagonal((j * squareSize) + CANVAS_PADDING, (squareSize * i) + CANVAS_PADDING, cell);
                    }
                }
            }

        };

        const drawCorners = () => {
            temp_corners?.forEach(({ x, y }) => {
                ctx.beginPath();
                ctx.arc(x, y, cornerRadius, 0, 2 * Math.PI);
                ctx.fillStyle = cornerColor;
                ctx.fill();
                ctx.closePath();
            });
            setLines(temp_lines);
        }

        const drawAvatar = (x: number, y: number, imagePath: string) => {
            const image = new Image();
            image.src = imagePath;
            image.onload = () => {
                ctx.drawImage(image, x - (avatarSize / 2), y - (avatarSize / 2), avatarSize, avatarSize);
            };
        };

        const clearCanvas = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };

        const drawGame = () => {
            clearCanvas();

            //Draw Map
            drawMap();

            //Draw Corners
            drawCorners();

            // Draw avatars
            drawAvatar(thiefPosition.x, thiefPosition.y, avatar2);
            drawAvatar(playerPosition.x, playerPosition.y, avatar1);
        };

        drawGame();
    }, [playerPosition, thiefPosition, stokeWidth, strokeColor, squareSize, map, cornerRadius, cornerColor, avatarSize]);

    const handleMove = useCallback(
        (avatar: 'avatar1' | 'avatar2', direction: Direction) => {
            if (gameState === 'active') {
                const currentPosition: AvatarPosition = { ...avatar === 'avatar1' ? playerPosition : thiefPosition };
                const newPosition: AvatarPosition = { ...avatar === 'avatar1' ? playerPosition : thiefPosition };


                switch (direction) {
                    case 'up':
                        newPosition.y -= squareSize;
                        break;
                    case 'down':
                        newPosition.y += squareSize;
                        break;
                    case 'left':
                        newPosition.x -= squareSize;
                        break;
                    case 'right':
                        newPosition.x += squareSize;
                        break;
                    case 'upleft':
                        newPosition.y -= squareSize;
                        newPosition.x -= squareSize;
                        break;
                    case 'upright':
                        newPosition.y -= squareSize;
                        newPosition.x += squareSize;
                        break;
                    case 'downleft':
                        newPosition.y += squareSize;
                        newPosition.x -= squareSize;
                        break;
                    case 'downright':
                        newPosition.y += squareSize;
                        newPosition.x += squareSize;
                        break;

                    default:
                        break;
                }
                const isValidMove = () => {
                    switch (direction) {
                        case 'down':
                        case 'right':
                        case 'downleft':
                        case 'downright':

                            return lines.some(line => line.x1 === currentPosition.x && line.y1 === currentPosition.y && line.x2 === newPosition.x && line.y2 === newPosition.y);
                        case 'up':
                        case 'left':
                        case 'upleft':
                        case 'upright':
                            return lines.some(line => line.x1 === newPosition.x && line.y1 === newPosition.y && line.x2 === currentPosition.x && line.y2 === currentPosition.y);
                        default:
                            return false;
                    }
                }

                if (isValidMove()) {
                    avatar === 'avatar1' ? setPlayerPosition(newPosition) : setThiefPosition(newPosition);
                    if(avatar === 'avatar1'){
                        setMoves(moves => moves+1);
                    }
                    setIsAnimating(true);

                    const animate = () => {
                        const progress = Math.min(1, (Date.now() - startTime) / ANIMATION_DURATION);
                        const animatedPosition: AvatarPosition = {
                            x: currentPosition.x + (newPosition.x - currentPosition.x) * progress,
                            y: currentPosition.y + (newPosition.y - currentPosition.y) * progress,
                        };

                        avatar === 'avatar1' ? setPlayerPosition(animatedPosition) : setThiefPosition(animatedPosition);

                        if (progress < 1) {
                            requestAnimationFrame(animate)
                        } else {
                           if(gameState == 'active') {
                            setIsPlayer1Turn(isPlayer1Turn => !isPlayer1Turn);
                            setIsAnimating(false);
                           }
                        }
                    }

                    const startTime = Date.now();
                    animate();

                    
                }

            }
        },
        [gameState, playerPosition, thiefPosition, squareSize, lines],
    )

    const canvasWidth = useCallback(
        () => {
            return (map[0].length * squareSize) + (CANVAS_PADDING * 2)
        },
        [map, squareSize],
    )

    const canvasHeight = useCallback(
        () => {
            return (map.length * squareSize) + (CANVAS_PADDING * 2)
        },
        [map, squareSize],
    )





    useEffect(() => {
        if (gameState == 'active') {
            // Check if AI and player have the same coordinates
            if (thiefPosition.x === playerPosition.x && thiefPosition.y === playerPosition.y) {
                setGameState('gameover');
                setIsAnimating(true);
                setIsPlayer1Turn(true)
return;
            }
        }
    }, [thiefPosition, playerPosition, gameState])


    useAI(
        isPlayer1Turn,
        gameState,
        playerPosition,
        thiefPosition,
        handleMove,
        lines,
        config,
        canvasWidth,
        canvasHeight,
        isAnimating,
    );


    return (
        <div className="game-container">
            <h3 className="game-title">Catch the Thief</h3>
            <p className="game-subtitle">A simple interactive representation of the puzzle found in this <a href="https://www.instagram.com/reel/C0zLeq2qXQC/?igsh=cHVwYWYwNTlhcHpy">instagram post</a></p>

            <div className="">
                <canvas ref={canvasRef} width={canvasWidth()} height={canvasHeight()} className="game-canvas" />

            </div>



            <div className="controls">
                {
                    gameState === 'gameover' && <p className="">Ohh great you caught the thief after {moves} {moves == 1 ? 'move' : 'moves'}!!</p>
                }
                {gameState !== 'active' && <div className="game-state-controls">
                    <button onClick={() => startGame('even')}>Start Now(Even)</button>
                    <button onClick={() => startGame('odd')}>Start Now (Odd)</button>
                </div>}
                {gameState === 'active' && <div className="game-controls-grid">
                    <button onClick={() => handleMove('avatar1', 'upleft')}><RiArrowLeftUpLine /></button>
                    <button onClick={() => handleMove('avatar1', 'up')}><RiArrowUpLine /></button>
                    <button onClick={() => handleMove('avatar1', 'upright')}><RiArrowRightUpLine /></button>
                    <button onClick={() => handleMove('avatar1', 'left')}><RiArrowLeftLine /></button>
                    <button></button>
                    <button onClick={() => handleMove('avatar1', 'right')}><RiArrowRightLine /></button>
                    <button onClick={() => handleMove('avatar1', 'downleft')}><RiArrowLeftDownLine /></button>
                    <button onClick={() => handleMove('avatar1', 'down')}><RiArrowDownLine /></button>
                    <button onClick={() => handleMove('avatar1', 'downright')}><RiArrowRightDownLine /></button>
                </div>}
            </div>

            <p className="footnote">Built with 💜 by <a href="https://www.instagram.com/thetimilehin/">Love Akinlesi</a></p>
        </div>
    );
};

export default Game;