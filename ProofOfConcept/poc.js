var Color;
(function (Color) {
    Color[Color["NO_COLOR"] = 0] = "NO_COLOR";
    Color[Color["RED"] = 1] = "RED";
    Color[Color["BLACK"] = 2] = "BLACK";
})(Color || (Color = {}));
;
var Piece;
(function (Piece) {
    Piece[Piece["NONE"] = 0] = "NONE";
    Piece[Piece["RED_MAN"] = 1] = "RED_MAN";
    Piece[Piece["RED_KING"] = 2] = "RED_KING";
    Piece[Piece["BLACK_MAN"] = 3] = "BLACK_MAN";
    Piece[Piece["BLACK_KING"] = 4] = "BLACK_KING";
})(Piece || (Piece = {}));
;
var Outcome;
(function (Outcome) {
    Outcome[Outcome["NOT_DONE"] = 0] = "NOT_DONE";
    Outcome[Outcome["RED_WIN"] = 1] = "RED_WIN";
    Outcome[Outcome["BLACK_WIN"] = 2] = "BLACK_WIN";
    Outcome[Outcome["DRAW"] = 3] = "DRAW";
})(Outcome || (Outcome = {}));
function any(f, arr) {
    for (var i = 0; i < arr.length; i++) {
        if (f(arr[i])) {
            return true;
        }
    }
    return false;
}
function zip(lst1, lst2) {
    var results = [];
    var leastLength = Math.min(lst1.length, lst2.length);
    for (var i = 0; i < leastLength; i++) {
        results.push([lst1[i], lst2[i]]);
    }
    return results;
}
function divvy(lst) {
    var _a = [[], []], result1 = _a[0], result2 = _a[1];
    for (var i = 0; i < lst.length - 1; i += 2) {
        result1.push(lst[i]);
        result2.push(lst[i + 1]);
    }
    return [result1, result2];
}
function pieceColor(piece) {
    if ([Piece.RED_MAN, Piece.RED_KING].indexOf(piece) >= 0) {
        return Color.RED;
    }
    if ([Piece.BLACK_MAN, Piece.BLACK_KING].indexOf(piece) >= 0) {
        return Color.BLACK;
    }
    return Color.NO_COLOR;
}
function repeatN(val, n) {
    var arr = [];
    for (var i = 0; i < n; i++) {
        arr.push(val);
    }
    return arr;
}
function range(start, end) {
    var result = [];
    for (var i = start; i < end; i++) {
        result.push(i);
    }
    return result;
}
function enumerate(lst) {
    return zip(range(0, lst.length + 1), lst);
}
function defaultBoard() {
    return repeatN(Piece.BLACK_MAN, 12)
        .concat(repeatN(Piece.NONE, 8))
        .concat(repeatN(Piece.RED_MAN, 12));
}
var Board = /** @class */ (function () {
    function Board(pieces, deepcopy) {
        if (pieces === void 0) { pieces = undefined; }
        if (deepcopy === void 0) { deepcopy = false; }
        if (pieces === undefined) {
            this.pieces = defaultBoard();
        }
        else {
            if (deepcopy) {
                this.pieces = pieces.slice();
            }
            else {
                this.pieces = pieces;
            }
        }
    }
    Board.prototype.isGameOver = function () {
        var _a = [0, 0], numRed = _a[0], numBlack = _a[1];
        for (var i = 0; i < this.pieces.length; i++) {
            if (pieceColor(this.pieces[i]) == Color.RED) {
                numRed++;
            }
            else if (pieceColor(this.pieces[i]) == Color.BLACK) {
                numBlack++;
            }
            if (numRed > 0 && numBlack > 0) {
                return Outcome.NOT_DONE;
            }
        }
        if (numRed > 0) {
            return Outcome.RED_WIN;
        }
        return Outcome.BLACK_WIN;
    };
    Board.prototype.potentialMoves = function (index) {
        var piece = this.pieces[index];
        return potentialMoveFunctions(piece)
            .map(function (f) { return f(index); })
            .filter(function (arg) { return arg !== undefined; });
    };
    // Given an index, return a list containing tuples.
    // The first element of each tuple is the index the piece must jump over to
    // reach the second element, which is the index the piece will land.
    Board.prototype.captureIndices = function (index) {
        var piece = this.pieces[index];
        return zip.apply(void 0, divvy(potentialMoveFunctions(piece).map(function (f) { return f(index); }))).filter(function (_a) {
            var x = _a[0], y = _a[1];
            return x !== undefined && y !== undefined;
        });
    };
    Board.prototype.canCapture = function (index, jumpOverIndex, targetIndex) {
        return this.pieces[index] !== Piece.NONE &&
            this.pieces[jumpOverIndex] !== Piece.NONE &&
            this.pieces[targetIndex] === Piece.NONE &&
            pieceColor(this.pieces[index]) !== pieceColor(this.pieces[jumpOverIndex]);
    };
    Board.prototype.findAllCaptures = function (index) {
        var _this = this;
        return this.captureIndices(index)
            .filter(function (_a) {
            var jI = _a[0], tI = _a[1];
            return _this.canCapture(index, jI, tI);
        }, this)
            .map(function (_a) {
            var _ = _a[0], target = _a[1];
            return target;
        });
    };
    return Board;
}());
function row(index) {
    return Math.floor(index / 4);
}
function evenRow(index) {
    return row(index) % 2 === 0;
}
function oddRow(index) {
    return !evenRow(index);
}
// Determining whether an index is on the edge of the board.
function topRow(index) {
    return row(index) === 0;
}
function bottomRow(index) {
    return row(index) === 7;
}
function leftSide(index) {
    return index % 8 === 4;
}
function rightSide(index) {
    return index % 8 === 3;
}
// Determining whether an index is adjacent to the edge of the board. This
// impacts whether it can capture in a certain direction.
function topAdjacent(index) {
    return row(index) <= 1;
}
function bottomAdjacent(index) {
    return row(index) >= 6;
}
function leftAdjacent(index) {
    return leftSide(index) || index % 8 === 0;
}
function rightAdjacent(index) {
    return rightSide(index) || index % 8 == 7;
}
// Obtaining possible diagonal moves.
function leftUp(index) {
    if (leftSide(index) || topRow(index)) {
        return undefined;
    }
    if (evenRow(index)) {
        return index - 4;
    }
    return index - 5;
}
function rightUp(index) {
    if (rightSide(index) || topRow(index)) {
        return undefined;
    }
    if (evenRow(index)) {
        return index - 3;
    }
    return index - 4;
}
function leftDown(index) {
    if (leftSide(index) || bottomRow(index)) {
        return undefined;
    }
    if (evenRow(index)) {
        return index + 4;
    }
    return index + 3;
}
function rightDown(index) {
    if (rightSide(index) || bottomRow(index)) {
        return undefined;
    }
    if (evenRow(index)) {
        return index + 5;
    }
    return index + 4;
}
// Obtaining possible diagonal captures.
function leftUpCapture(index) {
    if (leftAdjacent(index) || topAdjacent(index)) {
        return undefined;
    }
    return index - 9;
}
function rightUpCapture(index) {
    if (rightAdjacent(index) || topAdjacent(index)) {
        return undefined;
    }
    return index - 7;
}
function leftDownCapture(index) {
    if (leftAdjacent(index) || bottomAdjacent(index)) {
        return undefined;
    }
    return index + 7;
}
function rightDownCapture(index) {
    if (rightAdjacent(index) || bottomAdjacent(index)) {
        return undefined;
    }
    return index + 9;
}
var ALL_MOVES = [
    leftDown, leftDownCapture,
    rightDown, rightDownCapture,
    leftUp, leftUpCapture,
    rightUp, rightUpCapture
];
function potentialMoveFunctions(piece) {
    switch (piece) {
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
