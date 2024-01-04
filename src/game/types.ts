
export interface AvatarPosition {
    x: number;
    y: number;
}

export interface LineDimensions {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface Config {
    squareSize: number;
    strokeColor: string
    stokeWidth: number
    cornerColor: string
    cornerRadius: number
    avatarSize: number
    map: number[][]
}

export type Role = 'player' | 'thief';
export type GameState = 'inactive' | 'active' | 'gameover';
export type Direction = 'up' | 'down' | 'left' | 'right' | 'upleft' | 'upright' | 'downleft' | 'downright';
