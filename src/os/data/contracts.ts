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
export function comprLZEncode(plain: string): string {
  // for state[i][j]:
  //      if i is 0, we're adding a literal of length j
  //      else, we're adding a backreference of offset i and length j
  let curState: (string | null)[][] = Array.from(Array(10), () =>
    Array(10).fill(null)
  );
  let newState: (string | null)[][] = Array.from(Array(10), () => Array(10));

  function set(
    state: (string | null)[][],
    i: number,
    j: number,
    str: string
  ): void {
    const current = state[i][j];
    if (current == null || str.length < current.length) {
      state[i][j] = str;
    } else if (str.length === current.length && Math.random() < 0.5) {
      // if two strings are the same length, pick randomly so that
      // we generate more possible inputs to Compression II
      state[i][j] = str;
    }
  }

  // initial state is a literal of length 1
  curState[0][1] = '';

  for (let i = 1; i < plain.length; i += 1) {
    for (const row of newState) {
      row.fill(null);
    }
    const c = plain[i];

    // handle literals
    for (let length = 1; length <= 9; length += 1) {
      const string = curState[0][length];
      if (string == null) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (length < 9) {
        // extend current literal
        set(newState, 0, length + 1, string);
      } else {
        // start new literal
        set(newState, 0, 1, `${string}9${plain.substring(i - 9, i)}0`);
      }

      for (let offset = 1; offset <= Math.min(9, i); offset += 1) {
        if (plain[i - offset] === c) {
          // start new backreference
          set(
            newState,
            offset,
            1,
            string + String(length) + plain.substring(i - length, i)
          );
        }
      }
    }

    // handle backreferences
    for (let offset = 1; offset <= 9; offset += 1) {
      for (let length = 1; length <= 9; length += 1) {
        const string = curState[offset][length];
        if (string == null) {
          // eslint-disable-next-line no-continue
          continue;
        }

        if (plain[i - offset] === c) {
          if (length < 9) {
            // extend current backreference
            set(newState, offset, length + 1, string);
          } else {
            // start new backreference
            set(newState, offset, 1, `${string}9${String(offset)}0`);
          }
        }

        // start new literal
        set(newState, 0, 1, string + String(length) + String(offset));

        // end current backreference and start new backreference
        for (let newOffset = 1; newOffset <= Math.min(9, i); newOffset += 1) {
          if (plain[i - newOffset] === c) {
            set(
              newState,
              newOffset,
              1,
              `${string + String(length) + String(offset)}0`
            );
          }
        }
      }
    }

    const tmpState = newState;
    newState = curState;
    curState = tmpState;
  }

  let result = null;

  for (let len = 1; len <= 9; len += 1) {
    let string = curState[0][len];
    if (string == null) {
      // eslint-disable-next-line no-continue
      continue;
    }

    string += String(len) + plain.substring(plain.length - len, plain.length);
    if (result == null || string.length < result.length) {
      result = string;
    } else if (string.length === result.length && Math.random() < 0.5) {
      result = string;
    }
  }

  for (let offset = 1; offset <= 9; offset += 1) {
    for (let len = 1; len <= 9; len += 1) {
      let string = curState[offset][len];
      if (string == null) {
        // eslint-disable-next-line no-continue
        continue;
      }

      string += `${String(len)}${String(offset)}`;
      if (result == null || string.length < result.length) {
        result = string;
      } else if (string.length === result.length && Math.random() < 0.5) {
        result = string;
      }
    }
  }

  return result ?? '';
}

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

export function HammingEncode(data: number): string {
  const enc: number[] = [0];
  const dataBits: any[] = data.toString(2).split('').reverse();

  dataBits.forEach((e, i, a) => {
    a[i] = parseInt(e);
  });

  let k = dataBits.length;

  /* NOTE: writing the data like this flips the endianness, this is what the
   * original implementation by Hedrauta did so I'm keeping it like it was. */
  for (let i = 1; k > 0; i += 1) {
    // eslint-disable-next-line no-bitwise
    if ((i & (i - 1)) !== 0) {
      enc[i] = dataBits[(k -= 1)];
    } else {
      enc[i] = 0;
    }
  }

  let parity: any = 0;

  /* Figure out the subsection parities */
  for (let i = 0; i < enc.length; i += 1) {
    if (enc[i]) {
      // eslint-disable-next-line no-bitwise
      parity ^= i;
    }
  }

  parity = parity.toString(2).split('').reverse();
  parity.forEach((e: any, i: any, a: any) => {
    a[i] = parseInt(e);
  });

  /* Set the parity bits accordingly */
  for (let i = 0; i < parity.length; i += 1) {
    enc[2 ** i] = parity[i] ? 1 : 0;
  }

  parity = 0;
  /* Figure out the overall parity for the entire block */
  for (let i = 0; i < enc.length; i += 1) {
    if (enc[i]) {
      parity += 1;
    }
  }

  /* Finally set the overall parity bit */
  enc[0] = parity % 2 === 0 ? 0 : 1;

  return enc.join('');
}

