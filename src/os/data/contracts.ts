// ******** Export Solvers
export const solvers: any = {};

// ******** CONTRACT CHECKERS START ******** //
function removeBracketsFromArrayString(str: string): string {
  let strCpy: string = str;
  if (strCpy.startsWith('[')) {
    strCpy = strCpy.slice(1);
  }
  if (strCpy.endsWith(']')) {
    strCpy = strCpy.slice(0, -1);
  }

  return strCpy;
}

function removeQuotesFromString(str: string): string {
  let strCpy: string = str;
  if (strCpy.startsWith('"') || strCpy.startsWith("'")) {
    strCpy = strCpy.slice(1);
  }
  if (strCpy.endsWith('"') || strCpy.endsWith("'")) {
    strCpy = strCpy.slice(0, -1);
  }

  return strCpy;
}

function convert2DArrayToString(arr: any) {
  const components: any = [];
  arr.forEach((e: unknown) => {
    let s = String(e);
    s = ['[', s, ']'].join('');
    components.push(s);
  });

  return components.join(',').replace(/\s/g, '');
}
// ******** CONTRACT CHECKERS END ******** //

// ******** CONTRACT HELPERS START ******** //
// choose random character for generating plaintexts to compress
// export function comprGenChar(): string {
//   const r = Math.random();
//   if (r < 0.4) {
//     return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(26 * Math.random())];
//   }
//   if (r < 0.8) {
//     return 'abcdefghijklmnopqrstuvwxyz'[Math.floor(26 * Math.random())];
//   }
//   return '01234567689'[Math.floor(10 * Math.random())];
// }

// generate plaintext which is amenable to LZ encoding
// export function comprLZGenerate(): string {
//   const length = 50 + Math.floor(25 * (Math.random() + Math.random()));
//   let plain = '';

//   while (plain.length < length) {
//     if (Math.random() < 0.8) {
//       plain += comprGenChar();
//     } else {
//       const length = 1 + Math.floor(9 * Math.random());
//       const offset = 1 + Math.floor(9 * Math.random());
//       if (offset > plain.length) {
//         continue;
//       }

//       for (let i = 0; i < length; ++i) {
//         plain += plain[plain.length - offset];
//       }
//     }
//   }

//   return plain.substring(0, length);
// }

// compress plaintest string
// export function comprLZEncode(plain: string): string {
//   // for state[i][j]:
//   //      if i is 0, we're adding a literal of length j
//   //      else, we're adding a backreference of offset i and length j
//   let cur_state: (string | null)[][] = Array.from(Array(10), () =>
//     Array(10).fill(null)
//   );
//   let new_state: (string | null)[][] = Array.from(Array(10), () => Array(10));

//   function set(
//     state: (string | null)[][],
//     i: number,
//     j: number,
//     str: string
//   ): void {
//     const current = state[i][j];
//     if (current == null || str.length < current.length) {
//       state[i][j] = str;
//     } else if (str.length === current.length && Math.random() < 0.5) {
//       // if two strings are the same length, pick randomly so that
//       // we generate more possible inputs to Compression II
//       state[i][j] = str;
//     }
//   }

//   // initial state is a literal of length 1
//   cur_state[0][1] = '';

//   for (let i = 1; i < plain.length; ++i) {
//     for (const row of new_state) {
//       row.fill(null);
//     }
//     const c = plain[i];

//     // handle literals
//     for (let length = 1; length <= 9; ++length) {
//       const string = cur_state[0][length];
//       if (string == null) {
//         continue;
//       }

//       if (length < 9) {
//         // extend current literal
//         set(new_state, 0, length + 1, string);
//       } else {
//         // start new literal
//         set(new_state, 0, 1, `${string}9${plain.substring(i - 9, i)}0`);
//       }

//       for (let offset = 1; offset <= Math.min(9, i); ++offset) {
//         if (plain[i - offset] === c) {
//           // start new backreference
//           set(
//             new_state,
//             offset,
//             1,
//             string + String(length) + plain.substring(i - length, i)
//           );
//         }
//       }
//     }

