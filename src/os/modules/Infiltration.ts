// FROM REDIT https://www.reddit.com/r/Bitburner/comments/xycccn/automating_infiltration_suggestions_needed/
// AUTHOR: GenesisStrongshield. Contributors Particular-Ad2739, Grandasse, Mogria
// NOTE: This script is overpowered. Using it on NWO in Volhaven gains 150k Rep
// Overusing this will make all other aspects of the game pointless.
// WARNING: This breaks the game. 0 Stats allows you to beat most BitNodes in under an hour.
// Most would consider this 100% cheating, but its a singleplayer game so you do you.

// ******** Main Consts
const state: any = {
  // Name of the company that's infiltrated.
  company: '',

  // Whether infiltration started. False means, we're
  // waiting to arrive on the infiltration screen.
  started: false,

  // Details/state of the current mini game.
  // Is reset after every game.
  game: {},
};

// Speed of game actions, in milliseconds.
const speed = 22;

// Small hack to save RAM.
// This will work smoothly, because the script does not use
// any "ns" functions, it's a pure browser automation tool.
// eslint-disable-next-line no-eval
const wnd = eval('window');
const doc = wnd.document;

// ******** GAME SOLVERS
// List of all games and an automated solver.
const infiltrationGames = [
  {
    name: 'type it backward',
    init(screen) {
      const lines = getLines(getEl(screen, 'p'));
      state.game.data = lines[0].split('');
    },
    play(screen) {
      if (!state.game.data || !state.game.data.length) {
        delete state.game.data;
        return;
      }

      pressKey(state.game.data.shift());
    },
  },
  {
    name: 'enter the code',
    init(screen) {},
    play(screen) {
      // const h4 = getEl(screen, 'h4');
      // const code = h4[1].textContent;
      const spans = getEl(screen, 'div span');
      const code =
        spans[
          spans.length -
            1 -
            [...Array(spans.length).keys()].filter(
              (x) => spans[x].textContent === '?'
            ).length
        ].textContent;
      switch (code) {
        case '↑':
          pressKey('w');
          break;
        case '↓':
          pressKey('s');
          break;
        case '←':
          pressKey('a');
          break;
        case '→':
          pressKey('d');
          break;
        default:
      }
    },
  },
  {
    name: 'close the brackets',
    init(screen) {
      const data = getLines(getEl(screen, 'p'));
      const brackets = data.join('').split('');
      state.game.data = [];

      for (let i = brackets.length - 1; i >= 0; i -= 1) {
        const char = brackets[i];

        if (char === '<') {
          state.game.data.push('>');
        } else if (char === '(') {
          state.game.data.push(')');
        } else if (char === '{') {
          state.game.data.push('}');
        } else if (char === '[') {
          state.game.data.push(']');
        }
      }
    },
    play(screen) {
      if (!state.game.data || !state.game.data.length) {
        delete state.game.data;
        return;
      }

      pressKey(state.game.data.shift());
    },
  },
  {
    name: 'attack when his guard is down',
    // name: 'slash when his guard is down',
    init(screen) {
      state.game.data = 'wait';
    },
    play(screen) {
      const data = getLines(getEl(screen, 'h4'));

      if (state.game.data === 'attack') {
        pressKey(' ');
        state.game.data = 'done';
      }

      // Attack in next frame - instant attack sometimes
      // ends in failure.
      // if (state.game.data === 'wait' && data.indexOf('ATTACKING!') !== -1) {
      if (state.game.data === 'wait' && data[1].includes('Prep')) {
        state.game.data = 'attack';
      }
    },
  },
  {
    name: 'say something nice about the guard',
    init(screen) {},
    play(screen) {
      const correct = [
        'affectionate',
        'agreeable',
        'bright',
        'charming',
        'creative',
        'determined',
        'energetic',
        'friendly',
        'funny',
        'generous',
        'polite',
        'likable',
        'diplomatic',
        'helpful',
        'giving',
        'kind',
        'hardworking',
        'patient',
        'dynamic',
        'loyal',
        'straightforward',
      ];
      const word = getLines(getEl(screen, 'h5'))[1];

      if (correct.indexOf(word) !== -1) {
        pressKey(' ');
      } else {
        pressKey('w');
      }
    },
  },
  {
    name: 'remember all the mines',
    init(screen) {
      const rows = getEl(screen, 'p');
      let gridSize = null;
      switch (rows.length) {
        case 9:
          gridSize = [3, 3];
          break;
        case 12:
          gridSize = [3, 4];
          break;
        case 16:
          gridSize = [4, 4];
          break;
        case 20:
          gridSize = [4, 5];
          break;
        case 25:
          gridSize = [5, 5];
          break;
        case 30:
          gridSize = [5, 6];
          break;
        case 36:
          gridSize = [6, 6];
          break;
        default:
      }
      if (gridSize == null) {
        return;
      }
      // 12 20 30 42
      state.game.data = [];
      let index = 0;
      // for each row
      for (let y = 0; y < gridSize[1]; y += 1) {
        // initialize array data
        state.game.data[y] = [];
        for (let x = 0; x < gridSize[0]; x += 1) {
          // for each column in the row add to state data if it has a child
          if (rows[index].children.length > 0) {
            state.game.data[y].push(true);
          } else state.game.data[y].push(false);
          index += 1;
        }
      }
    },
    play(screen) {},
  },
  {
    name: 'mark all the mines',
    init(screen) {
      state.game.x = 0;
      state.game.y = 0;
      state.game.cols = state.game.data[0].length;
      state.game.dir = 1;
    },
    play(screen) {
      let { data, x, y, cols, dir } = state.game;

      if (data[y][x]) {
        pressKey(' ');
        data[y][x] = false;
      }

      x += dir;

      if (x < 0 || x >= cols) {
        x = Math.max(0, Math.min(cols - 1, x));
        y += 1;
        dir *= -1;
        pressKey('s');
      } else {
        pressKey(dir > 0 ? 'd' : 'a');
      }

      state.game.data = data;
      state.game.x = x;
      state.game.y = y;
      state.game.dir = dir;
    },
  },
  {
    name: 'match the symbols',
    init(screen) {
      const data = getLines(getEl(screen, 'h5 span'));
      const rows = getLines(getEl(screen, 'p'));
      const keypad = [];
      const targets = [];
      let gridSize = null;
      switch (rows.length) {
        case 9:
          gridSize = [3, 3];
          break;
        case 12:
          gridSize = [3, 4];
          break;
        case 16:
          gridSize = [4, 4];
          break;
        case 20:
          gridSize = [4, 5];
          break;
        case 25:
          gridSize = [5, 5];
          break;
        case 30:
          gridSize = [5, 6];
          break;
        case 36:
          gridSize = [6, 6];
          break;
        default:
      }
      if (gridSize == null) {
        return;
      }
      // build the keypad grid.
      let index = 0;
      for (let i = 0; i < gridSize[1]; i += 1) {
        keypad[i] = [];
        for (let y = 0; y < gridSize[0]; y += 1) {
          keypad[i].push(rows[index]);
          index += 1;
        }
      }
      // foreach data get coords of keypad entry
      for (let i = 0; i < data.length; i += 1) {
        const symbol = data[i].trim();
        // for each keypad entry
        for (let j = 0; j < keypad.length; j += 1) {
          const k = keypad[j].indexOf(symbol);

          if (k !== -1) {
            targets.push([j, k]);
            break;
          }
        }
      }
      state.game.data = targets;
      state.game.x = 0;
      state.game.y = 0;
    },
    play(screen) {
      const target = state.game.data[0];
      let { x, y } = state.game;

      if (!target) {
        return;
      }

      const toY = target[0];
      const toX = target[1];

      if (toY < y) {
        y -= 1;
        pressKey('w');
      } else if (toY > y) {
        y += 1;
        pressKey('s');
      } else if (toX < x) {
        x -= 1;
        pressKey('a');
      } else if (toX > x) {
        x += 1;
        pressKey('d');
      } else {
        pressKey(' ');
        state.game.data.shift();
      }

      state.game.x = x;
      state.game.y = y;
    },
  },
  {
    name: 'cut the wires with the following properties',
    init(screen) {
      const numberHack = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
      const colors = {
        red: 'red',
        white: 'white',
        blue: 'blue',
        'rgb(255, 193, 7)': 'yellow',
      };
      const wireColor = {
        red: [],
        white: [],
        blue: [],
        yellow: [],
      };
      // gather the instructions
      let instructions = [];
      for (const child of screen.children) instructions.push(child);
      const wiresData = instructions.pop();
      instructions.shift();
      instructions = getLines(instructions);
      // get the wire information
      const samples = getEl(wiresData, 'p');
      const wires = [];
      // get the amount of wires
      let wireCount = 0;
      for (let i = wireCount; i < samples.length; i += 1) {
        if (numberHack.includes(samples[i].innerText)) wireCount += 1;
        else break;
      }
      let index = 0;
      // get just the first 3 rows of wires.
      for (let i = 0; i < 3; i += 1) {
        // for each row
        for (let j = 0; j < wireCount; j += 1) {
          const node = samples[index];
          const color = colors[node.style.color];
          if (!color) {
            index += 1;
            continue;
          }
          wireColor[color].push(j + 1);
          index += 1;
        }
      }

      for (let i = 0; i < instructions.length; i++) {
        const line = instructions[i].trim().toLowerCase();

        if (!line || line.length < 10) {
          continue;
        }
        if (line.indexOf('cut wires number') !== -1) {
          const parts = line.split(/(number\s*|\.)/);
          wires.push(parseInt(parts[2]));
        }
        if (line.indexOf('cut all wires colored') !== -1) {
          const parts = line.split(/(colored\s*|\.)/);
          const color = parts[2];

          if (!wireColor[color]) {
            // should never happen.
            continue;
          }

          wireColor[color].forEach((num) => wires.push(num));
        }
      }

      // new Set() removes duplicate elements.
      state.game.data = [...new Set(wires)];
    },
    play(screen) {
      const wire = state.game.data;
      // state.game.data.shift();
      if (!wire) {
        return;
      }
      for (let i = 0; i < wire.length; i += 1) {
        pressKey(wire[i].toString());
      }
    },
  },
];

