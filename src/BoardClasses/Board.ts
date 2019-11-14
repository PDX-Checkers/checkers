import * as utils from "./Utils"

export enum Color {
    NO_COLOR,
    RED,
    BLACK,
};

export function otherColor(color: Color): Color {
    switch(color) {
        case Color.RED:
            return Color.BLACK;
        case Color.BLACK:
            return Color.RED;
        default:
            return Color.NO_COLOR;
    }
}

enum Piece {
    NONE,
    RED_MAN,
    RED_KING,
    BLACK_MAN,
    BLACK_KING
};

// Simple function to display a textual representation of pieces in the console.
function str(piece: Piece): string {
    switch(piece) {
        case Piece.NONE:
            return "_";
        case Piece.RED_MAN:
            return "r";
        case Piece.RED_KING:
            return "R";
        case Piece.BLACK_MAN:
            return "b";
        case Piece.BLACK_KING:
            return "B";
    }
}

// When a man reaches the "end" of the board, it gets promoted to a king.
// All other pieces are unaffected.
function promotePiece(piece: Piece): Piece {
    switch(piece) {
        case Piece.RED_MAN: {
            return Piece.RED_KING;
        }
        case Piece.BLACK_MAN: {
            return Piece.BLACK_KING;
        }
        default:
            return piece;
    }
}

function pieceColor(piece: Piece): Color {
    if([Piece.RED_MAN, Piece.RED_KING].indexOf(piece) >= 0) {
        return Color.RED;
    }
    if([Piece.BLACK_MAN, Piece.BLACK_KING].indexOf(piece) >= 0) {
        return Color.BLACK;
    }
    return Color.NO_COLOR;
}

abstract class GameState {
    color: Color;

    constructor(color: Color) {
        this.color = color;
    }
    isRegularTurn(): boolean {
        return false;
    }
    isMulticapture(): boolean {
        return false;
    }
    isCompleteGame(): boolean {
        return false;
    }
    multicaptureIndex(): number | null {
        return null;
    }
    abstract toObject(): object;
    abstract copy(): GameState;
}

// Just a standard start to a turn. The player must capture if possible,
// or can move a piece normally if not.
class RegularTurn extends GameState {
    constructor(color: Color) {
        super(color);
    }

    isRegularTurn(): boolean {
        return true;
    }

    toObject(): object {
        return {
            "currentState" : "RegularTurn",
            "color" : this.color
        };
    }

    copy(): GameState {
        return new RegularTurn(this.color);
    }
}

// The player has captured a piece and landed on currentIndex. Another
// capture is available, and the player must take it.
class Multicapture extends GameState {
    currentIndex: number;

    constructor(color: Color, currentIndex: number) {
        super(color);
        this.currentIndex = currentIndex;
    }

    isMulticapture(): boolean {
        return true;
    }
    multicaptureIndex(): number {
        return this.currentIndex;
    }

    toObject(): object {
        return {
            "currentState" : "Multicapture",
            "color" : this.color,
            "currentIndex" : this.currentIndex
        };
    }

    copy(): GameState {
        return new Multicapture(this.color, this.currentIndex);
    }
}

// The game has ended in favor of color. If color === NO_COLOR, the game is a
// draw. Currently, this is not implemented.
class CompleteGame extends GameState {
    constructor(color: Color) {
        super(color);
    }

    isCompleteGame(): boolean {
        return true;
    }

    toObject(): object {
        return {
            "currentState" : "CompleteGame",
            "color" : this.color,
        };
    }

    copy() {
        return new CompleteGame(this.color);
    }
}

// Default starting board - black pieces in the top three rows, blank squares in
// the next two rows, and red pieces in the bottom three rows.
function defaultBoard(): Piece[] {
    return utils.repeatN(Piece.BLACK_MAN, 12)
                    .concat(utils.repeatN(Piece.NONE, 8))
                    .concat(utils.repeatN(Piece.RED_MAN, 12));
}

export class Board {
    private pieces: Piece[];
    private currentState: GameState;

    constructor(pieces?: Piece[], 
                currentState: GameState = new RegularTurn(Color.BLACK), 
                deepcopy: boolean = false) {
        if(pieces === null) {
            this.pieces = defaultBoard();
        }
        else {
            if(deepcopy) {
                this.pieces = [...<Piece[]>pieces];
            }
            else {
                this.pieces = <Piece[]>pieces;
            }
        }
        this.currentState = currentState;
    }