//     // handle backreferences
//     for (let offset = 1; offset <= 9; ++offset) {
//       for (let length = 1; length <= 9; ++length) {
//         const string = cur_state[offset][length];
//         if (string == null) {
//           continue;
//         }

//         if (plain[i - offset] === c) {
//           if (length < 9) {
//             // extend current backreference
//             set(new_state, offset, length + 1, string);
//           } else {
//             // start new backreference
//             set(new_state, offset, 1, `${string}9${String(offset)}0`);
//           }
//         }

//         // start new literal
//         set(new_state, 0, 1, string + String(length) + String(offset));

//         // end current backreference and start new backreference
//         for (let new_offset = 1; new_offset <= Math.min(9, i); ++new_offset) {
//           if (plain[i - new_offset] === c) {
//             set(
//               new_state,
//               new_offset,
//               1,
//               `${string + String(length) + String(offset)}0`
//             );
//           }
//         }
//       }
//     }

//     const tmp_state = new_state;
//     new_state = cur_state;
//     cur_state = tmp_state;
//   }

//   let result = null;

//   for (let len = 1; len <= 9; ++len) {
//     let string = cur_state[0][len];
//     if (string == null) {
//       continue;
//     }

//     string += String(len) + plain.substring(plain.length - len, plain.length);
//     if (result == null || string.length < result.length) {
//       result = string;
//     } else if (string.length == result.length && Math.random() < 0.5) {
//       result = string;
//     }
//   }

//   for (let offset = 1; offset <= 9; ++offset) {
//     for (let len = 1; len <= 9; ++len) {
//       let string = cur_state[offset][len];
//       if (string == null) {
//         continue;
//       }

//       string += `${String(len)}${String(offset)}`;
//       if (result == null || string.length < result.length) {
//         result = string;
//       } else if (string.length == result.length && Math.random() < 0.5) {
//         result = string;
//       }
//     }
//   }

//   return result ?? '';
// }

// decompress LZ-compressed string, or return null if input is invalid
export function comprLZDecode(compr: string): string | null {
  let plain = '';

  for (let i = 0; i < compr.length; ) {
    const literalLength = compr.charCodeAt(i) - 0x30;

    if (
      literalLength < 0 ||
      literalLength > 9 ||
      i + 1 + literalLength > compr.length
    ) {
      return null;
    }

    plain += compr.substring(i + 1, i + 1 + literalLength);
    i += 1 + literalLength;

    if (i >= compr.length) {
      break;
    }
    const backrefLength = compr.charCodeAt(i) - 0x30;

    if (backrefLength < 0 || backrefLength > 9) {
      return null;
    }
    if (backrefLength === 0) {
      i += 1;
    } else {
      if (i + 1 >= compr.length) {
        return null;
      }

      const backrefOffset = compr.charCodeAt(i + 1) - 0x30;
      if (
        (backrefLength > 0 && (backrefOffset < 1 || backrefOffset > 9)) ||
        backrefOffset > plain.length
      ) {
        return null;
      }

      for (let j = 0; j < backrefLength; j += 1) {
        plain += plain[plain.length - backrefOffset];
      }

      i += 2;
    }
  }

  return plain;
}

// ******** CONTRACT HELPERS END ******** //

// ******** CONTRACT SOLVERS START ******** //
// solvers['Find Largest Prime Factor'] = (data: any) => {
//   let fac = 2;
//   let n: number = data;
//   while (n > (fac - 1) * (fac - 1)) {
//     while (n % fac === 0) {
//       n = Math.round(n / fac);
//     }
//     fac += 1;
//   }

//   return n === 1 ? fac - 1 : n;
// };

// name: 'Subarray with Maximum Sum',
//     numTries: 10,
//     solver: (_data: unknown, ans: string): boolean => {
//       const data = _data as number[];
//       const nums: number[] = data.slice();
//       for (let i = 1; i < nums.length; i++) {
//         nums[i] = Math.max(nums[i], nums[i] + nums[i - 1]);
//       }

