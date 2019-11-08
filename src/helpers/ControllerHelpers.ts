export function allItemsHaveValues(values: any[]): boolean {
  values.forEach(val => {
    if (val === null || val === undefined) {
      return false;
    }
  })
  return true;
}