export async function main(ns: NS) {
  const args = ns.flags([
    ['start', false],
    ['stop', false],
    ['status', false],
    ['quiet', false],
  ]);

  function print(msg: string) {
    if (!args.quiet) {
      ns.tprint(`\n${msg}\n`);
    }
  }

  if (args.status) {
    if (wnd.tmrAutoInf) {
      print('Automated infiltration is active');
    } else {
      print('Automated infiltration is inactive');
    }
    return;
  }

  if (wnd.tmrAutoInf) {
    print('Stopping automated infiltration...');
    clearInterval(wnd.tmrAutoInf);
    delete wnd.tmrAutoInf;
  }

  if (args.stop) {
    return;
  }

  print(
    'Automated infiltration is enabled...\nWhen you visit the infiltration screen of any company, all tasks are completed automatically.'
  );

  endInfiltration();

  // Monitor the current screen and start infiltration once a
  // valid screen is detected.
  wnd.tmrAutoInf = setInterval(infLoop, speed);

  // Modify the addEventListener logic.
  wrapEventListeners();
}

/**
 * The infiltration loop, which is called at a rapid interval
 */
function infLoop() {
  if (!state.started) {
    waitForStart();
  } else {
    playGame();
  }
}

/**
 * Returns a list of DOM elements from the main game
 * container.
 */
