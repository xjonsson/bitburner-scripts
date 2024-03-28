// import { openDB, deleteDB } from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';
// implements the above module but changes ["get"]() to ["get"] to compensate for the stanek["get"] bug

const e = (e, t) => t.some((t) => e instanceof t);
let t;
let n;
const r = new WeakMap();
const o = new WeakMap();
const s = new WeakMap();
const a = new WeakMap();
const i = new WeakMap();
let c = {
  get(e, t, n) {
    if (e instanceof IDBTransaction) {
      if (t === 'done') return o.get(e);
      if (t === 'objectStoreNames') return e.objectStoreNames || s.get(e);
      if (t === 'store')
        return n.objectStoreNames[1]
          ? void 0
          : n.objectStore(n.objectStoreNames[0]);
    }
    return l(e[t]);
  },
  set: (e, t, n) => ((e[t] = n), !0),
  has: (e, t) =>
    (e instanceof IDBTransaction && (t === 'done' || t === 'store')) || t in e,
};
function d(e) {
  return e !== IDBDatabase.prototype.transaction ||
    'objectStoreNames' in IDBTransaction.prototype
    ? (
        n ||
        (n = [
          IDBCursor.prototype.advance,
          IDBCursor.prototype.continue,
          IDBCursor.prototype.continuePrimaryKey,
        ])
      ).includes(e)
      ? function (...t) {
          return e.apply(f(this), t), l(r.get(this));
        }
      : function (...t) {
          return l(e.apply(f(this), t));
        }
    : function (t, ...n) {
        const r = e.call(f(this), t, ...n);
        return s.set(r, t.sort ? t.sort() : [t]), l(r);
      };
}
function u(n) {
  return typeof n === 'function'
    ? d(n)
    : (n instanceof IDBTransaction &&
        (function (e) {
          if (o.has(e)) return;
          const t = new Promise((t, n) => {
            const r = () => {
              e.removeEventListener('complete', o),
                e.removeEventListener('error', s),
                e.removeEventListener('abort', s);
            };
            const o = () => {
              t(), r();
            };
            const s = () => {
              n(e.error || new DOMException('AbortError', 'AbortError')), r();
            };
            e.addEventListener('complete', o),
              e.addEventListener('error', s),
              e.addEventListener('abort', s);
          });
          o.set(e, t);
        })(n),
      e(
        n,
        t ||
          (t = [
            IDBDatabase,
            IDBObjectStore,
            IDBIndex,
            IDBCursor,
            IDBTransaction,
          ])
      )
        ? new Proxy(n, c)
        : n);
}
function l(e) {
  if (e instanceof IDBRequest)
    return (function (e) {
      const t = new Promise((t, n) => {
        const r = () => {
          e.removeEventListener('success', o),
            e.removeEventListener('error', s);
        };
        const o = () => {
          t(l(e.result)), r();
        };
        const s = () => {
          n(e.error), r();
        };
        e.addEventListener('success', o), e.addEventListener('error', s);
      });
      return (
        t
          .then((t) => {
            t instanceof IDBCursor && r.set(t, e);
          })
          .catch(() => {}),
        i.set(t, e),
        t
      );
    })(e);
  if (a.has(e)) return a.get(e);
  const t = u(e);
  return t !== e && (a.set(e, t), i.set(t, e)), t;
}
const f = (e) => i.get(e);
function p(e, t, { blocked: n, upgrade: r, blocking: o, terminated: s } = {}) {
  const a = indexedDB.open(e, t);
  const i = l(a);
  return (
    r &&
      a.addEventListener('upgradeneeded', (e) => {
        r(l(a.result), e.oldVersion, e.newVersion, l(a.transaction), e);
      }),
    n && a.addEventListener('blocked', (e) => n(e.oldVersion, e.newVersion, e)),
    i
      .then((e) => {
        s && e.addEventListener('close', () => s()),
          o &&
            e.addEventListener('versionchange', (e) =>
              o(e.oldVersion, e.newVersion, e)
            );
      })
      .catch(() => {}),
    i
  );
}
function D(e, { blocked: t } = {}) {
  const n = indexedDB.deleteDatabase(e);
  return (
    t && n.addEventListener('blocked', (e) => t(e.oldVersion, e)),
    l(n).then(() => {})
  );
}
const v = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'];
const b = ['put', 'add', 'delete', 'clear'];
const I = new Map();
function B(e, t) {
  if (!(e instanceof IDBDatabase) || t in e || typeof t !== 'string') return;
  if (I.get(t)) return I.get(t);
  const n = t.replace(/FromIndex$/, '');
  const r = t !== n;
  const o = b.includes(n);
  if (
    !(n in (r ? IDBIndex : IDBObjectStore).prototype) ||
    (!o && !v.includes(n))
  )
    return;
  const s = async function (e, ...t) {
    const s = this.transaction(e, o ? 'readwrite' : 'readonly');
    let a = s.store;
    return (
      r && (a = a.index(t.shift())),
      (await Promise.all([a[n](...t), o && s.done]))[0]
    );
  };
  return I.set(t, s), s;
}
c = ((e) => ({
  ...e,
  get: (t, n, r) => B(t, n) || e.get(t, n, r),
  has: (t, n) => !!B(t, n) || e.has(t, n),
}))(c);
export { D as deleteDB, p as openDB, f as unwrap, l as wrap };
export default null;

/**
 * Returns a db object that can be used to interact with IndexedDB.
 * More functionality to probably come.
 *
 * @return {Promise<openDB>}
 */
export const handleDB = async () =>
  await p('twitchOS', 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (oldVersion < 1) {
        db.createObjectStore('player', { keyPath: 'id' });
        // db.createObjectStore('servers', { keyPath: 'id' });
        // db.createObjectStore('factions', { keyPath: 'name' });
        // db.createObjectStore('augmentations', { keyPath: 'name' });
        // db.createObjectStore('misc');
        // db.createObjectStore('hnet', { keyPath: 'id' });
        // db.createObjectStore('deltas', { keyPath: 'id' });
        // db.createObjectStore('stocks', { keyPath: 'symbol' });
        // db.createObjectStore('sourcefiles', { keyPath: 'bitnode' });
        // db.createObjectStore('crimes', { keyPath: 'name' });
      }
    },
    blocked() {
      // …
    },
    blocking() {
      // …
    },
    terminated() {
      // …
    },
  });