//       return parseInt(ans, 10) === Math.max(...nums);
//     },

// name: 'Total Ways to Sum',
//     solver: (data: unknown, ans: string): boolean => {
//       if (typeof data !== 'number') throw new Error('solver expected number');
//       const ways: number[] = [1];
//       ways.length = data + 1;
//       ways.fill(0, 1);
//       for (let i = 1; i < data; ++i) {
//         for (let j: number = i; j <= data; ++j) {
//           ways[j] += ways[j - i];
//         }
//       }

//       return ways[data] === parseInt(ans, 10);
//     },

// ******** Total Ways to Sum II
solvers['Total Ways to Sum II'] = (data: any) => {
  // https://www.geeksforgeeks.org/coin-change-dp-7/?ref=lbp
  const n = data[0];
  const s = data[1];
  const ways: number[] = [1];
  ways.length = n + 1;
  ways.fill(0, 1);
  for (let i = 0; i < s.length; i += 1) {
    for (let j = s[i]; j <= n; j += 1) {
      ways[j] += ways[j - s[i]];
    }
  }
  return ways[n];
};

// name: 'Spiralize Matrix',
//     solver: (_data: unknown, ans: string): boolean => {
//       const data = _data as number[][];
//       const spiral: number[] = [];
//       const m: number = data.length;
//       const n: number = data[0].length;
//       let u = 0;
//       let d: number = m - 1;
//       let l = 0;
//       let r: number = n - 1;
//       let k = 0;
//       let done = false;
//       while (!done) {
//         // Up
//         for (let col: number = l; col <= r; col++) {
//           spiral[k] = data[u][col];
//           ++k;
//         }
//         if (++u > d) {
//           done = true;
//           continue;
//         }

//         // Right
//         for (let row: number = u; row <= d; row++) {
//           spiral[k] = data[row][r];
//           ++k;
//         }
//         if (--r < l) {
//           done = true;
//           continue;
//         }

//         // Down
//         for (let col: number = r; col >= l; col--) {
//           spiral[k] = data[d][col];
//           ++k;
//         }
//         if (--d < u) {
//           done = true;
//           continue;
//         }

//         // Left
//         for (let row: number = d; row >= u; row--) {
//           spiral[k] = data[row][l];
//           ++k;
//         }
//         if (++l > r) {
//           done = true;
//           continue;
//         }
//       }

//       const sanitizedPlayerAns = removeBracketsFromArrayString(ans).replace(
//         /\s/g,
//         ''
//       );
//       const playerAns = sanitizedPlayerAns.split(',').map((s) => parseInt(s));
//       if (spiral.length !== playerAns.length) {
//         return false;
//       }
//       for (let i = 0; i < spiral.length; ++i) {
//         if (spiral[i] !== playerAns[i]) {
//           return false;
//         }
//       }

//       return true;
//     }

// name: 'Array Jumping Game',
//     solver: (_data: unknown, ans: string): boolean => {
//       const data = _data as number[];
//       const n: number = data.length;
//       let i = 0;
//       for (let reach = 0; i < n && i <= reach; ++i) {
//         reach = Math.max(i + data[i], reach);
//       }
//       const solution: boolean = i === n;
//       return (ans === '1' && solution) || (ans === '0' && !solution);
//     }

// name: 'Array Jumping Game II',
//     solver: (_data: unknown, ans: string): boolean => {
//       const data = _data as number[];
//       const n: number = data.length;
//       let reach = 0;
//       let jumps = 0;
//       let lastJump = -1;
//       while (reach < n - 1) {
//         let jumpedFrom = -1;
//         for (let i = reach; i > lastJump; i--) {
//           if (i + data[i] > reach) {
//             reach = i + data[i];
//             jumpedFrom = i;
//           }
//         }
//         if (jumpedFrom === -1) {
//           jumps = 0;
//           break;
//         }
//         lastJump = jumpedFrom;
//         jumps++;
//       }
//       return jumps === parseInt(ans, 10);
//     }