    public copy(): Board {
        return new Board(this.pieces, this.currentState.copy(), true);
    }

    getCurrentState(): GameState {
        return this.currentState.copy();
    }

    // There's an opportunity for optimization here: keep a count of pieces, and
    // decrement whenever there is a capture. In the meantime, we just iterate
    // through all 32 spots on the board.
    public isGameOver(): boolean {
        let [numRed, numBlack] = [0, 0];
        for(let i = 0; i < this.pieces.length; i++) {
            if(pieceColor(this.pieces[i]) == Color.RED) {
                numRed++;
            }
            else if(pieceColor(this.pieces[i]) == Color.BLACK) {
                numBlack++;
            }
            if(numRed > 0 && numBlack > 0) {
                return false;
            }
        }
        return true;
    }

    // Obtain all potential moves by obtaining all move functions of the piece,
    // applying all of them, and returning the moves that aren't null.
    // Note that you can't just go by falsy values, because 0 is a valid index...
    private potentialMoves(index: number): number[] {
        let piece: Piece = this.pieces[index];
        return <number[]>potentialMoveFunctions(piece)
            .map(f => f(index))
            .filter(arg => arg !== null);
    }

    // Given an index, return a list containing tuples.
    // The first element of each tuple is the index the piece must jump over to
    // reach the second element, which is the index the piece will land.
    //
    // It's important to note that potentialMoveFunctions is aligned so that the
    // 0th element is a normal move, and the 1st element is a capture move.
    // The 2nd element is a normal move, and the 3rd element is a capture move.
    //
    // This means that divvy can create two lists - one of regular moves, and one
    // of captures. We then zip them together and filter out any elements that
    // contain nulls (are invalid moves).
    //
    // Note that no checks are performed to see if this is a valid capture; it only
    // gives possible indices, which will be checked by findAllCaptures.
    private captureIndices(index: number): [number, number][] {
        let piece: Piece = this.pieces[index];
        return <[number, number][]>utils.zip(...utils.divvy(potentialMoveFunctions(piece).map(f => f(index))))
                    .filter(([x, y]) => x !== null && y !== null)
    }

    // We care about the following:
    // * Is the index a piece?
    // * Is it jumping over a piece?
    // * Is it landing on an empty square?
    // * Is the piece at the index a different color from the one it's jumping
    // over?
    private canCapture(index: number, jumpOverIndex: number, targetIndex: number): boolean {
        return this.pieces[index] !== Piece.NONE &&
            this.pieces[jumpOverIndex] !== Piece.NONE &&
            this.pieces[targetIndex] === Piece.NONE &&
            pieceColor(this.pieces[index]) !== pieceColor(this.pieces[jumpOverIndex]);
    }

    // Get all of the possible ways a piece can capture, and filter out the ones
    // where canCapture fails.
    private findAllCaptures(index: number): number[] {
        return this.captureIndices(index)
                   .filter(([jI, tI]) => this.canCapture(index, jI, tI), this)
                   .map(utils.snd);
    }

    // Iterate through all of the squares on the board to see if there is a
    // capture.
    // We filter out the indices that don't have a piece with the provided
    // color, find all of the captures, concatenate them together, and see if
    // there is anything in the list.
    // Again, there might be room for optimization - we could do this
    // iteratively and exit immediately upon finding a piece that can capture.
    private mustCapture(): boolean {
        return utils.flatten(
                utils.enumerate(this.pieces)
                     .filter(([_, p]) => pieceColor(p) === this.currentState.color, this)
                     .map(([i, _]) => this.findAllCaptures(i), this)).length !== 0;
    }