// export function HammingEncodeProperly(data: number): string {
//   /* How many bits do we need?
//    * n = 2^m
//    * k = 2^m - m - 1
//    * where k is the number of data bits, m the number
//    * of parity bits and n the number of total bits. */

//   let m = 1;

//   while (2 ** (2 ** m - m - 1) - 1 < data) {
//     m++;
//   }

//   const n: number = 2 ** m;
//   const k: number = 2 ** m - m - 1;

//   const enc: number[] = [0];
//   const data_bits: any[] = data.toString(2).split("").reverse();

//   data_bits.forEach((e, i, a) => {
//     a[i] = parseInt(e);
//   });

//   /* Flip endianness as in the original implementation by Hedrauta
//    * and write the data back to front
//    * XXX why do we do this? */
//   for (let i = 1, j = k; i < n; i++) {
//     if ((i & (i - 1)) != 0) {
//       enc[i] = data_bits[--j] ? data_bits[j] : 0;
//     }
//   }

//   let parity: any = 0;

//   /* Figure out the subsection parities */
//   for (let i = 0; i < n; i++) {
//     if (enc[i]) {
//       parity ^= i;
//     }
//   }

//   parity = parity.toString(2).split("").reverse();
//   parity.forEach((e: any, i: any, a: any) => {
//     a[i] = parseInt(e);
//   });

//   /* Set the parity bits accordingly */
//   for (let i = 0; i < m; i++) {
//     enc[2 ** i] = parity[i] ? 1 : 0;
//   }

//   parity = 0;
//   /* Figure out the overall parity for the entire block */
//   for (let i = 0; i < n; i++) {
//     if (enc[i]) {
//       parity++;
//     }
//   }

//   /* Finally set the overall parity bit */
//   enc[0] = parity % 2 == 0 ? 0 : 1;

//   return enc.join("");
// }

// export function HammingDecode(data: string): number {
//   let err = 0;
//   const bits: number[] = [];

//   /* TODO why not just work with an array of digits from the start? */
//   for (const i in data.split("")) {
//     const bit = parseInt(data[i]);
//     bits[i] = bit;

//     if (bit) {
//       err ^= +i;
//     }
//   }

//   /* If err != 0 then it spells out the index of the bit that was flipped */
//   if (err) {
//     /* Flip to correct */
//     bits[err] = bits[err] ? 0 : 1;
//   }

//   /* Now we have to read the message, bit 0 is unused (it's the overall parity bit
//    * which we don't care about). Each bit at an index that is a power of 2 is
//    * a parity bit and not part of the actual message. */

//   let ans = "";

//   for (let i = 1; i < bits.length; i++) {
//     /* i is not a power of two so it's not a parity bit */
//     if ((i & (i - 1)) != 0) {
//       ans += bits[i];
//     }
//   }

//   /* TODO to avoid ambiguity about endianness why not let the player return the extracted (and corrected)
//    * data bits, rather than guessing at how to convert it to a decimal string? */
//   return parseInt(ans, 2);
// }

// ******** CONTRACT HELPERS END ******** //

// ******** CONTRACT SOLVERS START ******** //
// ******** Find Largest Prime Factor
solvers['Find Largest Prime Factor'] = (data: any) => {
  let fac = 2;
  let n: number = data;
  while (n > (fac - 1) * (fac - 1)) {
    while (n % fac === 0) {
      n = Math.round(n / fac);
    }
    fac += 1;
  }

  return n === 1 ? fac - 1 : n;
};

// ******** Subarray with Maximum Sum
solvers['Subarray with Maximum Sum'] = (_data: any) => {
  const data = _data as number[];
  const nums: number[] = data.slice();
  for (let i = 1; i < nums.length; i += 1) {
    nums[i] = Math.max(nums[i], nums[i] + nums[i - 1]);
  }

  return Math.max(...nums);
};