// name: 'Merge Overlapping Intervals',
//     solver: (_data: unknown, ans: string): boolean => {
//       const data = _data as number[][];
//       const intervals: number[][] = data.slice();
//       intervals.sort((a: number[], b: number[]) => a[0] - b[0]);

//       const result: number[][] = [];
//       let start: number = intervals[0][0];
//       let end: number = intervals[0][1];
//       for (const interval of intervals) {
//         if (interval[0] <= end) {
//           end = Math.max(end, interval[1]);
//         } else {
//           result.push([start, end]);
//           start = interval[0];
//           end = interval[1];
//         }
//       }
//       result.push([start, end]);

//       const sanitizedResult: string = convert2DArrayToString(result);
//       const sanitizedAns: string = ans.replace(/\s/g, '');

//       return (
//         sanitizedResult === sanitizedAns ||
//         sanitizedResult === removeBracketsFromArrayString(sanitizedAns)
//       );
//     }

// name: 'Generate IP Addresses',
//     solver: (data: unknown, ans: string): boolean => {
//       if (typeof data !== 'string') throw new Error('solver expected string');
//       const ret: string[] = [];
//       for (let a = 1; a <= 3; ++a) {
//         for (let b = 1; b <= 3; ++b) {
//           for (let c = 1; c <= 3; ++c) {
//             for (let d = 1; d <= 3; ++d) {
//               if (a + b + c + d === data.length) {
//                 const A = parseInt(data.substring(0, a), 10);
//                 const B = parseInt(data.substring(a, a + b), 10);
//                 const C = parseInt(data.substring(a + b, a + b + c), 10);
//                 const D = parseInt(
//                   data.substring(a + b + c, a + b + c + d),
//                   10
//                 );
//                 if (A <= 255 && B <= 255 && C <= 255 && D <= 255) {
//                   const ip: string = [
//                     A.toString(),
//                     '.',
//                     B.toString(),
//                     '.',
//                     C.toString(),
//                     '.',
//                     D.toString(),
//                   ].join('');
//                   if (ip.length === data.length + 3) {
//                     ret.push(ip);
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }

//       const sanitizedAns: string = removeBracketsFromArrayString(ans).replace(
//         /\s/g,
//         ''
//       );
//       const ansArr: string[] = sanitizedAns
//         .split(',')
//         .map((ip) => ip.replace(/^(?<quote>['"])([\d.]*)\k<quote>$/g, '$2'));
//       if (ansArr.length !== ret.length) {
//         return false;
//       }
//       for (const ipInAns of ansArr) {
//         if (!ret.includes(ipInAns)) {
//           return false;
//         }
//       }

//       return true;
//     }

// name: 'Algorithmic Stock Trader I',
//     solver: (_data: unknown, ans: string): boolean => {
//       const data = _data as number[];
//       let maxCur = 0;
//       let maxSoFar = 0;
//       for (let i = 1; i < data.length; ++i) {
//         maxCur = Math.max(0, (maxCur += data[i] - data[i - 1]));
//         maxSoFar = Math.max(maxCur, maxSoFar);
//       }

//       return maxSoFar.toString() === ans;
//     }

// ******** Algorithmic Stock Trader II
solvers['Algorithmic Stock Trader II'] = (data: any) => {
  let profit = 0;
  for (let p = 1; p < data.length; p += 1) {
    profit += Math.max(data[p] - data[p - 1], 0);
  }

  return profit.toString();
};

// ******** Algorithmic Stock Trader III
solvers['Algorithmic Stock Trader III'] = (data: any) => {
  let hold1 = Number.MIN_SAFE_INTEGER;
  let hold2 = Number.MIN_SAFE_INTEGER;
  let release1 = 0;
  let release2 = 0;
  for (const price of data) {
    release2 = Math.max(release2, hold2 + price);
    hold2 = Math.max(hold2, release1 - price);
    release1 = Math.max(release1, hold1 + price);
    hold1 = Math.max(hold1, price * -1);
  }

  return release2.toString();
};

