// src/hooks/useAI.ts
import { useEffect } from 'react';
import { AvatarPosition, LineDimensions, Config, Direction } from './types';

const useAI = (
  isPlayer1Turn: boolean,
  gameState: string,
  playerPosition: AvatarPosition,
  thiefPosition: AvatarPosition,
  handleMove: (avatar: 'avatar1' | 'avatar2', direction: Direction) => void,
  lines: LineDimensions[],
  config: Config,
  canvasWidth: () => number,
  canvasHeight: () => number,
  isAnimating: boolean,
) => {
  const { squareSize } = config;

  useEffect(() => {
    const calculateDistance = (pos1: AvatarPosition, pos2: AvatarPosition) => {
      const res = Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));

      return res / squareSize
    };

    const getValidMoves = (position: AvatarPosition, currentLines: LineDimensions[]) => {
      const directions: Direction[] = ['up', 'down', 'left', 'right', 'upleft', 'upright', 'downleft', 'downright'];

      return directions.filter(direction => {
        const newPosition = { ...position };
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
              return currentLines.some(line => line.x1 === position.x && line.y1 === position.y && line.x2 === newPosition.x && line.y2 === newPosition.y);
            case 'up':
            case 'left':
            case 'upleft':
            case 'upright':
              return currentLines.some(line => line.x1 === newPosition.x && line.y1 === newPosition.y && line.x2 === position.x && line.y2 === position.y);
            default:
              return false;
          }
        }

        return isValidMove();
      });
    };

    const checkMove = (position: AvatarPosition, direction: Direction) => {
      const newPosition = { ...position };
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
      return newPosition;
    }

    const aiMove = () => {
      if (gameState === 'active' && !isPlayer1Turn) {
        const validMoves = getValidMoves(thiefPosition, lines);

        if (validMoves.length > 0) {
          // Choose the move that minimizes the distance to the player
          const bestMove = validMoves.reduce((prevMove, currentMove) => {
            const predictedPostion = checkMove(thiefPosition, currentMove);
            const distance = calculateDistance(playerPosition, predictedPostion);

            if (distance > prevMove.minDistance && predictedPostion !== playerPosition) {
              return { direction: currentMove, minDistance: Math.abs(distance) };
            } else {
              return prevMove;
            }
          }, { direction: validMoves[0], minDistance: -1 });

       if(!isAnimating && gameState == 'active') {
        handleMove('avatar2', bestMove.direction);
       }
        }
      }
    };


    if (isPlayer1Turn === false && gameState === 'active' && !isAnimating && playerPosition !== thiefPosition) {
      console.log('AI is making it\'s move');
      // AI's turn
      aiMove();
    }

  }, [isPlayer1Turn, gameState, handleMove, lines, config, canvasWidth, canvasHeight, squareSize, thiefPosition, playerPosition, isAnimating]);
};


export default useAI;