// ******** Total Ways to Sum
solvers['Total Ways to Sum'] = (data: any) => {
  if (typeof data !== 'number') throw new Error('solver expected number');
  const ways: number[] = [1];
  ways.length = data + 1;
  ways.fill(0, 1);
  for (let i = 1; i < data; i += 1) {
    for (let j: number = i; j <= data; j += 1) {
      ways[j] += ways[j - i];
    }
  }

  return ways[data];
};

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

// ******** Spiralize Matrix
solvers['Spiralize Matrix'] = (data: any) => {
  const spiral = [];
  const m = data.length;
  const n = data[0].length;
  let u = 0;
  let d = m - 1;
  let l = 0;
  let r = n - 1;
  let k = 0;

  while (true) {
    // Up
    for (let col = l; col <= r; col += 1) {
      spiral[k] = data[u][col];
      k += 1;
    }
    // eslint-disable-next-line no-plusplus
    if (++u > d) {
      break;
    }

    // Right
    for (let row = u; row <= d; row += 1) {
      spiral[k] = data[row][r];
      k += 1;
    }
    // eslint-disable-next-line no-plusplus
    if (--r < l) {
      break;
    }

    // Down
    for (let col = r; col >= l; col -= 1) {
      spiral[k] = data[d][col];
      k += 1;
    }
    // eslint-disable-next-line no-plusplus
    if (--d < u) {
      break;
    }

    // Left
    for (let row = d; row >= u; row -= 1) {
      spiral[k] = data[row][l];
      k += 1;
    }
    // eslint-disable-next-line no-plusplus
    if (++l > r) {
      break;
    }
  }

  return spiral;
};

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

// ******** Array Jumping Game II
solvers['Array Jumping Game II'] = (_data: any) => {
  const data = _data as number[];
  const n: number = data.length;
  let reach = 0;
  let jumps = 0;
  let lastJump = -1;
  while (reach < n - 1) {
    let jumpedFrom = -1;
    for (let i = reach; i > lastJump; i -= 1) {
      if (i + data[i] > reach) {
        reach = i + data[i];
        jumpedFrom = i;
      }
    }
    if (jumpedFrom === -1) {
      jumps = 0;
      break;
    }
    lastJump = jumpedFrom;
    jumps += 1;
  }
  return jumps;
};

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

// ******** Generate IP Addresses
solvers['Generate IP Addresses'] = (data: any) => {
  if (typeof data !== 'string') throw new Error('solver expected string');
  const ret: string[] = [];
  for (let a = 1; a <= 3; a += 1) {
    for (let b = 1; b <= 3; b += 1) {
      for (let c = 1; c <= 3; c += 1) {
        for (let d = 1; d <= 3; d += 1) {
          if (a + b + c + d === data.length) {
            const A = parseInt(data.substring(0, a), 10);
            const B = parseInt(data.substring(a, a + b), 10);
            const C = parseInt(data.substring(a + b, a + b + c), 10);
            const D = parseInt(data.substring(a + b + c, a + b + c + d), 10);
            if (A <= 255 && B <= 255 && C <= 255 && D <= 255) {
              const ip: string = [
                A.toString(),
                '.',
                B.toString(),
                '.',
                C.toString(),
                '.',
                D.toString(),
              ].join('');
              if (ip.length === data.length + 3) {
                ret.push(ip);
              }
            }
          }
        }
      }
    }
  }

  return ret;
};

// ******** Algorithmic Stock Trader I
solvers['Algorithmic Stock Trader I'] = (_data: any) => {
  const data = _data as number[];
  let maxCur = 0;
  let maxSoFar = 0;
  for (let i = 1; i < data.length; i += 1) {
    maxCur = Math.max(0, (maxCur += data[i] - data[i - 1]));
    maxSoFar = Math.max(maxCur, maxSoFar);
  }

  return maxSoFar.toString();
};

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