// name: 'Algorithmic Stock Trader IV',
//     solver: (_data: unknown, ans: string): boolean => {
//       const data = _data as [number, number[]];
//       const k: number = data[0];
//       const prices: number[] = data[1];

//       const len = prices.length;
//       if (len < 2) {
//         return parseInt(ans) === 0;
//       }
//       if (k > len / 2) {
//         let res = 0;
//         for (let i = 1; i < len; ++i) {
//           res += Math.max(prices[i] - prices[i - 1], 0);
//         }

//         return parseInt(ans) === res;
//       }

//       const hold: number[] = [];
//       const rele: number[] = [];
//       hold.length = k + 1;
//       rele.length = k + 1;
//       for (let i = 0; i <= k; ++i) {
//         hold[i] = Number.MIN_SAFE_INTEGER;
//         rele[i] = 0;
//       }

//       let cur: number;
//       for (let i = 0; i < len; ++i) {
//         cur = prices[i];
//         for (let j = k; j > 0; --j) {
//           rele[j] = Math.max(rele[j], hold[j] + cur);
//           hold[j] = Math.max(hold[j], rele[j - 1] - cur);
//         }
//       }

//       return parseInt(ans) === rele[k];
//     }

// name: 'Minimum Path Sum in a Triangle',
//     solver: (_data: unknown, ans: string): boolean => {
//       const data = _data as number[][];
//       const n: number = data.length;
//       const dp: number[] = data[n - 1].slice();
//       for (let i = n - 2; i > -1; --i) {
//         for (let j = 0; j < data[i].length; ++j) {
//           dp[j] = Math.min(dp[j], dp[j + 1]) + data[i][j];
//         }
//       }

//       return dp[0] === parseInt(ans);
//     }

// name: 'Unique Paths in a Grid I',
//     solver: (_data: unknown, ans: string): boolean => {
//       const data = _data as number[];
//       const n: number = data[0]; // Number of rows
//       const m: number = data[1]; // Number of columns
//       const currentRow: number[] = [];
//       currentRow.length = n;

//       for (let i = 0; i < n; i++) {
//         currentRow[i] = 1;
//       }
//       for (let row = 1; row < m; row++) {
//         for (let i = 1; i < n; i++) {
//           currentRow[i] += currentRow[i - 1];
//         }
//       }

//       return parseInt(ans) === currentRow[n - 1];
//     }

// ******** Unique Paths in a Grid II
solvers['Unique Paths in a Grid II'] = (data: any) => {
  const obstacleGrid: number[][] = [];
  obstacleGrid.length = data.length;
  for (let i = 0; i < obstacleGrid.length; i += 1) {
    obstacleGrid[i] = data[i].slice();
  }

  for (let i = 0; i < obstacleGrid.length; i += 1) {
    for (let j = 0; j < obstacleGrid[0].length; j += 1) {
      if (obstacleGrid[i][j] === 1) {
        obstacleGrid[i][j] = 0;
      } else if (i === 0 && j === 0) {
        obstacleGrid[0][0] = 1;
      } else {
        obstacleGrid[i][j] =
          (i > 0 ? obstacleGrid[i - 1][j] : 0) +
          (j > 0 ? obstacleGrid[i][j - 1] : 0);
      }
    }
  }

  return obstacleGrid[obstacleGrid.length - 1][obstacleGrid[0].length - 1];
};

// name: 'Shortest Path in a Grid',
//     solver: (_data: unknown, ans: string): boolean => {
//       const data = _data as number[][];
//       const width = data[0].length;
//       const height = data.length;
//       const dstY = height - 1;
//       const dstX = width - 1;

//       const distance: [number][] = new Array(height);
//       // const prev: [[number, number] | undefined][] = new Array(height);
//       const queue = new MinHeap<[number, number]>();

