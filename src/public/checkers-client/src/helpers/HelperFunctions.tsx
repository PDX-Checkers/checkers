// Generates a range of number from start to end exclusive
export function range(start: number, end: number): number[] {
  return Array.from({length: (end - start)}, (v, k) => k + start);
}

export function calculateCoordinatesFromFullIndex(index: number): any {
  const row = Math.floor(index/8) + 1;
  const column = index % 8 + 1;

  return {
    '--row': `${row}/${row+1}`,
    '--column': `${column}/${column+1}`
  };
}

export function calculateCoordinatesFromShortIndex(index: number): any {
  let fullIndex = index * 2;
  if (Math.floor(index/4) % 2 === 0) {
    fullIndex += 1;
  }
  return calculateCoordinatesFromFullIndex(fullIndex);
}

export function isLoggedIn(): boolean {
  return sessionStorage.getItem('loggedIn') === 'true' ? true : false;
}