// ******** Algorithmic Stock Trader IV
solvers['Algorithmic Stock Trader IV'] = (_data: any) => {
  const data = _data as [number, number[]];
  const k: number = data[0];
  const prices: number[] = data[1];

  const len = prices.length;
  if (len < 2) {
    // return parseInt(ans) === 0;
    return 0;
  }
  if (k > len / 2) {
    let res = 0;
    for (let i = 1; i < len; i += 1) {
      res += Math.max(prices[i] - prices[i - 1], 0);
    }

    // return parseInt(ans) === res;
    return res;
  }

  const hold: number[] = [];
  const rele: number[] = [];
  hold.length = k + 1;
  rele.length = k + 1;
  for (let i = 0; i <= k; i += 1) {
    hold[i] = Number.MIN_SAFE_INTEGER;
    rele[i] = 0;
  }

  let cur: number;
  for (let i = 0; i < len; i += 1) {
    cur = prices[i];
    for (let j = k; j > 0; j -= 1) {
      rele[j] = Math.max(rele[j], hold[j] + cur);
      hold[j] = Math.max(hold[j], rele[j - 1] - cur);
    }
  }

  return rele[k];
};

// ******** Minimum Path Sum in a Triangle
solvers['Minimum Path Sum in a Triangle'] = (_data: any) => {
  const data = _data as number[][];
  const n: number = data.length;
  const dp: number[] = data[n - 1].slice();
  for (let i = n - 2; i > -1; i -= 1) {
    for (let j = 0; j < data[i].length; j += 1) {
      dp[j] = Math.min(dp[j], dp[j + 1]) + data[i][j];
    }
  }

  return dp[0];
};

// ******** Unique Paths in a Grid I
solvers['Unique Paths in a Grid I'] = (_data: any) => {
  const data = _data as number[];
  const n: number = data[0]; // Number of rows
  const m: number = data[1]; // Number of columns
  const currentRow: number[] = [];
  currentRow.length = n;

  for (let i = 0; i < n; i += 1) {
    currentRow[i] = 1;
  }
  for (let row = 1; row < m; row += 1) {
    for (let i = 1; i < n; i += 1) {
      currentRow[i] += currentRow[i - 1];
    }
  }

  return currentRow[n - 1];
};

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

// ******** HammingCodes: Integer to Encoded Binary
solvers['HammingCodes: Integer to Encoded Binary'] = (data: any) => {
  if (typeof data !== 'number') throw new Error('solver expected number');
  return HammingEncode(data);
};

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

// ******** Compression I: RLE Compression
solvers['Compression I: RLE Compression'] = (data: any) => {
  let encoding = '';

  for (let i = 0; i < data.length; ) {
    let runLength = 1;
    while (i + 1 < data.length && data[i + 1] === data[i]) {
      runLength += 1;
      i += 1;
    }

    while (runLength > 9) {
      runLength -= 9;
      encoding += `9${data[i]}`;
    }
    encoding += runLength.toString() + data[i];

    i += 1;
  }

  return encoding;
};

// ******** Compression II: LZ Decompression
solvers['Compression II: LZ Decompression'] = (data: any) => {
  if (typeof data !== 'string') throw new Error('solver expected string');
  return comprLZDecode(data);
};

// ******** Compression III: LZ Compression
solvers['Compression III: LZ Compression'] = (data: any) => {
  if (typeof data !== 'string') throw new Error('solver expected string');
  return comprLZEncode(data);
};

// ******** Encryption I: Caesar Cipher
solvers['Encryption I: Caesar Cipher'] = (_data: any) => {
  if (!Array.isArray(_data)) throw new Error('data should be array of string');
  const data = _data as [string, number];
  // data = [plaintext, shift value]
  // build char array, shifting via map and join to final results
  const cipher = [...data[0]]
    .map((a) =>
      a === ' '
        ? a
        : String.fromCharCode(((a.charCodeAt(0) - 65 - data[1] + 26) % 26) + 65)
    )
    .join('');
  return cipher;
};

// ******** Encryption II: Vigenère Cipher
solvers['Encryption II: Vigenère Cipher'] = (_data: any) => {
  if (!Array.isArray(_data)) throw new Error('data should be array of string');
  const data = _data as [string, string];
  // data = [plaintext, keyword]
  // build char array, shifting via map and corresponding keyword letter and join to final results
  const cipher = [...data[0]]
    .map((a, i) =>
      a === ' '
        ? a
        : String.fromCharCode(
            ((a.charCodeAt(0) -
              2 * 65 +
              data[1].charCodeAt(i % data[1].length)) %
              26) +
              65
          )
    )
    .join('');
  return cipher;
};

// ******** CONTRACT SOLVERS END ******** //