//       for (let y = 0; y < height; y++) {
//         distance[y] = new Array(width).fill(Infinity) as [number];
//         // prev[y] = new Array(width).fill(undefined) as [undefined];
//       }

//       function validPosition(y: number, x: number): boolean {
//         return y >= 0 && y < height && x >= 0 && x < width && data[y][x] == 0;
//       }

//       // List in-bounds and passable neighbors
//       function* neighbors(y: number, x: number): Generator<[number, number]> {
//         if (validPosition(y - 1, x)) yield [y - 1, x]; // Up
//         if (validPosition(y + 1, x)) yield [y + 1, x]; // Down
//         if (validPosition(y, x - 1)) yield [y, x - 1]; // Left
//         if (validPosition(y, x + 1)) yield [y, x + 1]; // Right
//       }

//       // Prepare starting point
//       distance[0][0] = 0;
//       queue.push([0, 0], 0);

//       // Take next-nearest position and expand potential paths from there
//       while (queue.size > 0) {
//         const [y, x] = queue.pop() as [number, number];
//         for (const [yN, xN] of neighbors(y, x)) {
//           const d = distance[y][x] + 1;
//           if (d < distance[yN][xN]) {
//             if (distance[yN][xN] == Infinity)
//               // Not reached previously
//               queue.push([yN, xN], d);
//             // Found a shorter path
//             else queue.changeWeight(([yQ, xQ]) => yQ == yN && xQ == xN, d);
//             // prev[yN][xN] = [y, x];
//             distance[yN][xN] = d;
//           }
//         }
//       }

//       // No path at all?
//       if (distance[dstY][dstX] == Infinity) return ans == '';

//       // There is a solution, require that the answer path is as short as the shortest
//       // path we found
//       if (ans.length > distance[dstY][dstX]) return false;

//       // Further verify that the answer path is a valid path
//       let ansX = 0;
//       let ansY = 0;
//       for (const direction of ans) {
//         switch (direction) {
//           case 'U':
//             ansY -= 1;
//             break;
//           case 'D':
//             ansY += 1;
//             break;
//           case 'L':
//             ansX -= 1;
//             break;
//           case 'R':
//             ansX += 1;
//             break;
//           default:
//             return false; // Invalid character
//         }
//         if (!validPosition(ansY, ansX)) return false;
//       }

//       // Path was valid, finally verify that the answer path brought us to the end coordinates
//       return ansY == dstY && ansX == dstX;
//     }

// ******** Sanitize Parentheses in Expression
solvers['Sanitize Parentheses in Expression'] = (data: any) => {
  let left = 0;
  let right = 0;
  const res: string[] = [];

  for (let i = 0; i < data.length; i += 1) {
    if (data[i] === '(') {
      left += 1;
    } else if (data[i] === ')') {
      // eslint-disable-next-line no-unused-expressions
      left > 0 ? (left -= 1) : (right += 1);
    }
  }

  /* eslint-disable no-shadow */
  function dfs(
    pair: number,
    index: number,
    left: number,
    right: number,
    s: string,
    solution: string,
    res: string[]
  ): void {
    if (s.length === index) {
      if (left === 0 && right === 0 && pair === 0) {
        for (let i = 0; i < res.length; i += 1) {
          if (res[i] === solution) {
            return;
          }
        }
        res.push(solution);
      }
      return;
    }

    if (s[index] === '(') {
      if (left > 0) {
        dfs(pair, index + 1, left - 1, right, s, solution, res);
      }
      dfs(pair + 1, index + 1, left, right, s, solution + s[index], res);
    } else if (s[index] === ')') {
      if (right > 0) dfs(pair, index + 1, left, right - 1, s, solution, res);
      if (pair > 0)
        dfs(pair - 1, index + 1, left, right, s, solution + s[index], res);
    } else {
      dfs(pair, index + 1, left, right, s, solution + s[index], res);
    }
  }
  /* eslint-enable no-shadow */

  dfs(0, 0, left, right, data, '', res);
  return res;
};