    // More inefficient garbage.
    move(sourceIndex: number, targetIndex: number): Board | null {
        // We have two choices - it's either a regular turn, or it's a multicapture.
        // Otherwise, the game is over.
        if(this.currentState.isRegularTurn()) {
            let moveMade: boolean = false;
            // If the player is moving a piece that is the wrong color, return
            // null.
            if(this.currentState.color !== pieceColor(this.pieces[sourceIndex])) {
                return null;
            }
            // If the player's target isn't valid, return null.
            if(this.potentialMoves(sourceIndex).indexOf(targetIndex) < 0) {
                return null;
            }
            // If the player's target already has a piece on it, return null.
            if(this.pieces[targetIndex] != Piece.NONE) {
                return null;
            }
            // If the player must capture, but isn't capturing, return
            // null.
            let captureMoves: [number, number][] = this.captureIndices(sourceIndex);
            if(this.mustCapture() &&
               captureMoves.map(utils.snd)
                           .indexOf(targetIndex) < 0) {
                return null;
            }
            // Otherwise, it's a good move.
            let newBoard: Board = new Board(this.pieces, this.currentState, true);
            for(let i = 0; i < captureMoves.length; i++) {
                let [jumpOverIndex, currentTarget] = captureMoves[i];
                if (currentTarget === targetIndex) {
                    // It's a capture, and we're going to move the piece and
                    // remove the jumpOverIndex.
                    newBoard.jump(sourceIndex, jumpOverIndex, targetIndex);
                    moveMade = true;
                    // If the current piece can jump again, we return a Multicapture.
                    if(newBoard.findAllCaptures(targetIndex).length != 0) { 
                        newBoard.currentState = new Multicapture(this.currentState.color, targetIndex);
                        return newBoard;
                    }
                    // And since there was a capture, we check to see if it's game over.
                    if(newBoard.isGameOver()) {
                        newBoard.currentState = new CompleteGame(this.currentState.color)
                        return newBoard;
                    }
                }
            }
            if(!moveMade) {
                // Otherwise, it's just a regular move.
                newBoard.pieces[sourceIndex] = Piece.NONE;
                newBoard.pieces[targetIndex] = this.pieces[sourceIndex];
            }
            // Now we check for promotion. If the targetIndex's row and color
            // line up, we replace the piece with a king.
            if(promotableLocation(this.currentState.color, targetIndex)) {
                newBoard.promote(targetIndex);
            }
            // And now we give the turn over to the other player.
            newBoard.currentState = new RegularTurn(otherColor(this.currentState.color));
            return newBoard;
        }
        if(this.currentState.isMulticapture()) {
            // If it's a multicapture, then our options are much more constrained.
            // The sourceIndex must be equal to what's in the multicapture, and
            // the targetIndex must be in the captureIndices.
            if(sourceIndex !== this.currentState.multicaptureIndex()) {
                return null;
            }
            let captureIndex: number = this.captureIndices(sourceIndex)
                                           .map(utils.snd)
                                           .indexOf(targetIndex);

            if(captureIndex < 0) {
                return null;
            }

            // Otherwise, it's a good move.
            let newBoard = new Board(this.pieces, this.currentState, true);
            let [jumpOverIndex, _] = this.captureIndices(sourceIndex)[captureIndex];
            newBoard.jump(sourceIndex, jumpOverIndex, targetIndex);
            // If the current piece can jump again, we return a Multicapture.
            if(newBoard.findAllCaptures(targetIndex).length != 0) {
                newBoard.currentState = new Multicapture(this.currentState.color, targetIndex);
                return newBoard;
            }
            // And since there was a capture, we check to see if it's game over.
            if(newBoard.isGameOver()) {
                newBoard.currentState = new CompleteGame(this.currentState.color)
                return newBoard;
            }
            // Otherwise, we check for promotion.
            if(promotableLocation(this.currentState.color, targetIndex)) {
                newBoard.promote(targetIndex);
            }
            // And now we give the turn over to the other player.
            newBoard.currentState = new RegularTurn(otherColor(this.currentState.color));
            return newBoard;
        }

        return null;
    }

    private jump(sourceIndex: number, jumpOverIndex: number, targetIndex: number) {
        this.pieces[targetIndex] = this.pieces[sourceIndex];
        this.pieces[sourceIndex] = Piece.NONE;
        this.pieces[jumpOverIndex] = Piece.NONE;
    } 

    private promote(targetIndex: number) {
        this.pieces[targetIndex] = promotePiece(this.pieces[targetIndex]);
    }

    // Simple string representation to print the state of the board in the console.
    toString() {
        let result: String = "";
        for(let i: number = 0; i < this.pieces.length; i++) {
            if(i % 8 == 0) {
                result += " ";
            }
            result += str(this.pieces[i]);
            if(i % 4 == 3) {
                result += "\n";
            }
            else {
                result += " ";
            }
        }
        return result;
    }

    toObject(): object {
        return {
            "board" : this.pieces,
            "gameState" : this.currentState.toObject()
        };
    }

    public finishEarly(color: Color): Board {
        return new Board(this.pieces, new CompleteGame(otherColor(color)), true);
    }
}

// We number the board indices as follows:
//     0   1   2   3
//   4   5   6   7
//     8   9  10  11
//  12  13  14  15
//    16  17  18  19
//  20  21  22  23
//    24  25  26  27
//  28  29  30  31
// Starting the game, Black occupies the top three rows. Red occupies the bottom
// three rows.