function getEl(parent: any, selector: any) {
  let prefix = ':scope';

  if (typeof parent === 'string') {
    selector = parent;
    parent = doc;

    prefix = '.MuiBox-root>.MuiBox-root>.MuiBox-root';

    if (!doc.querySelectorAll(prefix).length) {
      prefix = '.MuiBox-root>.MuiBox-root>.MuiGrid-root';
    }
    if (!doc.querySelectorAll(prefix).length) {
      prefix = '.MuiContainer-root>.MuiPaper-root';
    }
    if (!doc.querySelectorAll(prefix).length) {
      return [];
    }
  }

  selector = selector.split(',');
  selector = selector.map((item: any) => `${prefix} ${item}`);
  selector = selector.join(',');

  return parent.querySelectorAll(selector);
}

/**
 * Returns the first element with matching text content.
 */
function filterByText(elements: any, text: any) {
  text = text.toLowerCase();

  for (let i = 0; i < elements.length; i += 1) {
    const content = elements[i].textContent.toLowerCase();

    if (content.indexOf(text) !== -1) {
      return elements[i];
    }
  }

  return null;
}

/**
 * Returns an array with the text-contents of the given elements.
 *
 * @param {NodeList} elements
 * @returns {string[]}
 */
function getLines(elements: any) {
  const lines: any = [];
  elements.forEach((el: any) => lines.push(el.textContent));

  return lines;
}

/**
 * Reset the state after infiltration is done.
 */
function endInfiltration() {
  unwrapEventListeners();
  state.company = '';
  state.started = false;
}

/**
 * Simulate a keyboard event (keydown + keyup).
 *
 * @param {string|int} keyOrCode A single letter (string) or key-code to send.
 */
function pressKey(keyOrCode: any) {
  let keyCode = 0;
  let key = '';

  if (typeof keyOrCode === 'string' && keyOrCode.length > 0) {
    key = keyOrCode.toLowerCase().substr(0, 1);
    keyCode = key.charCodeAt(0);
  } else if (typeof keyOrCode === 'number') {
    keyCode = keyOrCode;
    key = String.fromCharCode(keyCode);
  }

  if (!keyCode || key.length !== 1) {
    return;
  }

  function sendEvent(event: any) {
    const keyboardEvent = new KeyboardEvent(event, {
      key,
      keyCode,
    });

    doc.dispatchEvent(keyboardEvent);
  }

  sendEvent('keydown');
}