// ******** Find All Valid Math Expressions
solvers['Find All Valid Math Expressions'] = (data: any) => {
  const num = data[0];
  const target = data[1];

  /* eslint-disable no-shadow */
  function helper(
    res: string[],
    path: string,
    num: string,
    target: number,
    pos: number,
    evaluated: number,
    multed: number
  ): void {
    if (pos === num.length) {
      if (target === evaluated) {
        res.push(path);
      }
      return;
    }

    for (let i = pos; i < num.length; i += 1) {
      if (i !== pos && num[pos] === '0') {
        break;
      }
      const cur = parseInt(num.substring(pos, i + 1));

      if (pos === 0) {
        helper(res, path + cur, num, target, i + 1, cur, cur);
      } else {
        helper(res, `${path}+${cur}`, num, target, i + 1, evaluated + cur, cur);
        helper(
          res,
          `${path}-${cur}`,
          num,
          target,
          i + 1,
          evaluated - cur,
          -cur
        );
        helper(
          res,
          `${path}*${cur}`,
          num,
          target,
          i + 1,
          evaluated - multed + multed * cur,
          multed * cur
        );
      }
    }
  }
  /* eslint-enable no-shadow */

  const result: string[] = [];
  helper(result, '', num, target, 0, 0, 0);

  return result;
};

// name: 'HammingCodes: Integer to Encoded Binary',
//     solver: (data: unknown, ans: string): boolean => {
//       if (typeof data !== 'number') throw new Error('solver expected number');
//       return ans === HammingEncode(data);
//     }

// name: 'HammingCodes: Encoded Binary to Integer',
//     solver: (data: unknown, ans: string): boolean => {
//       if (typeof data !== 'string') throw new Error('solver expected string');
//       return parseInt(ans, 10) === HammingDecode(data);
//     }

// name: 'Proper 2-Coloring of a Graph',
//     solver: (_data: unknown, ans: string): boolean => {
//       // Helper function to get neighbourhood of a vertex
//       function neighbourhood(vertex: number): number[] {
//         const adjLeft = data[1].filter(([a]) => a == vertex).map(([, b]) => b);
//         const adjRight = data[1].filter(([, b]) => b == vertex).map(([a]) => a);
//         return adjLeft.concat(adjRight);
//       }

//       const data = _data as [number, [number, number][]];

//       // Sanitize player input
//       const sanitizedPlayerAns = removeBracketsFromArrayString(ans);

//       // Case where the player believes there is no solution.
//       // Attempt to construct one to check if this is correct.
//       if (sanitizedPlayerAns === '') {
//         // Verify that there is no solution by attempting to create a proper 2-coloring.
//         const coloring: (number | undefined)[] = Array(data[0]).fill(undefined);
//         while (coloring.some((val) => val === undefined)) {
//           // Color a vertex in the graph
//           const initialVertex: number = coloring.findIndex(
//             (val) => val === undefined
//           );
//           coloring[initialVertex] = 0;
//           const frontier: number[] = [initialVertex];

//           // Propagate the coloring throughout the component containing v greedily
//           while (frontier.length > 0) {
//             const v: number = frontier.pop() || 0;
//             const neighbors: number[] = neighbourhood(v);

//             // For each vertex u adjacent to v
//             for (const id in neighbors) {
//               const u: number = neighbors[id];

//               // Set the color of u to the opposite of v's color if it is new,
//               // then add u to the frontier to continue the algorithm.
//               if (coloring[u] === undefined) {
//                 if (coloring[v] === 0) coloring[u] = 1;
//                 else coloring[u] = 0;

//                 frontier.push(u);
//               }

//               // Assert u,v do not have the same color
//               else if (coloring[u] === coloring[v]) {
//                 // If u,v do have the same color, no proper 2-coloring exists, meaning
//                 // the player was correct to say there is no proper 2-coloring of the graph.
//                 return true;
//               }
//             }
//           }
//         }