function row(index: number): number {
    return Math.floor(index / 4);
}

function evenRow(index: number): boolean {
    return row(index) % 2 === 0;
}

function oddRow(index: number): boolean {
    return !evenRow(index);
}

// Determining whether an index is on the edge of the board.

function topRow(index: number): boolean {
    return row(index) === 0;
}

function bottomRow(index: number): boolean {
    return row(index) === 7;
}

function leftSide(index: number): boolean {
    return index % 8 === 4;
}

function rightSide(index: number): boolean {
    return index % 8 === 3;
}

// Determining whether an index is adjacent to the edge of the board. This
// impacts whether it can capture in a certain direction.

function topAdjacent(index: number): boolean {
    return row(index) <= 1;
}

function bottomAdjacent(index: number): boolean {
    return row(index) >= 6;
}

function leftAdjacent(index: number): boolean {
    return leftSide(index) || index % 8 === 0;
}

function rightAdjacent(index: number): boolean {
    return rightSide(index) || index % 8 == 7;
}

// Obtaining possible diagonal moves.

function leftUp(index: number): number | null {
    if(leftSide(index) || topRow(index)) {
        return null;
    }
    if(evenRow(index)) {
        return index - 4;
    }
    return index - 5;
}

function rightUp(index: number): number | null {
    if(rightSide(index) || topRow(index)) {
        return null;
    }
    if(evenRow(index)) {
        return index - 3;
    }
    return index - 4;
}

function leftDown(index: number): number | null{
    if(leftSide(index) || bottomRow(index)) {
        return null;
    }
    if(evenRow(index)) {
        return index + 4;
    }
    return index + 3;
}

function rightDown(index: number): number | null{
    if(rightSide(index) || bottomRow(index)) {
        return null;
    }
    if(evenRow(index)) {
        return index + 5;
    }
    return index + 4;
}

// Obtaining possible diagonal captures.

function leftUpCapture(index: number): number | null {
    if (leftAdjacent(index) || topAdjacent(index)) {
        return null;
    }
    return index - 9;
}

function rightUpCapture(index: number): number | null {
    if(rightAdjacent(index) || topAdjacent(index)) {
        return null;
    }
    return index - 7;
}

function leftDownCapture(index: number): number | null {
    if (leftAdjacent(index) || bottomAdjacent(index)) {
        return null;
    }
    return index + 7;
}

function rightDownCapture(index: number): number | null {
    if(rightAdjacent(index) || bottomAdjacent(index)) {
        return null;
    }
    return index + 9;
}

const ALL_MOVES: ((arg: number) => number | null)[] = [
    leftDown, leftDownCapture,
    rightDown, rightDownCapture,
    leftUp, leftUpCapture,
    rightUp, rightUpCapture
]

function potentialMoveFunctions(piece: Piece): ((arg: number) => number | null)[] {
    switch(piece) {
        case Piece.NONE: {
            return [];
        }
        case Piece.RED_MAN: {
            return [leftUp, leftUpCapture, rightUp, rightUpCapture];
        }
        case Piece.RED_KING: {
            return ALL_MOVES;
        }
        case Piece.BLACK_MAN: {
            return [leftDown, leftDownCapture, rightDown, rightDownCapture];
        }
        case Piece.BLACK_KING: {
            return ALL_MOVES;
        }
    }
}

function promotableLocation(color: Color, index: number): boolean {
    switch(color) {
        case Color.RED: {
            return topRow(index);
        }
        case Color.BLACK: {
            return bottomRow(index);
        }
        default:
            return false;
    }
}

export function fromObject(obj: utils.GameJSObject): Board {
    let gameStateObj: utils.GameStateJSObject = obj["gameState"]
    let gameState: GameState;
    switch(gameStateObj["currentState"]) {
        case "RegularTurn":
            gameState = new RegularTurn(gameStateObj["color"]);
            break;
        case "Multicapture":
            let currentIndex: number | undefined = gameStateObj["currentIndex"];
            if(currentIndex === undefined) {
                throw "fromObject: currentIndex is undefined!";
            }
            gameState = new Multicapture(gameStateObj["color"], currentIndex);
            break;
        case "CompleteGame":
            gameState = new CompleteGame(gameStateObj["color"]);
            break;
        default:
            throw "fromObject: Invalid currentState object";
    }
    return new Board(obj["pieces"], gameState, true);
}
