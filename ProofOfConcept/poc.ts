enum Color {
    NO_COLOR,
    RED,
    BLACK,
};

enum Piece {
    NONE,
    RED_MAN,
    RED_KING,
    BLACK_MAN,
    BLACK_KING
};

enum Outcome {
    NOT_DONE,
    RED_WIN,
    BLACK_WIN,
    DRAW
}

function any<T>(f:(arg: T) => boolean, arr: T[]): boolean {
    for(let i = 0; i < arr.length; i++) {
        if(f(arr[i])) {
            return true;
        }
    }
    return false;
}

function zip<T1, T2>(lst1: T1[], lst2: T2[]): [T1, T2][] {
    let results: [T1, T2][] = []
    let leastLength = Math.min(lst1.length, lst2.length);
    for(let i = 0; i < leastLength; i++) {
        results.push([lst1[i], lst2[i]]);
    }
    return results;
}

function divvy<T>(lst: T[]): [T[], T[]] {
    let [result1, result2] = [[], []];
    for(let i = 0; i < lst.length-1; i += 2) {
        result1.push(lst[i]);
        result2.push(lst[i+1]);
    }
    return [result1, result2];
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

// Produce an array of N duplicates of val.
function repeatN<T>(val: T, n: number):T[] {
    let arr:T[] = [];
    for(let i = 0; i < n; i++) {
        arr.push(val);
    }
    return arr;
} 

function range(start: number, end: number): number[] {
    let result: number[] = [];
    for(let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
}

// Equivalent to the Python function - zip a list with numbers, starting from 0.
function enumerate<T>(lst: T[]): [number, T][] {
    return zip(range(0, lst.length+1), lst);
}

// Concatenate a bunch of lists into a single list.
function flatten<T>(lstlst: T[][]): T[] {
    return lstlst.reduce((accumulator, lst) => accumulator.concat(...lst), [])
}

// Default starting board - black pieces in the top three rows, blank squares in
// the next two rows, and red pieces in the bottom three rows.
function defaultBoard(): Piece[] {
    return repeatN(Piece.BLACK_MAN, 12)
                .concat(repeatN(Piece.NONE, 8))
                .concat(repeatN(Piece.RED_MAN, 12));
}

class Board {
    pieces: Piece[]
    constructor(pieces: Piece[] = undefined, deepcopy: boolean = false) {
        if(pieces === undefined) {
            this.pieces = defaultBoard();
        }
        else {
            if(deepcopy) {
                this.pieces = [...pieces];
            }
            else {
                this.pieces = pieces;
            }
        }
    }

    // There's an opportunity for optimization here: keep a count of pieces, and
    // decrement whenever there is a capture. In the meantime, we just iterate
    // through all 32 spots on the board.
    isGameOver(): Outcome {
        let [numRed, numBlack] = [0, 0];
        for(let i = 0; i < this.pieces.length; i++) {
            if(pieceColor(this.pieces[i]) == Color.RED) {
                numRed++;
            }
            else if(pieceColor(this.pieces[i]) == Color.BLACK) {
                numBlack++;
            }
            if(numRed > 0 && numBlack > 0) {
                return Outcome.NOT_DONE;
            }
        }
        if(numRed > 0) {
            return Outcome.RED_WIN;
        }
        return Outcome.BLACK_WIN;
    }

    // Obtain all potential moves by obtaining all move functions of the piece,
    // applying all of them, and returning the moves that aren't undefined.
    // Note that you can't just go by falsy values, because 0 is a valid index...
    potentialMoves(index: number): number[] {
        let piece: Piece = this.pieces[index];
        return potentialMoveFunctions(piece)
            .map(f => f(index))
            .filter(arg => arg !== undefined);
    }

    // Given an index, return a list containing tuples.
    // The first element of each tuple is the index the piece must jump over to
    // reach the second element, which is the index the piece will land.
    captureIndices(index: number): [number, number][] {
        let piece: Piece = this.pieces[index];
        return zip(...divvy(potentialMoveFunctions(piece).map(f => f(index))))
            .filter(([x, y]) => x !== undefined && y !== undefined)
    }

    // We care about the following:
    // * Is the index a piece?
    // * Is it jumping over a piece?
    // * Is it landing on an empty square?
    // * Is the piece at the index a different color from the one it's jumping
    // over?
    canCapture(index, jumpOverIndex, targetIndex): boolean {
        return this.pieces[index] !== Piece.NONE &&
            this.pieces[jumpOverIndex] !== Piece.NONE &&
            this.pieces[targetIndex] === Piece.NONE &&
            pieceColor(this.pieces[index]) !== pieceColor(this.pieces[jumpOverIndex]);
    }

    // Get all of the possible ways a piece can capture, and filter out the ones
    // where canCapture fails.
    findAllCaptures(index: number): number[] {
        return this.captureIndices(index)
                   .filter(([jI, tI]) => this.canCapture(index, jI, tI), this)
                   .map(([_, target]) => target);
    }

    // Iterate through all of the squares on the board to see if there is a
    // capture.
    // We filter out the indices that don't have a piece with the provided
    // color, find all of the captures, concatenate them together, and see if
    // there is anything in the list.
    // Again, there might be room for optimization - we could do this
    // iteratively and exit immediately upon finding a piece that can capture.
    mustCapture(color: Color): boolean {
        return flatten(
                enumerate(this.pieces)
                    .filter(([_, p]) => pieceColor(p) == color)
                    .map(([i, _]) => this.findAllCaptures(i), this)).length !== 0;
    }
}

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

function leftUp(index: number): number {
    if(leftSide(index) || topRow(index)) {
        return undefined;
    }
    if(evenRow(index)) {
        return index - 4;
    }
    return index - 5;
}

function rightUp(index: number): number {
    if(rightSide(index) || topRow(index)) {
        return undefined;
    }
    if(evenRow(index)) {
        return index - 3;
    }
    return index - 4;
}

function leftDown(index: number): number {
    if(leftSide(index) || bottomRow(index)) {
        return undefined;
    }
    if(evenRow(index)) {
        return index + 4;
    }
    return index + 3;
}

function rightDown(index: number): number {
    if(rightSide(index) || bottomRow(index)) {
        return undefined;
    }
    if(evenRow(index)) {
        return index + 5;
    }
    return index + 4;
}

// Obtaining possible diagonal captures.

function leftUpCapture(index: number): number {
    if (leftAdjacent(index) || topAdjacent(index)) {
        return undefined;
    }
    return index - 9;
}

function rightUpCapture(index: number): number {
    if(rightAdjacent(index) || topAdjacent(index)) {
        return undefined;
    }
    return index - 7;
}

function leftDownCapture(index: number): number {
    if (leftAdjacent(index) || bottomAdjacent(index)) {
        return undefined;
    }
    return index + 7;
}

function rightDownCapture(index: number): number {
    if(rightAdjacent(index) || bottomAdjacent(index)) {
        return undefined;
    }
    return index + 9;
}

const ALL_MOVES: ((arg: number) => number)[] = [
    leftDown, leftDownCapture,
    rightDown, rightDownCapture,
    leftUp, leftUpCapture,
    rightUp, rightUpCapture
]

function potentialMoveFunctions(piece: Piece): ((arg: number) => number)[] {
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