//         // If this code is reached, there exists a proper 2-coloring of the input
//         // graph, and thus the player was incorrect in submitting no answer.
//         return false;
//       }

//       // Solution provided case
//       const sanitizedPlayerAnsArr: string[] = sanitizedPlayerAns.split(',');
//       const coloring: number[] = sanitizedPlayerAnsArr.map((val) =>
//         parseInt(val)
//       );
//       if (coloring.length == data[0]) {
//         const edges = data[1];
//         const validColors = [0, 1];
//         // Check that the provided solution is a proper 2-coloring
//         return edges.every(([a, b]) => {
//           const aColor = coloring[a];
//           const bColor = coloring[b];
//           return (
//             validColors.includes(aColor) && // Enforce the first endpoint is color 0 or 1
//             validColors.includes(bColor) && // Enforce the second endpoint is color 0 or 1
//             aColor != bColor // Enforce the endpoints are different colors
//           );
//         });
//       }

//       // Return false if the coloring is the wrong size
//       return false;
//     }

// name: 'Compression I: RLE Compression',
//     solver: (plain: unknown, ans: string): boolean => {
//       if (typeof plain !== 'string') throw new Error('solver expected string');
//       if (ans.length % 2 !== 0) {
//         return false;
//       }

//       let ans_plain = '';
//       for (let i = 0; i + 1 < ans.length; i += 2) {
//         const length = ans.charCodeAt(i) - 0x30;
//         if (length < 0 || length > 9) {
//           return false;
//         }

//         ans_plain += ans[i + 1].repeat(length);
//       }
//       if (ans_plain !== plain) {
//         return false;
//       }

//       let length = 0;
//       for (let i = 0; i < plain.length; ) {
//         let run_length = 1;
//         while (
//           i + run_length < plain.length &&
//           plain[i + run_length] === plain[i]
//         ) {
//           ++run_length;
//         }
//         i += run_length;

//         while (run_length > 0) {
//           run_length -= 9;
//           length += 2;
//         }
//       }

//       return ans.length <= length;
//     }

// ******** Compression II: LZ Decompression
solvers['Compression II: LZ Decompression'] = (data: unknown) => {
  if (typeof data !== 'string') throw new Error('solver expected string');
  return comprLZDecode(data);
};

// name: 'Compression III: LZ Compression',
//     solver: (plain: unknown, ans: string): boolean => {
//       if (typeof plain !== 'string') throw new Error('solver expected string');
//       return (
//         comprLZDecode(ans) === plain &&
//         ans.length <= comprLZEncode(plain).length
//       );
//     }

// name: 'Encryption I: Caesar Cipher',
//     solver: (_data: unknown, ans: string): boolean => {
//       if (!Array.isArray(_data))
//         throw new Error('data should be array of string');
//       const data = _data as [string, number];
//       // data = [plaintext, shift value]
//       // build char array, shifting via map and join to final results
//       const cipher = [...data[0]]
//         .map((a) =>
//           a === ' '
//             ? a
//             : String.fromCharCode(
//                 ((a.charCodeAt(0) - 65 - data[1] + 26) % 26) + 65
//               )
//         )
//         .join('');
//       return cipher === ans;
//     }

// name: 'Encryption II: Vigenère Cipher',
//     solver: (_data: unknown, ans: string): boolean => {
//       if (!Array.isArray(_data))
//         throw new Error('data should be array of string');
//       const data = _data as [string, string];
//       // data = [plaintext, keyword]
//       // build char array, shifting via map and corresponding keyword letter and join to final results
//       const cipher = [...data[0]]
//         .map((a, i) =>
//           a === ' '
//             ? a
//             : String.fromCharCode(
//                 ((a.charCodeAt(0) -
//                   2 * 65 +
//                   data[1].charCodeAt(i % data[1].length)) %
//                   26) +
//                   65
//               )
//         )
//         .join('');
//       return cipher === ans;
//     }

// ******** CONTRACT SOLVERS END ******** //
