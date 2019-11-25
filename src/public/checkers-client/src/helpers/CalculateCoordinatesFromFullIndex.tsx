function calculateCoordinatesFromFullIndex(index: number): any {
  const row = Math.floor(index/8) + 1;
  const column = index % 8 + 1;

  return {
    '--row': `${row}/${row+1}`,
    '--column': `${column}/${column+1}`
  };
}

export default calculateCoordinatesFromFullIndex;