/**
 * Infiltration monitor to start automatic infiltration.
 *
 * This function runs asynchronously, after the "main" function ended,
 * so we cannot use any "ns" function here!
 */
function waitForStart() {
  if (state.started) {
    return;
  }

  const h4 = getEl('h4');

  if (!h4.length) {
    return;
  }
  const title = h4[0].textContent;
  if (title.indexOf('Infiltrating') !== 0) {
    return;
  }

  const btnStart = filterByText(getEl('button'), 'Start');
  if (!btnStart) {
    return;
  }

  state.company = title.substr(13);
  state.started = true;
  wrapEventListeners();

  console.log('Start automatic infiltration of', state.company);
  btnStart.click();
}

/**
 * Identify the current infiltration game.
 */
function playGame() {
  const screens = doc.querySelectorAll('.MuiContainer-root');

  if (!screens.length) {
    endInfiltration();
    return;
  }
  if (screens[0].children.length < 3) {
    return;
  }

  const screen = screens[0].children[2];
  const h4 = getEl(screen, 'h4');

  if (!h4.length) {
    endInfiltration();
    return;
  }

  const title = h4[0].textContent.trim().toLowerCase().split(/[!.(]/)[0];

  if (title === 'infiltration successful') {
    endInfiltration();
    return;
  }

  if (title === 'get ready') {
    return;
  }

  const game = infiltrationGames.find((game) => game.name === title);

  if (game) {
    if (state.game.current !== title) {
      state.game.current = title;
      game.init(screen);
    }

    game.play(screen);
  } else {
    console.error('Unknown game:', title);
  }
}

/**
 * Wrap all event listeners with a custom function that injects
 * the "isTrusted" flag.
 *
 * Is this cheating? Or is it real hacking? Don't care, as long
 * as it's working :)
 */
function wrapEventListeners() {
  if (!doc._addEventListener) {
    doc._addEventListener = doc.addEventListener;

    doc.addEventListener = function (type: any, callback: any, options: any) {
      if (typeof options === 'undefined') {
        options = false;
      }
      let handler = false;

      // For this script, we only want to modify "keydown" events.
      if (type === 'keydown') {
        handler = function (...args) {
          if (!args[0].isTrusted) {
            const hackedEv = {};

            for (const key in args[0]) {
              if (key === 'isTrusted') {
                hackedEv.isTrusted = true;
              } else if (typeof args[0][key] === 'function') {
                hackedEv[key] = args[0][key].bind(args[0]);
              } else {
                hackedEv[key] = args[0][key];
              }
            }

            args[0] = hackedEv;
          }

          return callback.apply(callback, args);
        };

        for (const prop in callback) {
          if (typeof callback[prop] === 'function') {
            handler[prop] = callback[prop].bind(callback);
          } else {
            handler[prop] = callback[prop];
          }
        }
      }

      if (!this.eventListeners) {
        this.eventListeners = {};
      }
      if (!this.eventListeners[type]) {
        this.eventListeners[type] = [];
      }
      this.eventListeners[type].push({
        listener: callback,
        useCapture: options,
        wrapped: handler,
      });

      return this._addEventListener(type, handler || callback, options);
    };
  }

  if (!doc._removeEventListener) {
    doc._removeEventListener = doc.removeEventListener;

    doc.removeEventListener = function (
      type: any,
      callback: any,
      options: any
    ) {
      if (typeof options === 'undefined') {
        options = false;
      }

      if (!this.eventListeners) {
        this.eventListeners = {};
      }
      if (!this.eventListeners[type]) {
        this.eventListeners[type] = [];
      }

      for (let i = 0; i < this.eventListeners[type].length; i += 1) {
        if (
          this.eventListeners[type][i].listener === callback &&
          this.eventListeners[type][i].useCapture === options
        ) {
          if (this.eventListeners[type][i].wrapped) {
            callback = this.eventListeners[type][i].wrapped;
          }

          this.eventListeners[type].splice(i, 1);
          break;
        }
      }

      if (this.eventListeners[type].length === 0) {
        delete this.eventListeners[type];
      }

      return this._removeEventListener(type, callback, options);
    };
  }
}

/**
 * Revert the "wrapEventListeners" changes.
 */
function unwrapEventListeners() {
  if (doc._addEventListener) {
    doc.addEventListener = doc._addEventListener;
    delete doc._addEventListener;
  }
  if (doc._removeEventListener) {
    doc.removeEventListener = doc._removeEventListener;
    delete doc._removeEventListener;
  }
  delete doc.eventListeners;
}
