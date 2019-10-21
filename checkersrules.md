Let's think about how we can represent the game state.

1. There are only 32 squares on the board that matter: the dark squares. We're
going to number them 0-31. 0 is in the top left. 31 is in the bottom right.
2. The "row" is gotten from dividing the square by 4. The top row is Row 0.
3. Starting from an even row, doing a left diagonal (top right, bottom left)
adds 4. Thus, if we're on Square 0, a left diagonal will move us to Square 4.
4. Similarly, doing a right diagonal (top left, bottom right) adds 5. So, if we're
on Square 0, a right diagonal will bring us to Square 5.
5. Starting from an odd row, going left and right add 3 and 4, respectively. So,
if we're on Square 5, a right diagonal will bring us to Square 9. Note that because
of this, *two* diagonal moves, regardless of direction, will differ from the source
square by 7.
6. Each square has five possible occupants: none, a red man, a red king, a
black man, or a black king.
7. Black men must move in a positive direction. Red men must move in a negative
direction.
8. Note that when moving in a negative direction, the opposite applies
regarding even rows vs odd rows, so we can add one to the row when
determining its diagonals.
9. When a black man reaches Row 7, it gets promoted to a king.
10. When a red man reaches Row 0, it gets promoted to a king.
11. A king can move in both positive and negative directions.
11. A man can move if the square it's moving to is unoccupied.
12. A man can capture if the square in its diagonal is occupied by the opposite
color and the square in the next diagonal is unoccupied.
13. This logic must be applied again when the capture is complete to examine
double-jumps.
14. A player *must* capture if it's possible.
15. Play ends when no men of one color exist anymore.
16. No left diagonals if `(n-4) % 8 == 0`, as we're on the edge of the board.
17. No right diagonals if `(n-3) % 8 == 0`.
18. No left captures if `(n-4) % 8 == 0` or `n % 8 == 0`.
19. No right captures if `(n-3) % 8 == 0` or `(n-7) % 8 == 0`.
20. Make sure that you aren't going negative or too positive when moving.
