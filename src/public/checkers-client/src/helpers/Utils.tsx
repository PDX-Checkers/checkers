// Equivalent to Haskell's any function. Traverses the list and applies f to
// each element. If any result is true, return true. Otherwise, return false.
export function id<T>(x: T): T {
  return x;
}

export function any<T>(f:(arg: T) => boolean, arr: T[]): boolean {
  for(let i = 0; i < arr.length; i++) {
      if(f(arr[i])) {
          return true;
      }
  }
  return false;
}

// Equivalent to Haskell's zip function. Takes two lists and combines them into
// a single list of lists.
export function zip<T1, T2>(lst1: T1[], lst2: T2[]): [T1, T2][] {
  let results: [T1, T2][] = []
  let leastLength = Math.min(lst1.length, lst2.length);
  for(let i = 0; i < leastLength; i++) {
      results.push([lst1[i], lst2[i]]);
  }
  return results;
}

// Takes a list and places the even elements (index 0, 2, 4, etc)
// into the first list, and places the odd elements into the second list.
export function divvy<T>(lst: T[]): [T[], T[]] {
  let [result1, result2]: [T[], T[]] = [[], []];
  for(let i = 0; i < lst.length-1; i += 2) {
      result1.push(lst[i]);
      result2.push(lst[i+1]);
  }
  return [result1, result2];
}

// Takes a tuple of two elements and returns the first element.
export function fst<T1, T2>([fstElem, _]: [T1, T2]): T1 {
  return fstElem;
}

// Takes a tuple of two elements and returns the second element.
export function snd<T1, T2>([_, secondElem]: [T1, T2]): T2 {
  return secondElem;
}

// Produce an array of N duplicates of val.
export function repeatN<T>(val: T, n: number):T[] {
  let arr:T[] = [];
  for(let i = 0; i < n; i++) {
      arr.push(val);
  }
  return arr;
} 

export function range(start: number, end: number): number[] {
  let result: number[] = [];
  for(let i = start; i < end; i++) {
      result.push(i);
  }
  return result;
}

// Equivalent to the Python function - zip a list with numbers, starting from 0.
export function enumerate<T>(lst: T[]): [number, T][] {
  return zip(range(0, lst.length+1), lst);
}

// Concatenate a bunch of lists into a single list.
export function flatten<T>(lstlst: T[][]): T[] {
  return lstlst.reduce((accumulator, lst) => accumulator.concat(...lst), [])
}

export function assertString(val: any): asserts val is string {
  if(typeof val !== 'string') {
      throw `assertString: ${val} is not a string!`;
  }
}

export function assertObjectLiteral(obj: any): asserts obj is object {
  if (!((!!obj) && (obj.constructor === Object))) {
      throw `assertObjectLiteral: ${obj} is not an object literal!`;
  }
}

export function assertIntegerList(lst: any): asserts lst is number[] {
  if(!(Array.isArray(lst) && any(id, lst.map(n => Number.isInteger(n))))) {
      throw `assertIntegerList: ${lst} is not a list of integers!`;
  }
}

export function assertInteger(n: any): asserts n is number {
  if(!Number.isInteger(n)) {
      throw `assertInteger: ${n} is not an integer!`;
  }
}

export type GameStateJSObject = {
  currentState: "RegularTurn" | "Multicapture" | "CompleteGame"
  color: number,
  currentIndex?: number
}


export type GameJSObject = {
  gameState: GameStateJSObject
  pieces: number[]
}

