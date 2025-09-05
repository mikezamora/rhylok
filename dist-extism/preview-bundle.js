var $e = Object.create;
var zt = Object.defineProperty;
var qe = Object.getOwnPropertyDescriptor;
var ts = Object.getOwnPropertyNames;
var es = Object.getPrototypeOf, ss = Object.prototype.hasOwnProperty;
var is = (l, t, e) => t in l ? zt(l, t, { enumerable: true, configurable: true, writable: true, value: e }) : l[t] = e;
var ne = (l, t) => () => (t || l((t = { exports: {} }).exports, t), t.exports);
var ns = (l, t, e, s) => {
  if (t && typeof t == "object" || typeof t == "function") for (let o of ts(t)) !ss.call(l, o) && o !== e && zt(l, o, { get: () => t[o], enumerable: !(s = qe(t, o)) || s.enumerable });
  return l;
};
var ls = (l, t, e) => (e = l != null ? $e(es(l)) : {}, ns(zt(e, "default", { value: l, enumerable: true }), l));
var le = (l, t, e) => (is(l, t + "", e), e), Jt = (l, t, e) => {
  if (!t.has(l)) throw TypeError("Cannot " + e);
};
var p = (l, t, e) => (Jt(l, t, "read from private field"), e ? e.call(l) : t.get(l)), L = (l, t, e) => {
  if (t.has(l)) throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(l) : t.set(l, e);
}, W = (l, t, e, s) => (Jt(l, t, "write to private field"), t.set(l, e), e);
var v = (l, t, e) => (Jt(l, t, "access private method"), e);
var Re = ne((fn, Ie) => {
  Ie.exports = Xe;
  function Xe(l, t, e) {
    l instanceof RegExp && (l = Ge(l, e)), t instanceof RegExp && (t = Ge(t, e));
    var s = fe(l, t, e);
    return s && { start: s[0], end: s[1], pre: e.slice(0, s[0]), body: e.slice(s[0] + l.length, s[1]), post: e.slice(s[1] + t.length) };
  }
  function Ge(l, t) {
    var e = t.match(l);
    return e ? e[0] : null;
  }
  Xe.range = fe;
  function fe(l, t, e) {
    var s, o, i, n, r, c = e.indexOf(l), a = e.indexOf(t, c + 1), d = c;
    if (c >= 0 && a > 0) {
      if (l === t) return [c, a];
      for (s = [], i = e.length; d >= 0 && !r; ) d == c ? (s.push(d), c = e.indexOf(l, d + 1)) : s.length == 1 ? r = [s.pop(), a] : (o = s.pop(), o < i && (i = o, n = a), a = e.indexOf(t, d + 1)), d = c < a && c >= 0 ? c : a;
      s.length && (r = [i, n]);
    }
    return r;
  }
});
var we = ne((In, Ke) => {
  var We = Re();
  Ke.exports = Gs;
  var xe = "\0SLASH" + Math.random() + "\0", ge = "\0OPEN" + Math.random() + "\0", vt = "\0CLOSE" + Math.random() + "\0", Ve = "\0COMMA" + Math.random() + "\0", Le = "\0PERIOD" + Math.random() + "\0";
  function Ut(l) {
    return parseInt(l, 10) == l ? parseInt(l, 10) : l.charCodeAt(0);
  }
  function Zs(l) {
    return l.split("\\\\").join(xe).split("\\{").join(ge).split("\\}").join(vt).split("\\,").join(Ve).split("\\.").join(Le);
  }
  function ys(l) {
    return l.split(xe).join("\\").split(ge).join("{").split(vt).join("}").split(Ve).join(",").split(Le).join(".");
  }
  function Se(l) {
    if (!l) return [""];
    var t = [], e = We("{", "}", l);
    if (!e) return l.split(",");
    var s = e.pre, o = e.body, i = e.post, n = s.split(",");
    n[n.length - 1] += "{" + o + "}";
    var r = Se(i);
    return i.length && (n[n.length - 1] += r.shift(), n.push.apply(n, r)), t.push.apply(t, n), t;
  }
  function Gs(l) {
    return l ? (l.substr(0, 2) === "{}" && (l = "\\{\\}" + l.substr(2)), yt(Zs(l), true).map(ys)) : [];
  }
  function Xs(l) {
    return "{" + l + "}";
  }
  function fs(l) {
    return /^-?0\d/.test(l);
  }
  function Is(l, t) {
    return l <= t;
  }
  function Rs(l, t) {
    return l >= t;
  }
  function yt(l, t) {
    var e = [], s = We("{", "}", l);
    if (!s) return [l];
    var o = s.pre, i = s.post.length ? yt(s.post, false) : [""];
    if (/\$$/.test(s.pre)) for (var n = 0; n < i.length; n++) {
      var r = o + "{" + s.body + "}" + i[n];
      e.push(r);
    }
    else {
      var c = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(s.body), a = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(s.body), d = c || a, h = s.body.indexOf(",") >= 0;
      if (!d && !h) return s.post.match(/,.*\}/) ? (l = s.pre + "{" + s.body + vt + s.post, yt(l)) : [l];
      var u;
      if (d) u = s.body.split(/\.\./);
      else if (u = Se(s.body), u.length === 1 && (u = yt(u[0], false).map(Xs), u.length === 1)) return i.map(function(je) {
        return s.pre + u[0] + je;
      });
      var b;
      if (d) {
        var y = Ut(u[0]), m = Ut(u[1]), Z = Math.max(u[0].length, u[1].length), G = u.length == 3 ? Math.abs(Ut(u[2])) : 1, V = Is, x = m < y;
        x && (G *= -1, V = Rs);
        var T = u.some(fs);
        b = [];
        for (var F = y; V(F, m); F += G) {
          var w;
          if (a) w = String.fromCharCode(F), w === "\\" && (w = "");
          else if (w = String(F), T) {
            var N = Z - w.length;
            if (N > 0) {
              var ht = new Array(N + 1).join("0");
              F < 0 ? w = "-" + ht + w.slice(1) : w = ht + w;
            }
          }
          b.push(w);
        }
      } else {
        b = [];
        for (var E = 0; E < u.length; E++) b.push.apply(b, yt(u[E], false));
      }
      for (var E = 0; E < b.length; E++) for (var n = 0; n < i.length; n++) {
        var r = o + b[E] + i[n];
        (!t || d || r) && e.push(r);
      }
    }
    return e;
  }
});
var M = { hasWorkerCapability: typeof globalThis < "u" ? globalThis.crossOriginIsolated && typeof SharedArrayBuffer < "u" : true, extismStdoutEnvVarSet: false };
var Wt, mt, Ft = class extends DataView {
  constructor(e) {
    super(e);
    L(this, mt, null);
  }
  json() {
    return JSON.parse(this.string());
  }
  arrayBuffer() {
    return this.buffer;
  }
  text() {
    return this.string();
  }
  string() {
    return p(Ft, Wt).decode(this.buffer);
  }
  bytes() {
    return p(this, mt) ?? W(this, mt, new Uint8Array(this.buffer)), p(this, mt);
  }
  setInt8(e, s) {
    throw new Error("Cannot set values on output");
  }
  setInt16(e, s, o) {
    throw new Error("Cannot set values on output");
  }
  setInt32(e, s, o) {
    throw new Error("Cannot set values on output");
  }
  setUint8(e, s) {
    throw new Error("Cannot set values on output");
  }
  setUint16(e, s, o) {
    throw new Error("Cannot set values on output");
  }
  setUint32(e, s, o) {
    throw new Error("Cannot set values on output");
  }
  setFloat32(e, s, o) {
    throw new Error("Cannot set values on output");
  }
  setFloat64(e, s, o) {
    throw new Error("Cannot set values on output");
  }
  setBigInt64(e, s, o) {
    throw new Error("Cannot set values on output");
  }
  setBigUint64(e, s, o) {
    throw new Error("Cannot set values on output");
  }
}, B = Ft;
Wt = /* @__PURE__ */ new WeakMap(), mt = /* @__PURE__ */ new WeakMap(), L(B, Wt, new TextDecoder());
var Q = 4;
function O(l) {
  switch (l) {
    case "trace":
      return 0;
    case "debug":
      return 1;
    case "info":
      return 2;
    case "warn":
      return 3;
    case "error":
      return 4;
    case "silent":
      return 2147483647;
    default:
      throw new TypeError(`unrecognized log level "${l}"; expected one of "trace", "debug", "info", "warn", "error", "silent"`);
  }
}
function re(l) {
  switch (l) {
    case 0:
      return "trace";
    case 1:
      return "debug";
    case 2:
      return "info";
    case 3:
      return "warn";
    case 4:
      return "error";
    case 2147483647:
      return "silent";
    default:
      throw new TypeError(`unrecognized log level "${l}"; expected one of "trace", "debug", "info", "warn", "error", "silent"`);
  }
}
async function ce(l) {
  throw new Error("readFile not supported in this environment");
}
async function kt(l, t) {
  if (String(l.headers.get("Content-Type")).split(";")[0] === "application/octet-stream") {
    let o = new Headers(l.headers);
    o.set("Content-Type", "application/wasm"), l = new Response(l.body, { status: l.status, statusText: l.statusText, headers: o });
  }
  let e = t ? await l.clone().arrayBuffer() : void 0;
  return { module: await WebAssembly.compileStreaming(l), data: e };
}
async function Pt(l, t) {
  if (l instanceof ArrayBuffer) return { wasm: [{ data: new Uint8Array(l) }] };
  if (l instanceof WebAssembly.Module) return { wasm: [{ module: l }] };
  if (typeof l == "string") {
    if (l.search(/^\s*\{/g) === 0) return ae(l);
    if (l.search(/^(https?|file):\/\//) !== 0) return { wasm: [{ path: l }] };
    l = new URL(l);
  }
  if (l instanceof Response || l?.constructor?.name === "Response") {
    let s = l, o = s.headers.get("content-type") || "application/octet-stream";
    switch (o.split(";")[0]) {
      case "application/octet-stream":
      case "application/wasm":
        return { wasm: [{ response: s }] };
      case "application/json":
      case "text/json":
        return Pt(ae(await s.text()), t);
      default:
        throw new TypeError(`While processing manifest URL "${s.url}"; expected content-type of "text/json", "application/json", "application/octet-stream", or "application/wasm"; got "${o}" after stripping off charset.`);
    }
  }
  if (l instanceof URL) return Pt(await t(l, { redirect: "follow" }), t);
  if (!("wasm" in l)) throw new TypeError('Expected "wasm" key in manifest');
  if (!Array.isArray(l.wasm)) throw new TypeError('Expected "manifest.wasm" to be array');
  let e = l.wasm.findIndex((s) => !("data" in s) && !("url" in s) && !("path" in s) && !("module" in s) && !("response" in s));
  if (e > -1) throw new TypeError(`Expected every item in "manifest.wasm" to include either a "data", "url", or "path" key; got bad item at index ${e}`);
  return { ...l };
}
function ae(l) {
  let t = JSON.parse(l);
  return { wasm: t.wasm, timeoutMs: t.timeoutMs ?? t.timeout_ms, allowedPaths: t.allowedPaths ?? t.allowed_paths, allowedHosts: t.allowedHosts ?? t.allowed_hosts, config: t.config, ...t.memory ? { maxHttpResponseBytes: t.memory.maxHttpResponseBytes ?? t.memory.max_http_response_bytes, maxPages: t.memory.maxPages ?? t.memory.max_pages, maxVarBytes: t.memory.maxVarBytes ?? t.memory.max_var_bytes } : {} };
}
async function os(l, t = fetch) {
  let e = await Pt(l, t);
  return e.config ??= {}, e;
}
async function de(l, t) {
  let e = [], s = await os(l, t), o = { allowedPaths: s.allowedPaths, allowedHosts: s.allowedHosts, config: s.config, memory: s.memory }, i = await Promise.all(s.wasm.map(async (n, r, c) => {
    let a, d;
    if (n.data) {
      let u = n.data;
      d = u.buffer ? u.buffer : u, a = await WebAssembly.compile(u);
    } else if (n.path) {
      n.path;
      let b = await ce();
      d = b.buffer, a = await WebAssembly.compile(b);
    } else if (n.url) {
      let u = await t(n.url, { headers: { accept: "application/wasm;q=0.9,application/octet-stream;q=0.8" } }), b = await kt(u, Boolean(n.hash));
      d = b.data, a = b.module;
    } else if (n.response) {
      let u = await kt(n.response, Boolean(n.hash));
      d = u.data, a = u.module;
    } else if (n.module) e[r] = n.name ?? String(r), a = n.module;
    else throw new Error(`Unrecognized wasm item at index ${r}. Keys include: "${Object.keys(n).sort().join(",")}"`);
    let h = String(r);
    if (n.hash) {
      if (!d) throw new Error("Item specified a hash but WebAssembly.Module source data is unavailable for hashing");
      let u = new Uint8Array(await crypto.subtle.digest("SHA-256", d)), b = new Uint8Array(32), y = true;
      for (let Z = 0; Z < 32; ++Z) b[Z] = parseInt(n.hash.slice(Z << 1, (Z << 1) + 2), 16), y = y && b[Z] === u[Z];
      let m = () => [...u].map((Z) => Z.toString(16).padStart(2, "0")).join("");
      if (!y) throw new Error(`Plugin error: hash mismatch. Expected: ${n.hash}. Actual: ${m()}`);
      h = m();
    }
    return e[r] = n.name ?? (r === c.length - 1 ? "main" : h), a;
  }));
  if (!e.includes("main")) throw new Error('manifest with multiple modules must designate one "main" module');
  return [o, e, i];
}
var Et = Symbol("begin"), xt = Symbol("end"), k = Symbol("env"), bt = Symbol("set-host-context"), pt = Symbol("get-block"), gt = Symbol("import-state"), Vt = Symbol("export-state"), A = Symbol("store-value"), it = Symbol("reset"), f = class {
  get byteLength() {
    return this.buffer.byteLength;
  }
  constructor(t, e) {
    this.buffer = t, this.view = new DataView(this.buffer), this.local = e;
  }
  static indexToAddress(t) {
    return BigInt(t) << 48n;
  }
  static addressToIndex(t) {
    return Number(BigInt(t) >> 48n);
  }
  static maskAddress(t) {
    return Number(BigInt(t) & (1n << 48n) - 1n);
  }
}, rs, ct = class {
  constructor(t, e, s, o, i) {
    this.#e = [];
    this.#r = /* @__PURE__ */ new Map();
    this[rs] = { alloc: (t2) => this.alloc(t2), free: (t2) => {
      this.#e[f.addressToIndex(t2)] = null;
    }, load_u8: (t2) => {
      let e2 = f.addressToIndex(t2), s2 = f.maskAddress(t2);
      return this.#e[e2]?.view.getUint8(Number(s2));
    }, load_u64: (t2) => {
      let e2 = f.addressToIndex(t2), s2 = f.maskAddress(t2);
      return this.#e[e2]?.view.getBigUint64(Number(s2), true);
    }, store_u8: (t2, e2) => {
      let s2 = f.addressToIndex(t2), o2 = f.maskAddress(t2);
      this.#e[s2]?.view.setUint8(Number(o2), Number(e2));
    }, store_u64: (t2, e2) => {
      let s2 = f.addressToIndex(t2), o2 = f.maskAddress(t2);
      this.#e[s2]?.view.setBigUint64(Number(o2), e2, true);
    }, input_offset: () => {
      let t2 = this.#t[this.#t.length - 1][0];
      return f.indexToAddress(t2 || 0);
    }, input_length: () => BigInt(this.#m?.byteLength ?? 0), input_load_u8: (t2) => {
      let e2 = f.maskAddress(t2);
      return this.#m?.view.getUint8(Number(e2));
    }, input_load_u64: (t2) => {
      let e2 = f.maskAddress(t2);
      return this.#m?.view.getBigUint64(Number(e2), true);
    }, output_set: (t2, e2) => {
      let s2 = f.addressToIndex(t2), o2 = this.#e[s2];
      if (!o2) throw new Error(`cannot assign to this block (addr=${t2.toString(16).padStart(16, "0")}; length=${e2})`);
      if (e2 > o2.buffer.byteLength) throw new Error("length longer than target block");
      this.#t[this.#t.length - 1][1] = s2;
    }, error_set: (t2) => {
      let e2 = f.addressToIndex(t2);
      if (!this.#e[e2]) throw new Error("cannot assign error to this block");
      this.#t[this.#t.length - 1][2] = e2;
    }, error_get: () => {
      let t2 = this.#t[this.#t.length - 1][2];
      return t2 ? f.indexToAddress(t2) : 0n;
    }, config_get: (t2) => {
      let e2 = this.read(t2);
      if (e2 === null) return 0n;
      try {
        let s2 = e2.string();
        if (s2 in this.#a) return this.store(this.#a[s2]);
      } finally {
        this[k].free(t2);
      }
      return 0n;
    }, var_get: (t2) => {
      let e2 = this.read(t2);
      if (e2 === null) return 0n;
      try {
        let s2 = e2.string(), o2 = this.getVariable(s2), i2 = o2 && this[A](o2.bytes()) || 0;
        return f.indexToAddress(i2);
      } finally {
        this[k].free(t2);
      }
    }, var_set: (t2, e2) => {
      let s2 = this.read(t2);
      if (s2 === null) {
        this.#s.error(`attempted to set variable using invalid key address (addr="${t2.toString(16)}H")`);
        return;
      }
      let o2 = s2.string();
      if (e2 === 0n) {
        this.deleteVariable(o2);
        return;
      }
      let i2 = this.#e[f.addressToIndex(e2)];
      if (!i2) {
        this.#s.error(`attempted to set variable to invalid address (key="${o2}"; addr="${e2.toString(16)}H")`);
        return;
      }
      try {
        let n = new Uint8Array(i2.buffer.byteLength);
        n.set(new Uint8Array(i2.buffer), 0), this.setVariable(o2, n);
      } catch (n) {
        this.#s.error(n.message), this.setError(n);
        return;
      }
    }, http_request: (t2, e2) => (this.#s.error("http_request is not enabled"), 0n), http_status_code: () => (this.#s.error("http_status_code is not enabled"), 0), http_headers: () => (this.#s.error("http_headers is not enabled"), 0n), length: (t2) => this.length(t2), length_unsafe: (t2) => this.length(t2), log_warn: this.#d.bind(this, O("warn"), "warn"), log_info: this.#d.bind(this, O("info"), "info"), log_debug: this.#d.bind(this, O("debug"), "debug"), log_error: this.#d.bind(this, O("error"), "error"), log_trace: this.#d.bind(this, O("trace"), "trace"), get_log_level: () => isFinite(this.#i) ? this.#i : 4294967295 };
    this.#n = t, this.#s = e, this.#i = s ?? 2147483647, this.#o = new TextDecoder(), this.#l = new TextEncoder(), this.#c = i, this.#u = 0, this.#t = [], this.alloc(1), this.#a = o;
  }
  #t;
  #e;
  #s;
  #i;
  #o;
  #l;
  #n;
  #a;
  #r;
  #u;
  #c;
  #h;
  hostContext() {
    return this.#h;
  }
  alloc(t) {
    let e = new f(new this.#n(Number(t)), true), s = this.#e.length;
    if (this.#e.push(e), this.#c.maxPages) {
      let i = this.#e.reduce((r, c) => r + (c?.buffer.byteLength ?? 0), 0), n = Math.ceil(i / 65536);
      if (n > this.#c.maxPages) return this.#s.error(`memory limit exceeded: ${n} pages requested, ${this.#c.maxPages} allowed`), 0n;
    }
    return f.indexToAddress(s);
  }
  getVariable(t) {
    return this.#r.has(t) ? new B(this.#r.get(t).buffer) : null;
  }
  setVariable(t, e) {
    let s = typeof e == "string" ? this.#l.encode(e) : e, o = this.#r.get(t), i = this.#u + s.byteLength - (o?.byteLength || 0);
    if (i > (this.#c?.maxVarBytes || 1 / 0)) throw new Error(`var memory limit exceeded: ${i} bytes requested, ${this.#c.maxVarBytes} allowed`);
    this.#u = i, this.#r.set(t, s);
  }
  deleteVariable(t) {
    let e = this.#r.get(t);
    !e || (this.#r.delete(t), this.#u -= e.byteLength);
  }
  read(t) {
    let e = f.addressToIndex(t), s = this.#e[e];
    if (!s) return null;
    let o = !(s.buffer instanceof ArrayBuffer) && true ? new Uint8Array(s.buffer).slice().buffer : s.buffer;
    return new B(o);
  }
  store(t) {
    let e = this[A](t);
    if (!e) throw new Error("failed to store output");
    return f.indexToAddress(e);
  }
  length(t) {
    let e = f.addressToIndex(t), s = this.#e[e];
    return s ? BigInt(s.buffer.byteLength) : 0n;
  }
  setError(t = null) {
    let e = t ? this[A](t instanceof Error ? t.message : t) : 0;
    if (!e) throw new Error("could not store error value");
    this.#t[this.#t.length - 1][2] = e;
  }
  get logLevel() {
    return re(this.#i);
  }
  set logLevel(t) {
    this.#i = O(t);
  }
  #d(t, e, s) {
    let o = f.addressToIndex(s), i = this.#e[o];
    if (!i) {
      this.#s.error(`failed to log(${e}): bad block reference in addr 0x${s.toString(16).padStart(64, "0")}`);
      return;
    }
    try {
      if (this.#i <= t) {
        let n = this.#o.decode(i.buffer);
        this.#s[e](n);
      }
    } finally {
      this.#e[o] = null;
    }
  }
  get #m() {
    let t = this.#t[this.#t.length - 1][0];
    return t === null ? null : this.#e[t];
  }
  [(rs = k, it)]() {
    this.#h = null, this.#e.length = 1, this.#t.length = 0;
  }
  [pt](t) {
    let e = this.#e[t];
    if (!e) throw new Error(`invalid block index: ${t}`);
    return e;
  }
  [gt](t, e = false) {
    for (let [s, o] of t.blocks) {
      if (s && e) {
        let i = new Uint8Array(new this.#n(Number(s.byteLength)));
        i.set(new Uint8Array(s)), s = i.buffer;
      }
      this.#e[o] = s ? new f(s, false) : null;
    }
    this.#t = t.stack;
  }
  [Vt]() {
    return { stack: this.#t.slice(), blocks: this.#e.map((t, e) => t ? t.local ? (t.local = false, [t.buffer, e]) : null : [null, e]).filter(Boolean) };
  }
  [A](t) {
    if (typeof t == "string" && (t = this.#l.encode(t)), !t) return null;
    if (t instanceof Uint8Array) {
      if (t.buffer.constructor === this.#n && t.byteOffset === 0 && t.byteLength === t.buffer.byteLength) {
        let i = this.#e.length;
        return this.#e.push(new f(t.buffer, true)), i;
      }
      let e = f.addressToIndex(this.alloc(t.length)), s = this.#e[e];
      return new Uint8Array(s.buffer).set(t, 0), e;
    }
    return t;
  }
  [bt](t) {
    this.#h = t;
  }
  [Et](t) {
    this.#t.push([t, null, null]);
  }
  [xt]() {
    this.#h = null;
    let [, t, e] = this.#t.pop(), s = e === null ? 1 : 0, o = e ?? t, i = [null, null];
    return o === null || this.#e[o] === null || (i[s] = o), i;
  }
};
var D = class {
  static read_bytes(t, e) {
    let s = new D();
    return s.buf = t.getUint32(e, true), s.buf_len = t.getUint32(e + 4, true), s;
  }
  static read_bytes_array(t, e, s) {
    let o = [];
    for (let i = 0; i < s; i++) o.push(D.read_bytes(t, e + 8 * i));
    return o;
  }
}, j = class {
  static read_bytes(t, e) {
    let s = new j();
    return s.buf = t.getUint32(e, true), s.buf_len = t.getUint32(e + 4, true), s;
  }
  static read_bytes_array(t, e, s) {
    let o = [];
    for (let i = 0; i < s; i++) o.push(j.read_bytes(t, e + 8 * i));
    return o;
  }
}, ue = 0, he = 1, Mt = 2;
var Bt = 4;
var me = 1 << 0, Lt = class {
  write_bytes(t, e) {
    t.setUint8(e, this.fs_filetype), t.setUint16(e + 2, this.fs_flags, true), t.setBigUint64(e + 8, this.fs_rights_base, true), t.setBigUint64(e + 16, this.fs_rights_inherited, true);
  }
  constructor(t, e) {
    this.fs_rights_base = 0n, this.fs_rights_inherited = 0n, this.fs_filetype = t, this.fs_flags = e;
  }
}, St = class {
  write_bytes(t, e) {
    t.setBigUint64(e, this.dev, true), t.setBigUint64(e + 8, this.ino, true), t.setUint8(e + 16, this.filetype), t.setBigUint64(e + 24, this.nlink, true), t.setBigUint64(e + 32, this.size, true), t.setBigUint64(e + 38, this.atim, true), t.setBigUint64(e + 46, this.mtim, true), t.setBigUint64(e + 52, this.ctim, true);
  }
  constructor(t, e) {
    this.dev = 0n, this.ino = 0n, this.nlink = 0n, this.atim = 0n, this.mtim = 0n, this.ctim = 0n, this.filetype = t, this.size = e;
  }
};
var hs = class {
  enable(t) {
    this.log = ms(t === void 0 ? true : t, this.prefix);
  }
  get enabled() {
    return this.isEnabled;
  }
  constructor(t) {
    this.isEnabled = t, this.prefix = "wasi:", this.enable(t);
  }
};
function ms(l, t) {
  return l ? console.log.bind(console, "%c%s", "color: #265BA0", t) : () => {
  };
}
var P = new hs(false);
var wt = class extends Error {
  constructor(t) {
    super("exit with exit code " + t), this.code = t;
  }
}, _t = class {
  start(t) {
    this.inst = t;
    try {
      t.exports._start();
    } catch (e) {
      if (e instanceof wt) return e.code;
      throw e;
    }
  }
  initialize(t) {
    this.inst = t, t.exports._initialize();
  }
  constructor(t, e, s, o = {}) {
    this.args = [], this.env = [], this.fds = [], P.enable(o.debug), this.args = t, this.env = e, this.fds = s;
    let i = this;
    this.wasiImport = { args_sizes_get(n, r) {
      let c = new DataView(i.inst.exports.memory.buffer);
      c.setUint32(n, i.args.length, true);
      let a = 0;
      for (let d of i.args) a += d.length + 1;
      return c.setUint32(r, a, true), P.log(c.getUint32(n, true), c.getUint32(r, true)), 0;
    }, args_get(n, r) {
      let c = new DataView(i.inst.exports.memory.buffer), a = new Uint8Array(i.inst.exports.memory.buffer), d = r;
      for (let h = 0; h < i.args.length; h++) {
        c.setUint32(n, r, true), n += 4;
        let u = new TextEncoder().encode(i.args[h]);
        a.set(u, r), c.setUint8(r + u.length, 0), r += u.length + 1;
      }
      return P.enabled && P.log(new TextDecoder("utf-8").decode(a.slice(d, r))), 0;
    }, environ_sizes_get(n, r) {
      let c = new DataView(i.inst.exports.memory.buffer);
      c.setUint32(n, i.env.length, true);
      let a = 0;
      for (let d of i.env) a += d.length + 1;
      return c.setUint32(r, a, true), P.log(c.getUint32(n, true), c.getUint32(r, true)), 0;
    }, environ_get(n, r) {
      let c = new DataView(i.inst.exports.memory.buffer), a = new Uint8Array(i.inst.exports.memory.buffer), d = r;
      for (let h = 0; h < i.env.length; h++) {
        c.setUint32(n, r, true), n += 4;
        let u = new TextEncoder().encode(i.env[h]);
        a.set(u, r), c.setUint8(r + u.length, 0), r += u.length + 1;
      }
      return P.enabled && P.log(new TextDecoder("utf-8").decode(a.slice(d, r))), 0;
    }, clock_res_get(n, r) {
      let c;
      switch (n) {
        case 1: {
          c = 5000n;
          break;
        }
        case 0: {
          c = 1000000n;
          break;
        }
        default:
          return 52;
      }
      return new DataView(i.inst.exports.memory.buffer).setBigUint64(r, c, true), 0;
    }, clock_time_get(n, r, c) {
      let a = new DataView(i.inst.exports.memory.buffer);
      if (n === 0) a.setBigUint64(c, BigInt((/* @__PURE__ */ new Date()).getTime()) * 1000000n, true);
      else if (n == 1) {
        let d;
        try {
          d = BigInt(Math.round(performance.now() * 1e6));
        } catch {
          d = 0n;
        }
        a.setBigUint64(c, d, true);
      } else a.setBigUint64(c, 0n, true);
      return 0;
    }, fd_advise(n, r, c, a) {
      return i.fds[n] != null ? i.fds[n].fd_advise(r, c, a) : 8;
    }, fd_allocate(n, r, c) {
      return i.fds[n] != null ? i.fds[n].fd_allocate(r, c) : 8;
    }, fd_close(n) {
      if (i.fds[n] != null) {
        let r = i.fds[n].fd_close();
        return i.fds[n] = void 0, r;
      } else return 8;
    }, fd_datasync(n) {
      return i.fds[n] != null ? i.fds[n].fd_datasync() : 8;
    }, fd_fdstat_get(n, r) {
      if (i.fds[n] != null) {
        let { ret: c, fdstat: a } = i.fds[n].fd_fdstat_get();
        return a?.write_bytes(new DataView(i.inst.exports.memory.buffer), r), c;
      } else return 8;
    }, fd_fdstat_set_flags(n, r) {
      return i.fds[n] != null ? i.fds[n].fd_fdstat_set_flags(r) : 8;
    }, fd_fdstat_set_rights(n, r, c) {
      return i.fds[n] != null ? i.fds[n].fd_fdstat_set_rights(r, c) : 8;
    }, fd_filestat_get(n, r) {
      if (i.fds[n] != null) {
        let { ret: c, filestat: a } = i.fds[n].fd_filestat_get();
        return a?.write_bytes(new DataView(i.inst.exports.memory.buffer), r), c;
      } else return 8;
    }, fd_filestat_set_size(n, r) {
      return i.fds[n] != null ? i.fds[n].fd_filestat_set_size(r) : 8;
    }, fd_filestat_set_times(n, r, c, a) {
      return i.fds[n] != null ? i.fds[n].fd_filestat_set_times(r, c, a) : 8;
    }, fd_pread(n, r, c, a, d) {
      let h = new DataView(i.inst.exports.memory.buffer), u = new Uint8Array(i.inst.exports.memory.buffer);
      if (i.fds[n] != null) {
        let b = D.read_bytes_array(h, r, c), { ret: y, nread: m } = i.fds[n].fd_pread(u, b, a);
        return h.setUint32(d, m, true), y;
      } else return 8;
    }, fd_prestat_get(n, r) {
      let c = new DataView(i.inst.exports.memory.buffer);
      if (i.fds[n] != null) {
        let { ret: a, prestat: d } = i.fds[n].fd_prestat_get();
        return d?.write_bytes(c, r), a;
      } else return 8;
    }, fd_prestat_dir_name(n, r, c) {
      if (i.fds[n] != null) {
        let { ret: a, prestat_dir_name: d } = i.fds[n].fd_prestat_dir_name();
        return d != null && new Uint8Array(i.inst.exports.memory.buffer).set(d, r), a;
      } else return 8;
    }, fd_pwrite(n, r, c, a, d) {
      let h = new DataView(i.inst.exports.memory.buffer), u = new Uint8Array(i.inst.exports.memory.buffer);
      if (i.fds[n] != null) {
        let b = j.read_bytes_array(h, r, c), { ret: y, nwritten: m } = i.fds[n].fd_pwrite(u, b, a);
        return h.setUint32(d, m, true), y;
      } else return 8;
    }, fd_read(n, r, c, a) {
      let d = new DataView(i.inst.exports.memory.buffer), h = new Uint8Array(i.inst.exports.memory.buffer);
      if (i.fds[n] != null) {
        let u = D.read_bytes_array(d, r, c), { ret: b, nread: y } = i.fds[n].fd_read(h, u);
        return d.setUint32(a, y, true), b;
      } else return 8;
    }, fd_readdir(n, r, c, a, d) {
      let h = new DataView(i.inst.exports.memory.buffer), u = new Uint8Array(i.inst.exports.memory.buffer);
      if (i.fds[n] != null) {
        let b = 0;
        for (; ; ) {
          let { ret: y, dirent: m } = i.fds[n].fd_readdir_single(a);
          if (y != 0) return h.setUint32(d, b, true), y;
          if (m == null) break;
          if (c - b < m.head_length()) {
            b = c;
            break;
          }
          let Z = new ArrayBuffer(m.head_length());
          if (m.write_head_bytes(new DataView(Z), 0), u.set(new Uint8Array(Z).slice(0, Math.min(Z.byteLength, c - b)), r), r += m.head_length(), b += m.head_length(), c - b < m.name_length()) {
            b = c;
            break;
          }
          m.write_name_bytes(u, r, c - b), r += m.name_length(), b += m.name_length(), a = m.d_next;
        }
        return h.setUint32(d, b, true), 0;
      } else return 8;
    }, fd_renumber(n, r) {
      if (i.fds[n] != null && i.fds[r] != null) {
        let c = i.fds[r].fd_close();
        return c != 0 ? c : (i.fds[r] = i.fds[n], i.fds[n] = void 0, 0);
      } else return 8;
    }, fd_seek(n, r, c, a) {
      let d = new DataView(i.inst.exports.memory.buffer);
      if (i.fds[n] != null) {
        let { ret: h, offset: u } = i.fds[n].fd_seek(r, c);
        return d.setBigInt64(a, u, true), h;
      } else return 8;
    }, fd_sync(n) {
      return i.fds[n] != null ? i.fds[n].fd_sync() : 8;
    }, fd_tell(n, r) {
      let c = new DataView(i.inst.exports.memory.buffer);
      if (i.fds[n] != null) {
        let { ret: a, offset: d } = i.fds[n].fd_tell();
        return c.setBigUint64(r, d, true), a;
      } else return 8;
    }, fd_write(n, r, c, a) {
      let d = new DataView(i.inst.exports.memory.buffer), h = new Uint8Array(i.inst.exports.memory.buffer);
      if (i.fds[n] != null) {
        let u = j.read_bytes_array(d, r, c), { ret: b, nwritten: y } = i.fds[n].fd_write(h, u);
        return d.setUint32(a, y, true), b;
      } else return 8;
    }, path_create_directory(n, r, c) {
      let a = new Uint8Array(i.inst.exports.memory.buffer);
      if (i.fds[n] != null) {
        let d = new TextDecoder("utf-8").decode(a.slice(r, r + c));
        return i.fds[n].path_create_directory(d);
      }
    }, path_filestat_get(n, r, c, a, d) {
      let h = new DataView(i.inst.exports.memory.buffer), u = new Uint8Array(i.inst.exports.memory.buffer);
      if (i.fds[n] != null) {
        let b = new TextDecoder("utf-8").decode(u.slice(c, c + a)), { ret: y, filestat: m } = i.fds[n].path_filestat_get(r, b);
        return m?.write_bytes(h, d), y;
      } else return 8;
    }, path_filestat_set_times(n, r, c, a, d, h, u) {
      let b = new Uint8Array(i.inst.exports.memory.buffer);
      if (i.fds[n] != null) {
        let y = new TextDecoder("utf-8").decode(b.slice(c, c + a));
        return i.fds[n].path_filestat_set_times(r, y, d, h, u);
      } else return 8;
    }, path_link(n, r, c, a, d, h, u) {
      let b = new Uint8Array(i.inst.exports.memory.buffer);
      if (i.fds[n] != null && i.fds[d] != null) {
        let y = new TextDecoder("utf-8").decode(b.slice(c, c + a)), m = new TextDecoder("utf-8").decode(b.slice(h, h + u));
        return i.fds[d].path_link(n, r, y, m);
      } else return 8;
    }, path_open(n, r, c, a, d, h, u, b, y) {
      let m = new DataView(i.inst.exports.memory.buffer), Z = new Uint8Array(i.inst.exports.memory.buffer);
      if (i.fds[n] != null) {
        let G = new TextDecoder("utf-8").decode(Z.slice(c, c + a));
        P.log(G);
        let { ret: V, fd_obj: x } = i.fds[n].path_open(r, G, d, h, u, b);
        if (V != 0) return V;
        i.fds.push(x);
        let T = i.fds.length - 1;
        return m.setUint32(y, T, true), 0;
      } else return 8;
    }, path_readlink(n, r, c, a, d, h) {
      let u = new DataView(i.inst.exports.memory.buffer), b = new Uint8Array(i.inst.exports.memory.buffer);
      if (i.fds[n] != null) {
        let y = new TextDecoder("utf-8").decode(b.slice(r, r + c));
        P.log(y);
        let { ret: m, data: Z } = i.fds[n].path_readlink(y);
        if (Z != null) {
          if (Z.length > d) return u.setUint32(h, 0, true), 8;
          b.set(Z, a), u.setUint32(h, Z.length, true);
        }
        return m;
      } else return 8;
    }, path_remove_directory(n, r, c) {
      let a = new Uint8Array(i.inst.exports.memory.buffer);
      if (i.fds[n] != null) {
        let d = new TextDecoder("utf-8").decode(a.slice(r, r + c));
        return i.fds[n].path_remove_directory(d);
      } else return 8;
    }, path_rename(n, r, c, a, d, h) {
      throw "FIXME what is the best abstraction for this?";
    }, path_symlink(n, r, c, a, d) {
      let h = new Uint8Array(i.inst.exports.memory.buffer);
      if (i.fds[c] != null) {
        let u = new TextDecoder("utf-8").decode(h.slice(n, n + r)), b = new TextDecoder("utf-8").decode(h.slice(a, a + d));
        return i.fds[c].path_symlink(u, b);
      } else return 8;
    }, path_unlink_file(n, r, c) {
      let a = new Uint8Array(i.inst.exports.memory.buffer);
      if (i.fds[n] != null) {
        let d = new TextDecoder("utf-8").decode(a.slice(r, r + c));
        return i.fds[n].path_unlink_file(d);
      } else return 8;
    }, poll_oneoff(n, r, c) {
      throw "async io not supported";
    }, proc_exit(n) {
      throw new wt(n);
    }, proc_raise(n) {
      throw "raised signal " + n;
    }, sched_yield() {
    }, random_get(n, r) {
      let c = new Uint8Array(i.inst.exports.memory.buffer);
      for (let a = 0; a < r; a++) c[n + a] = Math.random() * 256 | 0;
    }, sock_recv(n, r, c) {
      throw "sockets not supported";
    }, sock_send(n, r, c) {
      throw "sockets not supported";
    }, sock_shutdown(n, r) {
      throw "sockets not supported";
    }, sock_accept(n, r) {
      throw "sockets not supported";
    } };
  }
};
var nt = class {
  fd_advise(t, e, s) {
    return 58;
  }
  fd_allocate(t, e) {
    return 58;
  }
  fd_close() {
    return 0;
  }
  fd_datasync() {
    return 58;
  }
  fd_fdstat_get() {
    return { ret: 58, fdstat: null };
  }
  fd_fdstat_set_flags(t) {
    return 58;
  }
  fd_fdstat_set_rights(t, e) {
    return 58;
  }
  fd_filestat_get() {
    return { ret: 58, filestat: null };
  }
  fd_filestat_set_size(t) {
    return 58;
  }
  fd_filestat_set_times(t, e, s) {
    return 58;
  }
  fd_pread(t, e, s) {
    return { ret: 58, nread: 0 };
  }
  fd_prestat_get() {
    return { ret: 58, prestat: null };
  }
  fd_prestat_dir_name() {
    return { ret: 58, prestat_dir_name: null };
  }
  fd_pwrite(t, e, s) {
    return { ret: 58, nwritten: 0 };
  }
  fd_read(t, e) {
    return { ret: 58, nread: 0 };
  }
  fd_readdir_single(t) {
    return { ret: 58, dirent: null };
  }
  fd_seek(t, e) {
    return { ret: 58, offset: 0n };
  }
  fd_sync() {
    return 0;
  }
  fd_tell() {
    return { ret: 58, offset: 0n };
  }
  fd_write(t, e) {
    return { ret: 58, nwritten: 0 };
  }
  path_create_directory(t) {
    return 58;
  }
  path_filestat_get(t, e) {
    return { ret: 58, filestat: null };
  }
  path_filestat_set_times(t, e, s, o, i) {
    return 58;
  }
  path_link(t, e, s, o) {
    return 58;
  }
  path_open(t, e, s, o, i, n) {
    return { ret: 58, fd_obj: null };
  }
  path_readlink(t) {
    return { ret: 58, data: null };
  }
  path_remove_directory(t) {
    return 58;
  }
  path_rename(t, e, s) {
    return 58;
  }
  path_symlink(t, e) {
    return 58;
  }
  path_unlink_file(t) {
    return 58;
  }
};
var $ = class extends nt {
  fd_fdstat_get() {
    return { ret: 0, fdstat: new Lt(Bt, 0) };
  }
  fd_read(t, e) {
    let s = 0;
    for (let o of e) if (this.file_pos < this.file.data.byteLength) {
      let i = this.file.data.slice(Number(this.file_pos), Number(this.file_pos + BigInt(o.buf_len)));
      t.set(i, o.buf), this.file_pos += BigInt(i.length), s += i.length;
    } else break;
    return { ret: 0, nread: s };
  }
  fd_pread(t, e, s) {
    let o = 0;
    for (let i of e) if (s < this.file.data.byteLength) {
      let n = this.file.data.slice(Number(s), Number(s + BigInt(i.buf_len)));
      t.set(n, i.buf), s += BigInt(n.length), o += n.length;
    } else break;
    return { ret: 0, nread: o };
  }
  fd_seek(t, e) {
    let s;
    switch (e) {
      case ue:
        s = t;
        break;
      case he:
        s = this.file_pos + t;
        break;
      case Mt:
        s = BigInt(this.file.data.byteLength) + t;
        break;
      default:
        return { ret: 28, offset: 0n };
    }
    return s < 0 ? { ret: 28, offset: 0n } : (this.file_pos = s, { ret: 0, offset: this.file_pos });
  }
  fd_tell() {
    return { ret: 0, offset: this.file_pos };
  }
  fd_write(t, e) {
    let s = 0;
    if (this.file.readonly) return { ret: 8, nwritten: s };
    for (let o of e) {
      let i = t.slice(o.buf, o.buf + o.buf_len);
      if (this.file_pos + BigInt(i.byteLength) > this.file.size) {
        let n = this.file.data;
        this.file.data = new Uint8Array(Number(this.file_pos + BigInt(i.byteLength))), this.file.data.set(n);
      }
      this.file.data.set(i.slice(0, Number(this.file.size - this.file_pos)), Number(this.file_pos)), this.file_pos += BigInt(i.byteLength), s += o.buf_len;
    }
    return { ret: 0, nwritten: s };
  }
  fd_pwrite(t, e, s) {
    let o = 0;
    if (this.file.readonly) return { ret: 8, nwritten: o };
    for (let i of e) {
      let n = t.slice(i.buf, i.buf + i.buf_len);
      if (s + BigInt(n.byteLength) > this.file.size) {
        let r = this.file.data;
        this.file.data = new Uint8Array(Number(s + BigInt(n.byteLength))), this.file.data.set(r);
      }
      this.file.data.set(n.slice(0, Number(this.file.size - s)), Number(s)), s += BigInt(n.byteLength), o += i.buf_len;
    }
    return { ret: 0, nwritten: o };
  }
  fd_filestat_get() {
    return { ret: 0, filestat: this.file.stat() };
  }
  constructor(t) {
    super(), this.file_pos = 0n, this.file = t;
  }
};
var lt = class {
  open(t) {
    let e = new $(this);
    return t & me && e.fd_seek(0n, Mt), e;
  }
  get size() {
    return BigInt(this.data.byteLength);
  }
  stat() {
    return new St(Bt, this.size);
  }
  truncate() {
    return this.readonly ? 63 : (this.data = new Uint8Array([]), 0);
  }
  constructor(t, e) {
    this.data = new Uint8Array(t), this.readonly = !!e?.readonly;
  }
};
var Zt = class extends nt {
  #t;
  constructor(t) {
    super(), this.#t = t;
  }
  fd_write(t, e) {
    let s = 0, o = new TextDecoder(), i = e.reduce((n, r, c, a) => {
      s += r.buf_len;
      let d = t.slice(r.buf, r.buf + r.buf_len);
      return n + o.decode(d, { stream: c !== a.length - 1 });
    }, "");
    return console[this.#t](i), { ret: 0, nwritten: s };
  }
};
async function ye(l, t) {
  let e = [], s = [], o = t ? [new Zt("log"), new Zt("log"), new Zt("error")] : [new $(new lt([])), new $(new lt([])), new $(new lt([]))], i = new _t(e, s, o);
  return { async importObject() {
    return i.wasiImport;
  }, async close() {
  }, async initialize(n) {
    let r = n.exports.memory;
    if (!r) throw new Error("The module has to export a default memory.");
    if (n.exports._initialize) {
      let c = n.exports._initialize;
      i.initialize ? i.initialize({ exports: { memory: r, _initialize: () => {
        c();
      } } }) : c();
    } else i.start({ exports: { memory: r, _start: () => {
    } } });
  } };
}
var Pe = ls(we());
var Gt = (l) => {
  if (typeof l != "string") throw new TypeError("invalid pattern");
  if (l.length > 65536) throw new TypeError("pattern is too long");
};
var Ws = { "[:alnum:]": ["\\p{L}\\p{Nl}\\p{Nd}", true], "[:alpha:]": ["\\p{L}\\p{Nl}", true], "[:ascii:]": ["\\x00-\\x7f", false], "[:blank:]": ["\\p{Zs}\\t", true], "[:cntrl:]": ["\\p{Cc}", true], "[:digit:]": ["\\p{Nd}", true], "[:graph:]": ["\\p{Z}\\p{C}", true, true], "[:lower:]": ["\\p{Ll}", true], "[:print:]": ["\\p{C}", true], "[:punct:]": ["\\p{P}", true], "[:space:]": ["\\p{Z}\\t\\r\\n\\v\\f", true], "[:upper:]": ["\\p{Lu}", true], "[:word:]": ["\\p{L}\\p{Nl}\\p{Nd}\\p{Pc}", true], "[:xdigit:]": ["A-Fa-f0-9", false] }, Xt = (l) => l.replace(/[[\]\\-]/g, "\\$&"), xs = (l) => l.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), Ce = (l) => l.join(""), Te = (l, t) => {
  let e = t;
  if (l.charAt(e) !== "[") throw new Error("not in a brace expression");
  let s = [], o = [], i = e + 1, n = false, r = false, c = false, a = false, d = e, h = "";
  t: for (; i < l.length; ) {
    let m = l.charAt(i);
    if ((m === "!" || m === "^") && i === e + 1) {
      a = true, i++;
      continue;
    }
    if (m === "]" && n && !c) {
      d = i + 1;
      break;
    }
    if (n = true, m === "\\" && !c) {
      c = true, i++;
      continue;
    }
    if (m === "[" && !c) {
      for (let [Z, [G, V, x]] of Object.entries(Ws)) if (l.startsWith(Z, i)) {
        if (h) return ["$.", false, l.length - e, true];
        i += Z.length, x ? o.push(G) : s.push(G), r = r || V;
        continue t;
      }
    }
    if (c = false, h) {
      m > h ? s.push(Xt(h) + "-" + Xt(m)) : m === h && s.push(Xt(m)), h = "", i++;
      continue;
    }
    if (l.startsWith("-]", i + 1)) {
      s.push(Xt(m + "-")), i += 2;
      continue;
    }
    if (l.startsWith("-", i + 1)) {
      h = m, i += 2;
      continue;
    }
    s.push(Xt(m)), i++;
  }
  if (d < i) return ["", false, 0, false];
  if (!s.length && !o.length) return ["$.", false, l.length - e, true];
  if (o.length === 0 && s.length === 1 && /^\\?.$/.test(s[0]) && !a) {
    let m = s[0].length === 2 ? s[0].slice(-1) : s[0];
    return [xs(m), false, d - e, false];
  }
  let u = "[" + (a ? "^" : "") + Ce(s) + "]", b = "[" + (a ? "" : "^") + Ce(o) + "]";
  return [s.length && o.length ? "(" + u + "|" + b + ")" : s.length ? u : b, r, d - e, true];
};
var q = (l, { windowsPathsNoEscape: t = false } = {}) => t ? l.replace(/\[([^\/\\])\]/g, "$1") : l.replace(/((?!\\).|^)\[([^\/\\])\]/g, "$1$2").replace(/\\([^\/])/g, "$1");
var gs = /* @__PURE__ */ new Set(["!", "?", "+", "*", "@"]), He = (l) => gs.has(l), Vs = "(?!(?:^|/)\\.\\.?(?:$|/))", Ct = "(?!\\.)", Ls = /* @__PURE__ */ new Set(["[", "."]), Ss = /* @__PURE__ */ new Set(["..", "."]), Ks = new Set("().*{}+?[]^$\\!"), ws = (l) => l.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), At = "[^/]", Ne = At + "*?", Ye = At + "+?", S, K, _, R, g, tt, ot, et, U, rt, ft, Ht, ze, at, Tt, It, Qt, Nt, Je, H = class {
  constructor(t, e, s = {}) {
    L(this, Ht);
    L(this, It);
    le(this, "type");
    L(this, S, void 0);
    L(this, K, void 0);
    L(this, _, false);
    L(this, R, []);
    L(this, g, void 0);
    L(this, tt, void 0);
    L(this, ot, void 0);
    L(this, et, false);
    L(this, U, void 0);
    L(this, rt, void 0);
    L(this, ft, false);
    this.type = t, t && W(this, K, true), W(this, g, e), W(this, S, p(this, g) ? p(p(this, g), S) : this), W(this, U, p(this, S) === this ? s : p(p(this, S), U)), W(this, ot, p(this, S) === this ? [] : p(p(this, S), ot)), t === "!" && !p(p(this, S), et) && p(this, ot).push(this), W(this, tt, p(this, g) ? p(p(this, g), R).length : 0);
  }
  get hasMagic() {
    if (p(this, K) !== void 0) return p(this, K);
    for (let t of p(this, R)) if (typeof t != "string" && (t.type || t.hasMagic)) return W(this, K, true);
    return p(this, K);
  }
  toString() {
    return p(this, rt) !== void 0 ? p(this, rt) : this.type ? W(this, rt, this.type + "(" + p(this, R).map((t) => String(t)).join("|") + ")") : W(this, rt, p(this, R).map((t) => String(t)).join(""));
  }
  push(...t) {
    for (let e of t) if (e !== "") {
      if (typeof e != "string" && !(e instanceof H && p(e, g) === this)) throw new Error("invalid part: " + e);
      p(this, R).push(e);
    }
  }
  toJSON() {
    let t = this.type === null ? p(this, R).slice().map((e) => typeof e == "string" ? e : e.toJSON()) : [this.type, ...p(this, R).map((e) => e.toJSON())];
    return this.isStart() && !this.type && t.unshift([]), this.isEnd() && (this === p(this, S) || p(p(this, S), et) && p(this, g)?.type === "!") && t.push({}), t;
  }
  isStart() {
    if (p(this, S) === this) return true;
    if (!p(this, g)?.isStart()) return false;
    if (p(this, tt) === 0) return true;
    let t = p(this, g);
    for (let e = 0; e < p(this, tt); e++) {
      let s = p(t, R)[e];
      if (!(s instanceof H && s.type === "!")) return false;
    }
    return true;
  }
  isEnd() {
    if (p(this, S) === this || p(this, g)?.type === "!") return true;
    if (!p(this, g)?.isEnd()) return false;
    if (!this.type) return p(this, g)?.isEnd();
    let t = p(this, g) ? p(p(this, g), R).length : 0;
    return p(this, tt) === t - 1;
  }
  copyIn(t) {
    typeof t == "string" ? this.push(t) : this.push(t.clone(this));
  }
  clone(t) {
    let e = new H(this.type, t);
    for (let s of p(this, R)) e.copyIn(s);
    return e;
  }
  static fromGlob(t, e = {}) {
    var o;
    let s = new H(null, void 0, e);
    return v(o = H, at, Tt).call(o, t, s, 0, e), s;
  }
  toMMPattern() {
    if (this !== p(this, S)) return p(this, S).toMMPattern();
    let t = this.toString(), [e, s, o, i] = this.toRegExpSource();
    if (!(o || p(this, K) || p(this, U).nocase && !p(this, U).nocaseMagicOnly && t.toUpperCase() !== t.toLowerCase())) return s;
    let r = (p(this, U).nocase ? "i" : "") + (i ? "u" : "");
    return Object.assign(new RegExp(`^${e}$`, r), { _src: e, _glob: t });
  }
  toRegExpSource(t) {
    let e = t ?? !!p(this, U).dot;
    if (p(this, S) === this && v(this, Ht, ze).call(this), !this.type) {
      let c = this.isStart() && this.isEnd(), a = p(this, R).map((b) => {
        var V;
        let [y, m, Z, G] = typeof b == "string" ? v(V = H, Nt, Je).call(V, b, p(this, K), c) : b.toRegExpSource(t);
        return W(this, K, p(this, K) || Z), W(this, _, p(this, _) || G), y;
      }).join(""), d = "";
      if (this.isStart() && typeof p(this, R)[0] == "string" && !(p(this, R).length === 1 && Ss.has(p(this, R)[0]))) {
        let y = Ls, m = e && y.has(a.charAt(0)) || a.startsWith("\\.") && y.has(a.charAt(2)) || a.startsWith("\\.\\.") && y.has(a.charAt(4)), Z = !e && !t && y.has(a.charAt(0));
        d = m ? Vs : Z ? Ct : "";
      }
      let h = "";
      return this.isEnd() && p(p(this, S), et) && p(this, g)?.type === "!" && (h = "(?:$|\\/)"), [d + a + h, q(a), W(this, K, !!p(this, K)), p(this, _)];
    }
    let s = this.type === "*" || this.type === "+", o = this.type === "!" ? "(?:(?!(?:" : "(?:", i = v(this, It, Qt).call(this, e);
    if (this.isStart() && this.isEnd() && !i && this.type !== "!") {
      let c = this.toString();
      return W(this, R, [c]), this.type = null, W(this, K, void 0), [c, q(this.toString()), false, false];
    }
    let n = !s || t || e || !Ct ? "" : v(this, It, Qt).call(this, true);
    n === i && (n = ""), n && (i = `(?:${i})(?:${n})*?`);
    let r = "";
    if (this.type === "!" && p(this, ft)) r = (this.isStart() && !e ? Ct : "") + Ye;
    else {
      let c = this.type === "!" ? "))" + (this.isStart() && !e && !t ? Ct : "") + Ne + ")" : this.type === "@" ? ")" : this.type === "?" ? ")?" : this.type === "+" && n ? ")" : this.type === "*" && n ? ")?" : `)${this.type}`;
      r = o + i + c;
    }
    return [r, q(i), W(this, K, !!p(this, K)), p(this, _)];
  }
}, st = H;
S = /* @__PURE__ */ new WeakMap(), K = /* @__PURE__ */ new WeakMap(), _ = /* @__PURE__ */ new WeakMap(), R = /* @__PURE__ */ new WeakMap(), g = /* @__PURE__ */ new WeakMap(), tt = /* @__PURE__ */ new WeakMap(), ot = /* @__PURE__ */ new WeakMap(), et = /* @__PURE__ */ new WeakMap(), U = /* @__PURE__ */ new WeakMap(), rt = /* @__PURE__ */ new WeakMap(), ft = /* @__PURE__ */ new WeakMap(), Ht = /* @__PURE__ */ new WeakSet(), ze = function() {
  if (this !== p(this, S)) throw new Error("should only call on root");
  if (p(this, et)) return this;
  this.toString(), W(this, et, true);
  let t;
  for (; t = p(this, ot).pop(); ) {
    if (t.type !== "!") continue;
    let e = t, s = p(e, g);
    for (; s; ) {
      for (let o = p(e, tt) + 1; !s.type && o < p(s, R).length; o++) for (let i of p(t, R)) {
        if (typeof i == "string") throw new Error("string part in extglob AST??");
        i.copyIn(p(s, R)[o]);
      }
      e = s, s = p(e, g);
    }
  }
  return this;
}, at = /* @__PURE__ */ new WeakSet(), Tt = function(t, e, s, o) {
  var b, y;
  let i = false, n = false, r = -1, c = false;
  if (e.type === null) {
    let m = s, Z = "";
    for (; m < t.length; ) {
      let G = t.charAt(m++);
      if (i || G === "\\") {
        i = !i, Z += G;
        continue;
      }
      if (n) {
        m === r + 1 ? (G === "^" || G === "!") && (c = true) : G === "]" && !(m === r + 2 && c) && (n = false), Z += G;
        continue;
      } else if (G === "[") {
        n = true, r = m, c = false, Z += G;
        continue;
      }
      if (!o.noext && He(G) && t.charAt(m) === "(") {
        e.push(Z), Z = "";
        let V = new H(G, e);
        m = v(b = H, at, Tt).call(b, t, V, m, o), e.push(V);
        continue;
      }
      Z += G;
    }
    return e.push(Z), m;
  }
  let a = s + 1, d = new H(null, e), h = [], u = "";
  for (; a < t.length; ) {
    let m = t.charAt(a++);
    if (i || m === "\\") {
      i = !i, u += m;
      continue;
    }
    if (n) {
      a === r + 1 ? (m === "^" || m === "!") && (c = true) : m === "]" && !(a === r + 2 && c) && (n = false), u += m;
      continue;
    } else if (m === "[") {
      n = true, r = a, c = false, u += m;
      continue;
    }
    if (He(m) && t.charAt(a) === "(") {
      d.push(u), u = "";
      let Z = new H(m, d);
      d.push(Z), a = v(y = H, at, Tt).call(y, t, Z, a, o);
      continue;
    }
    if (m === "|") {
      d.push(u), u = "", h.push(d), d = new H(null, e);
      continue;
    }
    if (m === ")") return u === "" && p(e, R).length === 0 && W(e, ft, true), d.push(u), u = "", e.push(...h, d), a;
    u += m;
  }
  return e.type = null, W(e, K, void 0), W(e, R, [t.substring(s - 1)]), a;
}, It = /* @__PURE__ */ new WeakSet(), Qt = function(t) {
  return p(this, R).map((e) => {
    if (typeof e == "string") throw new Error("string type in extglob ast??");
    let [s, o, i, n] = e.toRegExpSource(t);
    return W(this, _, p(this, _) || n), s;
  }).filter((e) => !(this.isStart() && this.isEnd()) || !!e).join("|");
}, Nt = /* @__PURE__ */ new WeakSet(), Je = function(t, e, s = false) {
  let o = false, i = "", n = false;
  for (let r = 0; r < t.length; r++) {
    let c = t.charAt(r);
    if (o) {
      o = false, i += (Ks.has(c) ? "\\" : "") + c;
      continue;
    }
    if (c === "\\") {
      r === t.length - 1 ? i += "\\\\" : o = true;
      continue;
    }
    if (c === "[") {
      let [a, d, h, u] = Te(t, r);
      if (h) {
        i += a, n = n || d, r += h - 1, e = e || u;
        continue;
      }
    }
    if (c === "*") {
      s && t === "*" ? i += Ye : i += Ne, e = true;
      continue;
    }
    if (c === "?") {
      i += At, e = true;
      continue;
    }
    i += ws(c);
  }
  return [i, q(t), !!e, n];
}, L(st, at), L(st, Nt);
var Dt = (l, { windowsPathsNoEscape: t = false } = {}) => t ? l.replace(/[?*()[\]]/g, "[$&]") : l.replace(/[?*()[\]\\]/g, "\\$&");
var C = (l, t, e = {}) => (Gt(t), !e.nocomment && t.charAt(0) === "#" ? false : new dt(t, e).match(l)), Cs = /^\*+([^+@!?\*\[\(]*)$/, Ts = (l) => (t) => !t.startsWith(".") && t.endsWith(l), Hs = (l) => (t) => t.endsWith(l), Ns = (l) => (l = l.toLowerCase(), (t) => !t.startsWith(".") && t.toLowerCase().endsWith(l)), Ys = (l) => (l = l.toLowerCase(), (t) => t.toLowerCase().endsWith(l)), zs = /^\*+\.\*+$/, Js = (l) => !l.startsWith(".") && l.includes("."), Fs = (l) => l !== "." && l !== ".." && l.includes("."), ks = /^\.\*+$/, Ps = (l) => l !== "." && l !== ".." && l.startsWith("."), Es = /^\*+$/, Ms = (l) => l.length !== 0 && !l.startsWith("."), Bs = (l) => l.length !== 0 && l !== "." && l !== "..", Os = /^\?+([^+@!?\*\[\(]*)?$/, _s = ([l, t = ""]) => {
  let e = Ee([l]);
  return t ? (t = t.toLowerCase(), (s) => e(s) && s.toLowerCase().endsWith(t)) : e;
}, Us = ([l, t = ""]) => {
  let e = Me([l]);
  return t ? (t = t.toLowerCase(), (s) => e(s) && s.toLowerCase().endsWith(t)) : e;
}, vs = ([l, t = ""]) => {
  let e = Me([l]);
  return t ? (s) => e(s) && s.endsWith(t) : e;
}, Qs = ([l, t = ""]) => {
  let e = Ee([l]);
  return t ? (s) => e(s) && s.endsWith(t) : e;
}, Ee = ([l]) => {
  let t = l.length;
  return (e) => e.length === t && !e.startsWith(".");
}, Me = ([l]) => {
  let t = l.length;
  return (e) => e.length === t && e !== "." && e !== "..";
}, Be = typeof process == "object" && process ? typeof process.env == "object" && process.env && process.env.__MINIMATCH_TESTING_PLATFORM__ || process.platform : "posix", Fe = { win32: { sep: "\\" }, posix: { sep: "/" } }, As = Be === "win32" ? Fe.win32.sep : Fe.posix.sep;
C.sep = As;
var z = Symbol("globstar **");
C.GLOBSTAR = z;
var Ds = "[^/]", js = Ds + "*?", $s = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?", qs = "(?:(?!(?:\\/|^)\\.).)*?", ti = (l, t = {}) => (e) => C(e, l, t);
C.filter = ti;
var Y = (l, t = {}) => Object.assign({}, l, t), ei = (l) => {
  if (!l || typeof l != "object" || !Object.keys(l).length) return C;
  let t = C;
  return Object.assign((s, o, i = {}) => t(s, o, Y(l, i)), { Minimatch: class extends t.Minimatch {
    constructor(o, i = {}) {
      super(o, Y(l, i));
    }
    static defaults(o) {
      return t.defaults(Y(l, o)).Minimatch;
    }
  }, AST: class extends t.AST {
    constructor(o, i, n = {}) {
      super(o, i, Y(l, n));
    }
    static fromGlob(o, i = {}) {
      return t.AST.fromGlob(o, Y(l, i));
    }
  }, unescape: (s, o = {}) => t.unescape(s, Y(l, o)), escape: (s, o = {}) => t.escape(s, Y(l, o)), filter: (s, o = {}) => t.filter(s, Y(l, o)), defaults: (s) => t.defaults(Y(l, s)), makeRe: (s, o = {}) => t.makeRe(s, Y(l, o)), braceExpand: (s, o = {}) => t.braceExpand(s, Y(l, o)), match: (s, o, i = {}) => t.match(s, o, Y(l, i)), sep: t.sep, GLOBSTAR: z });
};
C.defaults = ei;
var Oe = (l, t = {}) => (Gt(l), t.nobrace || !/\{(?:(?!\{).)*\}/.test(l) ? [l] : (0, Pe.default)(l));
C.braceExpand = Oe;
var si = (l, t = {}) => new dt(l, t).makeRe();
C.makeRe = si;
var ii = (l, t, e = {}) => {
  let s = new dt(t, e);
  return l = l.filter((o) => s.match(o)), s.options.nonull && !l.length && l.push(t), l;
};
C.match = ii;
var ke = /[?*]|[+@!]\(.*?\)|\[|\]/, ni = (l) => l.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), dt = class {
  options;
  set;
  pattern;
  windowsPathsNoEscape;
  nonegate;
  negate;
  comment;
  empty;
  preserveMultipleSlashes;
  partial;
  globSet;
  globParts;
  nocase;
  isWindows;
  platform;
  windowsNoMagicRoot;
  regexp;
  constructor(t, e = {}) {
    Gt(t), e = e || {}, this.options = e, this.pattern = t, this.platform = e.platform || Be, this.isWindows = this.platform === "win32", this.windowsPathsNoEscape = !!e.windowsPathsNoEscape || e.allowWindowsEscape === false, this.windowsPathsNoEscape && (this.pattern = this.pattern.replace(/\\/g, "/")), this.preserveMultipleSlashes = !!e.preserveMultipleSlashes, this.regexp = null, this.negate = false, this.nonegate = !!e.nonegate, this.comment = false, this.empty = false, this.partial = !!e.partial, this.nocase = !!this.options.nocase, this.windowsNoMagicRoot = e.windowsNoMagicRoot !== void 0 ? e.windowsNoMagicRoot : !!(this.isWindows && this.nocase), this.globSet = [], this.globParts = [], this.set = [], this.make();
  }
  hasMagic() {
    if (this.options.magicalBraces && this.set.length > 1) return true;
    for (let t of this.set) for (let e of t) if (typeof e != "string") return true;
    return false;
  }
  debug(...t) {
  }
  make() {
    let t = this.pattern, e = this.options;
    if (!e.nocomment && t.charAt(0) === "#") {
      this.comment = true;
      return;
    }
    if (!t) {
      this.empty = true;
      return;
    }
    this.parseNegate(), this.globSet = [...new Set(this.braceExpand())], e.debug && (this.debug = (...i) => console.error(...i)), this.debug(this.pattern, this.globSet);
    let s = this.globSet.map((i) => this.slashSplit(i));
    this.globParts = this.preprocess(s), this.debug(this.pattern, this.globParts);
    let o = this.globParts.map((i, n, r) => {
      if (this.isWindows && this.windowsNoMagicRoot) {
        let c = i[0] === "" && i[1] === "" && (i[2] === "?" || !ke.test(i[2])) && !ke.test(i[3]), a = /^[a-z]:/i.test(i[0]);
        if (c) return [...i.slice(0, 4), ...i.slice(4).map((d) => this.parse(d))];
        if (a) return [i[0], ...i.slice(1).map((d) => this.parse(d))];
      }
      return i.map((c) => this.parse(c));
    });
    if (this.debug(this.pattern, o), this.set = o.filter((i) => i.indexOf(false) === -1), this.isWindows) for (let i = 0; i < this.set.length; i++) {
      let n = this.set[i];
      n[0] === "" && n[1] === "" && this.globParts[i][2] === "?" && typeof n[3] == "string" && /^[a-z]:$/i.test(n[3]) && (n[2] = "?");
    }
    this.debug(this.pattern, this.set);
  }
  preprocess(t) {
    if (this.options.noglobstar) for (let s = 0; s < t.length; s++) for (let o = 0; o < t[s].length; o++) t[s][o] === "**" && (t[s][o] = "*");
    let { optimizationLevel: e = 1 } = this.options;
    return e >= 2 ? (t = this.firstPhasePreProcess(t), t = this.secondPhasePreProcess(t)) : e >= 1 ? t = this.levelOneOptimize(t) : t = this.adjascentGlobstarOptimize(t), t;
  }
  adjascentGlobstarOptimize(t) {
    return t.map((e) => {
      let s = -1;
      for (; (s = e.indexOf("**", s + 1)) !== -1; ) {
        let o = s;
        for (; e[o + 1] === "**"; ) o++;
        o !== s && e.splice(s, o - s);
      }
      return e;
    });
  }
  levelOneOptimize(t) {
    return t.map((e) => (e = e.reduce((s, o) => {
      let i = s[s.length - 1];
      return o === "**" && i === "**" ? s : o === ".." && i && i !== ".." && i !== "." && i !== "**" ? (s.pop(), s) : (s.push(o), s);
    }, []), e.length === 0 ? [""] : e));
  }
  levelTwoFileOptimize(t) {
    Array.isArray(t) || (t = this.slashSplit(t));
    let e = false;
    do {
      if (e = false, !this.preserveMultipleSlashes) {
        for (let o = 1; o < t.length - 1; o++) {
          let i = t[o];
          o === 1 && i === "" && t[0] === "" || (i === "." || i === "") && (e = true, t.splice(o, 1), o--);
        }
        t[0] === "." && t.length === 2 && (t[1] === "." || t[1] === "") && (e = true, t.pop());
      }
      let s = 0;
      for (; (s = t.indexOf("..", s + 1)) !== -1; ) {
        let o = t[s - 1];
        o && o !== "." && o !== ".." && o !== "**" && (e = true, t.splice(s - 1, 2), s -= 2);
      }
    } while (e);
    return t.length === 0 ? [""] : t;
  }
  firstPhasePreProcess(t) {
    let e = false;
    do {
      e = false;
      for (let s of t) {
        let o = -1;
        for (; (o = s.indexOf("**", o + 1)) !== -1; ) {
          let n = o;
          for (; s[n + 1] === "**"; ) n++;
          n > o && s.splice(o + 1, n - o);
          let r = s[o + 1], c = s[o + 2], a = s[o + 3];
          if (r !== ".." || !c || c === "." || c === ".." || !a || a === "." || a === "..") continue;
          e = true, s.splice(o, 1);
          let d = s.slice(0);
          d[o] = "**", t.push(d), o--;
        }
        if (!this.preserveMultipleSlashes) {
          for (let n = 1; n < s.length - 1; n++) {
            let r = s[n];
            n === 1 && r === "" && s[0] === "" || (r === "." || r === "") && (e = true, s.splice(n, 1), n--);
          }
          s[0] === "." && s.length === 2 && (s[1] === "." || s[1] === "") && (e = true, s.pop());
        }
        let i = 0;
        for (; (i = s.indexOf("..", i + 1)) !== -1; ) {
          let n = s[i - 1];
          if (n && n !== "." && n !== ".." && n !== "**") {
            e = true;
            let c = i === 1 && s[i + 1] === "**" ? ["."] : [];
            s.splice(i - 1, 2, ...c), s.length === 0 && s.push(""), i -= 2;
          }
        }
      }
    } while (e);
    return t;
  }
  secondPhasePreProcess(t) {
    for (let e = 0; e < t.length - 1; e++) for (let s = e + 1; s < t.length; s++) {
      let o = this.partsMatch(t[e], t[s], !this.preserveMultipleSlashes);
      !o || (t[e] = o, t[s] = []);
    }
    return t.filter((e) => e.length);
  }
  partsMatch(t, e, s = false) {
    let o = 0, i = 0, n = [], r = "";
    for (; o < t.length && i < e.length; ) if (t[o] === e[i]) n.push(r === "b" ? e[i] : t[o]), o++, i++;
    else if (s && t[o] === "**" && e[i] === t[o + 1]) n.push(t[o]), o++;
    else if (s && e[i] === "**" && t[o] === e[i + 1]) n.push(e[i]), i++;
    else if (t[o] === "*" && e[i] && (this.options.dot || !e[i].startsWith(".")) && e[i] !== "**") {
      if (r === "b") return false;
      r = "a", n.push(t[o]), o++, i++;
    } else if (e[i] === "*" && t[o] && (this.options.dot || !t[o].startsWith(".")) && t[o] !== "**") {
      if (r === "a") return false;
      r = "b", n.push(e[i]), o++, i++;
    } else return false;
    return t.length === e.length && n;
  }
  parseNegate() {
    if (this.nonegate) return;
    let t = this.pattern, e = false, s = 0;
    for (let o = 0; o < t.length && t.charAt(o) === "!"; o++) e = !e, s++;
    s && (this.pattern = t.slice(s)), this.negate = e;
  }
  matchOne(t, e, s = false) {
    let o = this.options;
    if (this.isWindows) {
      let m = typeof t[0] == "string" && /^[a-z]:$/i.test(t[0]), Z = !m && t[0] === "" && t[1] === "" && t[2] === "?" && /^[a-z]:$/i.test(t[3]), G = typeof e[0] == "string" && /^[a-z]:$/i.test(e[0]), V = !G && e[0] === "" && e[1] === "" && e[2] === "?" && typeof e[3] == "string" && /^[a-z]:$/i.test(e[3]), x = Z ? 3 : m ? 0 : void 0, T = V ? 3 : G ? 0 : void 0;
      if (typeof x == "number" && typeof T == "number") {
        let [F, w] = [t[x], e[T]];
        F.toLowerCase() === w.toLowerCase() && (e[T] = F, T > x ? e = e.slice(T) : x > T && (t = t.slice(x)));
      }
    }
    let { optimizationLevel: i = 1 } = this.options;
    i >= 2 && (t = this.levelTwoFileOptimize(t)), this.debug("matchOne", this, { file: t, pattern: e }), this.debug("matchOne", t.length, e.length);
    for (var n = 0, r = 0, c = t.length, a = e.length; n < c && r < a; n++, r++) {
      this.debug("matchOne loop");
      var d = e[r], h = t[n];
      if (this.debug(e, d, h), d === false) return false;
      if (d === z) {
        this.debug("GLOBSTAR", [e, d, h]);
        var u = n, b = r + 1;
        if (b === a) {
          for (this.debug("** at the end"); n < c; n++) if (t[n] === "." || t[n] === ".." || !o.dot && t[n].charAt(0) === ".") return false;
          return true;
        }
        for (; u < c; ) {
          var y = t[u];
          if (this.debug(`
globstar while`, t, u, e, b, y), this.matchOne(t.slice(u), e.slice(b), s)) return this.debug("globstar found match!", u, c, y), true;
          if (y === "." || y === ".." || !o.dot && y.charAt(0) === ".") {
            this.debug("dot detected!", t, u, e, b);
            break;
          }
          this.debug("globstar swallow a segment, and continue"), u++;
        }
        return !!(s && (this.debug(`
>>> no match, partial?`, t, u, e, b), u === c));
      }
      let m;
      if (typeof d == "string" ? (m = h === d, this.debug("string match", d, h, m)) : (m = d.test(h), this.debug("pattern match", d, h, m)), !m) return false;
    }
    if (n === c && r === a) return true;
    if (n === c) return s;
    if (r === a) return n === c - 1 && t[n] === "";
    throw new Error("wtf?");
  }
  braceExpand() {
    return Oe(this.pattern, this.options);
  }
  parse(t) {
    Gt(t);
    let e = this.options;
    if (t === "**") return z;
    if (t === "") return "";
    let s, o = null;
    (s = t.match(Es)) ? o = e.dot ? Bs : Ms : (s = t.match(Cs)) ? o = (e.nocase ? e.dot ? Ys : Ns : e.dot ? Hs : Ts)(s[1]) : (s = t.match(Os)) ? o = (e.nocase ? e.dot ? Us : _s : e.dot ? vs : Qs)(s) : (s = t.match(zs)) ? o = e.dot ? Fs : Js : (s = t.match(ks)) && (o = Ps);
    let i = st.fromGlob(t, this.options).toMMPattern();
    return o ? Object.assign(i, { test: o }) : i;
  }
  makeRe() {
    if (this.regexp || this.regexp === false) return this.regexp;
    let t = this.set;
    if (!t.length) return this.regexp = false, this.regexp;
    let e = this.options, s = e.noglobstar ? js : e.dot ? $s : qs, o = new Set(e.nocase ? ["i"] : []), i = t.map((c) => {
      let a = c.map((d) => {
        if (d instanceof RegExp) for (let h of d.flags.split("")) o.add(h);
        return typeof d == "string" ? ni(d) : d === z ? z : d._src;
      });
      return a.forEach((d, h) => {
        let u = a[h + 1], b = a[h - 1];
        d !== z || b === z || (b === void 0 ? u !== void 0 && u !== z ? a[h + 1] = "(?:\\/|" + s + "\\/)?" + u : a[h] = s : u === void 0 ? a[h - 1] = b + "(?:\\/|" + s + ")?" : u !== z && (a[h - 1] = b + "(?:\\/|\\/" + s + "\\/)" + u, a[h + 1] = z));
      }), a.filter((d) => d !== z).join("/");
    }).join("|"), [n, r] = t.length > 1 ? ["(?:", ")"] : ["", ""];
    i = "^" + n + i + r + "$", this.negate && (i = "^(?!" + i + ").+$");
    try {
      this.regexp = new RegExp(i, [...o].join(""));
    } catch {
      this.regexp = false;
    }
    return this.regexp;
  }
  slashSplit(t) {
    return this.preserveMultipleSlashes ? t.split("/") : this.isWindows && /^\/\/[^\/]+/.test(t) ? ["", ...t.split(/\/+/)] : t.split(/\/+/);
  }
  match(t, e = this.partial) {
    if (this.debug("match", t, this.pattern), this.comment) return false;
    if (this.empty) return t === "";
    if (t === "/" && e) return true;
    let s = this.options;
    this.isWindows && (t = t.split("\\").join("/"));
    let o = this.slashSplit(t);
    this.debug(this.pattern, "split", o);
    let i = this.set;
    this.debug(this.pattern, "set", i);
    let n = o[o.length - 1];
    if (!n) for (let r = o.length - 2; !n && r >= 0; r--) n = o[r];
    for (let r = 0; r < i.length; r++) {
      let c = i[r], a = o;
      if (s.matchBase && c.length === 1 && (a = [n]), this.matchOne(a, c, e)) return s.flipNegate ? true : !this.negate;
    }
    return s.flipNegate ? false : this.negate;
  }
  static defaults(t) {
    return C.defaults(t).Minimatch;
  }
};
C.AST = st;
C.Minimatch = dt;
C.escape = Dt;
C.unescape = q;
function _e(l, t) {
  return C(l, t);
}
var ut = class {
  constructor(t, e, s, o) {
    this.fetch = t, this.allowedHosts = e, this.lastStatusCode = 0, this.memoryOptions = s, this.lastHeaders = o ? {} : null;
  }
  contribute(t) {
    t[J] ??= {}, t[J].http_request = (e, s, o) => this.makeRequest(e, s, o), t[J].http_status_code = () => this.lastStatusCode, t[J].http_headers = (e) => this.lastHeaders === null ? 0n : e.store(JSON.stringify(this.lastHeaders));
  }
  async makeRequest(t, e, s) {
    this.lastHeaders !== null && (this.lastHeaders = {}), this.lastStatusCode = 0;
    let o = t.read(e);
    if (o === null) return 0n;
    let { headers: i, header: n, url: r, method: c } = o.json(), a = c?.toUpperCase() ?? "GET", d = new URL(r);
    if (!this.allowedHosts.some((m) => m === d.hostname || _e(d.hostname, m))) throw new Error(`Call error: HTTP request to "${d}" is not allowed (no allowedHosts match "${d.hostname}")`);
    let u = s === 0n || a === "GET" || a === "HEAD" ? null : t.read(s)?.bytes(), b = this.fetch, y = await b(r, { headers: i || n, method: a, ...u ? { body: u.slice() } : {} });
    this.lastStatusCode = y.status, this.lastHeaders !== null && (this.lastHeaders = Object.fromEntries(y.headers));
    try {
      let m = this.memoryOptions.maxHttpResponseBytes ? await li(y, this.memoryOptions.maxHttpResponseBytes) : new Uint8Array(await y.arrayBuffer());
      return t.store(m);
    } catch (m) {
      if (m instanceof Error) {
        let Z = t.store(new TextEncoder().encode(m.message));
        return t[k].log_error(Z), 0n;
      }
      return 0n;
    }
  }
};
async function li(l, t) {
  let e = l.body?.getReader();
  if (!e) return new Uint8Array(0);
  let s = 0, o = [];
  for (; s < t; ) {
    let { done: r, value: c } = await e.read();
    if (r) break;
    if (o.push(c), s += c.length, s >= t) throw new Error(`Response body exceeded ${t} bytes`);
  }
  let i = new Uint8Array(s), n = 0;
  for (let r of o) i.set(r, n), n += r.length;
  return i;
}
var J = "extism:host/env", oi = (async () => {
}).constructor, jt = WebAssembly.Suspending, te = WebAssembly.promising, $t = class {
  #t;
  #e;
  #s = false;
  #i;
  #o;
  #l;
  constructor(t, e, s, o, i) {
    this.#t = e, this.#e = s, this.#i = o, this.#o = t, this.#l = i;
  }
  async reset() {
    return this.isActive() ? false : (this.#t[it](), true);
  }
  isActive() {
    return this.#s;
  }
  async functionExists(t) {
    return typeof this.#e[1].exports[t] == "function";
  }
  async callBlock(t, e) {
    this.#s = true;
    let s = this.#e[1].exports[t];
    if (!s) throw Error(`Plugin error: function "${t}" does not exist`);
    if (typeof s != "function") throw Error(`Plugin error: export "${t}" is not a function`);
    this.#t[Et](e ?? null);
    try {
      return this.#l ? await te(s)() : s(), this.#t[xt]();
    } catch (o) {
      throw this.#t[xt](), o;
    } finally {
      this.#s = false;
    }
  }
  async call(t, e, s) {
    this.#t[it]();
    let o = this.#t[A](e);
    this.#t[bt](s);
    let [i, n] = await this.callBlock(t, o), r = i !== null, c = i ?? n;
    if (c === null) return null;
    let a = this.#t[pt](c);
    if (!a) return null;
    let d = new B(a.buffer);
    if (r) throw new Error(`Plugin-originated error: ${d.string()}`);
    return d;
  }
  async getExports() {
    return WebAssembly.Module.exports(this.#e[0]) || [];
  }
  async getImports() {
    return WebAssembly.Module.imports(this.#e[0]) || [];
  }
  async getInstance() {
    return this.#e[1];
  }
  async close() {
    await Promise.all(this.#i.map((t) => t.close())), this.#i.length = 0;
  }
};
async function Ue(l, t, e, s = new ct(ArrayBuffer, l.logger, l.logLevel, l.config, l.memory)) {
  let o = { [J]: s[k], env: {} }, i = false;
  for (let h in l.functions) {
    o[h] = o[h] || {};
    for (let [u, b] of Object.entries(l.functions[h])) {
      let y = b.constructor === oi;
      i ||= y;
      let m = b.bind(null, s);
      o[h][u] = y ? new jt(m) : m;
    }
  }
  if (i && (!jt || !te)) throw new TypeError("This platform does not support async function imports on the main thread; consider using `runInWorker`.");
  let n = t.indexOf("main");
  if (n === -1) throw new Error('Unreachable: manifests must have at least one "main" module. Enforced by "src/manifest.ts")');
  let r = /* @__PURE__ */ new Map(), c = [], a = { suspendsOnInvoke: i }, d = await qt(s, ["main"], e[n], o, l, c, t, e, r, a);
  return new $t(l, s, [e[n], d], c, a.suspendsOnInvoke);
}
async function qt(l, t, e, s, o, i, n, r, c, a) {
  c.set(e, null);
  let d = {}, h = WebAssembly.Module.imports(e), u = null;
  for (let { kind: m, module: Z, name: G } of h) {
    let V = n.indexOf(Z);
    if (V === -1) {
      if (Z === "wasi_snapshot_preview1" && u === null) {
        if (!o.wasiEnabled) throw new Error('WASI is not enabled; see the "useWasi" plugin option');
        u === null && (u = await ye(o.allowedPaths, o.enableWasiOutput), i.push(u), s.wasi_snapshot_preview1 = await u.importObject());
      }
      if (!Object.hasOwnProperty.call(s, Z)) throw new Error(`from module "${t.join('"/"')}": cannot resolve import "${Z}" "${G}": not provided by host imports nor linked manifest items`);
      if (!Object.hasOwnProperty.call(s[Z], G)) throw new Error(`from module "${t.join('"/"')}": cannot resolve import "${Z}" "${G}" ("${Z}" is a host module, but does not contain "${G}")`);
      if (Z === J && G === "http_request" && te && s[Z][G] === l[k].http_request && !o.executingInWorker) {
        let x = new ut(o.fetch, o.allowedHosts, o.memory, o.allowHttpResponseHeaders);
        a.suspendsOnInvoke = true;
        let T = {};
        x.contribute(T);
        for (let [F, w] of Object.entries(T[J])) s[Z][F] = w.bind(null, l);
        s[Z][G] = new jt(s[Z][G]);
      }
      switch (m) {
        case "function": {
          d[Z] ??= {}, d[Z][G] = s[Z][G];
          break;
        }
        default:
          throw new Error(`from module "${t.join('"/"')}": in import "${Z}" "${G}", "${m}"-typed host imports are not supported yet`);
      }
    } else {
      let x = r[V], T = WebAssembly.Module.exports(x);
      if (!T.find((N) => N.name === G && N.kind === m)) throw new Error(`from module "${t.join('"/"')}": cannot import "${Z}" "${G}"; no export matched request`);
      let w = T.find((N) => N.name === "_start") ? await qt(l, [...t, Z], x, s, o, i, n, r, /* @__PURE__ */ new Map(), a) : (c.has(x) || await qt(l, [...t, Z], x, s, o, i, n, r, c, a), c.get(x));
      if (w) d[Z] ??= {}, d[Z][G] = w.exports[G];
      else if (m === "function") {
        d[Z] = {};
        let N = null;
        d[Z][G] = (...ht) => {
          if (N) return N(...ht);
          let E = c.get(r[V]);
          if (!E) throw new Error(`from module instance "${t.join('"/"')}": target module "${Z}" was never instantiated`);
          return N = E.exports[G], N(...ht);
        };
      } else throw new Error(`from module "${t.join('"/"')}": cannot import "${Z}" "${G}"; circular imports of type="${m}" are not supported`);
    }
  }
  let b = await WebAssembly.instantiate(e, d), y = b.exports.hs_init ? "haskell" : b.exports._initialize ? "reactor" : b.exports._start ? "command" : "none";
  if (u) await u?.initialize(b), b.exports.hs_init && b.exports.hs_init();
  else switch (y) {
    case "command":
      b.exports._initialize && b.exports._initialize(), b.exports._start();
      break;
    case "reactor":
      b.exports._initialize();
      break;
    case "haskell":
      b.exports.hs_init();
      break;
  }
  return c.set(e, b), b;
}
var ve = new URL("data:text/javascript;base64,dmFyIEhlPU9iamVjdC5jcmVhdGU7dmFyIFB0PU9iamVjdC5kZWZpbmVQcm9wZXJ0eTt2YXIgJGU9T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjt2YXIgVmU9T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXM7dmFyIGplPU9iamVjdC5nZXRQcm90b3R5cGVPZix6ZT1PYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O3ZhciBZZT0obyx0LGUpPT50IGluIG8/UHQobyx0LHtlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMCx2YWx1ZTplfSk6b1t0XT1lO3ZhciB0ZT0obyx0KT0+KCk9Pih0fHxvKCh0PXtleHBvcnRzOnt9fSkuZXhwb3J0cyx0KSx0LmV4cG9ydHMpO3ZhciBLZT0obyx0LGUscyk9PntpZih0JiZ0eXBlb2YgdD09Im9iamVjdCJ8fHR5cGVvZiB0PT0iZnVuY3Rpb24iKWZvcihsZXQgaSBvZiBWZSh0KSkhemUuY2FsbChvLGkpJiZpIT09ZSYmUHQobyxpLHtnZXQ6KCk9PnRbaV0sZW51bWVyYWJsZTohKHM9JGUodCxpKSl8fHMuZW51bWVyYWJsZX0pO3JldHVybiBvfTt2YXIgWGU9KG8sdCxlKT0+KGU9byE9bnVsbD9IZShqZShvKSk6e30sS2UodHx8IW98fCFvLl9fZXNNb2R1bGU/UHQoZSwiZGVmYXVsdCIse3ZhbHVlOm8sZW51bWVyYWJsZTohMH0pOmUsbykpO3ZhciBlZT0obyx0LGUpPT4oWWUobyx0eXBlb2YgdCE9InN5bWJvbCI/dCsiIjp0LGUpLGUpLFV0PShvLHQsZSk9PntpZighdC5oYXMobykpdGhyb3cgVHlwZUVycm9yKCJDYW5ub3QgIitlKX07dmFyIHA9KG8sdCxlKT0+KFV0KG8sdCwicmVhZCBmcm9tIHByaXZhdGUgZmllbGQiKSxlP2UuY2FsbChvKTp0LmdldChvKSksTz0obyx0LGUpPT57aWYodC5oYXMobykpdGhyb3cgVHlwZUVycm9yKCJDYW5ub3QgYWRkIHRoZSBzYW1lIHByaXZhdGUgbWVtYmVyIG1vcmUgdGhhbiBvbmNlIik7dCBpbnN0YW5jZW9mIFdlYWtTZXQ/dC5hZGQobyk6dC5zZXQobyxlKX0sUj0obyx0LGUscyk9PihVdChvLHQsIndyaXRlIHRvIHByaXZhdGUgZmllbGQiKSxzP3MuY2FsbChvLGUpOnQuc2V0KG8sZSksZSk7dmFyICQ9KG8sdCxlKT0+KFV0KG8sdCwiYWNjZXNzIHByaXZhdGUgbWV0aG9kIiksZSk7dmFyIF9lPXRlKChucixnZSk9PnsidXNlIHN0cmljdCI7Z2UuZXhwb3J0cz1kZTtmdW5jdGlvbiBkZShvLHQsZSl7byBpbnN0YW5jZW9mIFJlZ0V4cCYmKG89aGUobyxlKSksdCBpbnN0YW5jZW9mIFJlZ0V4cCYmKHQ9aGUodCxlKSk7dmFyIHM9cGUobyx0LGUpO3JldHVybiBzJiZ7c3RhcnQ6c1swXSxlbmQ6c1sxXSxwcmU6ZS5zbGljZSgwLHNbMF0pLGJvZHk6ZS5zbGljZShzWzBdK28ubGVuZ3RoLHNbMV0pLHBvc3Q6ZS5zbGljZShzWzFdK3QubGVuZ3RoKX19ZnVuY3Rpb24gaGUobyx0KXt2YXIgZT10Lm1hdGNoKG8pO3JldHVybiBlP2VbMF06bnVsbH1kZS5yYW5nZT1wZTtmdW5jdGlvbiBwZShvLHQsZSl7dmFyIHMsaSxuLHIsYSxsPWUuaW5kZXhPZihvKSxjPWUuaW5kZXhPZih0LGwrMSksZj1sO2lmKGw+PTAmJmM+MCl7aWYobz09PXQpcmV0dXJuW2wsY107Zm9yKHM9W10sbj1lLmxlbmd0aDtmPj0wJiYhYTspZj09bD8ocy5wdXNoKGYpLGw9ZS5pbmRleE9mKG8sZisxKSk6cy5sZW5ndGg9PTE/YT1bcy5wb3AoKSxjXTooaT1zLnBvcCgpLGk8biYmKG49aSxyPWMpLGM9ZS5pbmRleE9mKHQsZisxKSksZj1sPGMmJmw+PTA/bDpjO3MubGVuZ3RoJiYoYT1bbixyXSl9cmV0dXJuIGF9fSk7dmFyIE9lPXRlKChycix4ZSk9Pnt2YXIgYmU9X2UoKTt4ZS5leHBvcnRzPWFzO3ZhciBtZT0iXDBTTEFTSCIrTWF0aC5yYW5kb20oKSsiXDAiLHdlPSJcME9QRU4iK01hdGgucmFuZG9tKCkrIlwwIixqdD0iXDBDTE9TRSIrTWF0aC5yYW5kb20oKSsiXDAiLEVlPSJcMENPTU1BIitNYXRoLnJhbmRvbSgpKyJcMCIseWU9IlwwUEVSSU9EIitNYXRoLnJhbmRvbSgpKyJcMCI7ZnVuY3Rpb24gVnQobyl7cmV0dXJuIHBhcnNlSW50KG8sMTApPT1vP3BhcnNlSW50KG8sMTApOm8uY2hhckNvZGVBdCgwKX1mdW5jdGlvbiBpcyhvKXtyZXR1cm4gby5zcGxpdCgiXFxcXCIpLmpvaW4obWUpLnNwbGl0KCJcXHsiKS5qb2luKHdlKS5zcGxpdCgiXFx9Iikuam9pbihqdCkuc3BsaXQoIlxcLCIpLmpvaW4oRWUpLnNwbGl0KCJcXC4iKS5qb2luKHllKX1mdW5jdGlvbiBvcyhvKXtyZXR1cm4gby5zcGxpdChtZSkuam9pbigiXFwiKS5zcGxpdCh3ZSkuam9pbigieyIpLnNwbGl0KGp0KS5qb2luKCJ9Iikuc3BsaXQoRWUpLmpvaW4oIiwiKS5zcGxpdCh5ZSkuam9pbigiLiIpfWZ1bmN0aW9uIFJlKG8pe2lmKCFvKXJldHVyblsiIl07dmFyIHQ9W10sZT1iZSgieyIsIn0iLG8pO2lmKCFlKXJldHVybiBvLnNwbGl0KCIsIik7dmFyIHM9ZS5wcmUsaT1lLmJvZHksbj1lLnBvc3Qscj1zLnNwbGl0KCIsIik7cltyLmxlbmd0aC0xXSs9InsiK2krIn0iO3ZhciBhPVJlKG4pO3JldHVybiBuLmxlbmd0aCYmKHJbci5sZW5ndGgtMV0rPWEuc2hpZnQoKSxyLnB1c2guYXBwbHkocixhKSksdC5wdXNoLmFwcGx5KHQsciksdH1mdW5jdGlvbiBhcyhvKXtyZXR1cm4gbz8oby5zdWJzdHIoMCwyKT09PSJ7fSImJihvPSJcXHtcXH0iK28uc3Vic3RyKDIpKSxkdChpcyhvKSwhMCkubWFwKG9zKSk6W119ZnVuY3Rpb24gbHMobyl7cmV0dXJuInsiK28rIn0ifWZ1bmN0aW9uIGNzKG8pe3JldHVybi9eLT8wXGQvLnRlc3Qobyl9ZnVuY3Rpb24gZnMobyx0KXtyZXR1cm4gbzw9dH1mdW5jdGlvbiB1cyhvLHQpe3JldHVybiBvPj10fWZ1bmN0aW9uIGR0KG8sdCl7dmFyIGU9W10scz1iZSgieyIsIn0iLG8pO2lmKCFzKXJldHVybltvXTt2YXIgaT1zLnByZSxuPXMucG9zdC5sZW5ndGg/ZHQocy5wb3N0LCExKTpbIiJdO2lmKC9cJCQvLnRlc3Qocy5wcmUpKWZvcih2YXIgcj0wO3I8bi5sZW5ndGg7cisrKXt2YXIgYT1pKyJ7IitzLmJvZHkrIn0iK25bcl07ZS5wdXNoKGEpfWVsc2V7dmFyIGw9L14tP1xkK1wuXC4tP1xkKyg/OlwuXC4tP1xkKyk/JC8udGVzdChzLmJvZHkpLGM9L15bYS16QS1aXVwuXC5bYS16QS1aXSg/OlwuXC4tP1xkKyk/JC8udGVzdChzLmJvZHkpLGY9bHx8YyxkPXMuYm9keS5pbmRleE9mKCIsIik+PTA7aWYoIWYmJiFkKXJldHVybiBzLnBvc3QubWF0Y2goLywuKlx9Lyk/KG89cy5wcmUrInsiK3MuYm9keStqdCtzLnBvc3QsZHQobykpOltvXTt2YXIgdTtpZihmKXU9cy5ib2R5LnNwbGl0KC9cLlwuLyk7ZWxzZSBpZih1PVJlKHMuYm9keSksdS5sZW5ndGg9PT0xJiYodT1kdCh1WzBdLCExKS5tYXAobHMpLHUubGVuZ3RoPT09MSkpcmV0dXJuIG4ubWFwKGZ1bmN0aW9uKFdlKXtyZXR1cm4gcy5wcmUrdVswXStXZX0pO3ZhciBnO2lmKGYpe3ZhciBiPVZ0KHVbMF0pLGg9VnQodVsxXSksXz1NYXRoLm1heCh1WzBdLmxlbmd0aCx1WzFdLmxlbmd0aCksbT11Lmxlbmd0aD09Mz9NYXRoLmFicyhWdCh1WzJdKSk6MSxBPWZzLE49aDxiO04mJihtKj0tMSxBPXVzKTt2YXIgRD11LnNvbWUoY3MpO2c9W107Zm9yKHZhciBGPWI7QShGLGgpO0YrPW0pe3ZhciBMO2lmKGMpTD1TdHJpbmcuZnJvbUNoYXJDb2RlKEYpLEw9PT0iXFwiJiYoTD0iIik7ZWxzZSBpZihMPVN0cmluZyhGKSxEKXt2YXIgUD1fLUwubGVuZ3RoO2lmKFA+MCl7dmFyIGZ0PW5ldyBBcnJheShQKzEpLmpvaW4oIjAiKTtGPDA/TD0iLSIrZnQrTC5zbGljZSgxKTpMPWZ0K0x9fWcucHVzaChMKX19ZWxzZXtnPVtdO2Zvcih2YXIgQj0wO0I8dS5sZW5ndGg7QisrKWcucHVzaC5hcHBseShnLGR0KHVbQl0sITEpKX1mb3IodmFyIEI9MDtCPGcubGVuZ3RoO0IrKylmb3IodmFyIHI9MDtyPG4ubGVuZ3RoO3IrKyl7dmFyIGE9aStnW0JdK25bcl07KCF0fHxmfHxhKSYmZS5wdXNoKGEpfX1yZXR1cm4gZX19KTt2YXIgc2U9e29uKG8sdCl7YWRkRXZlbnRMaXN0ZW5lcihvLGU9Pnt0KGUuZGF0YSl9KX0scG9zdE1lc3NhZ2Uobyx0PVtdKXtzZWxmLnBvc3RNZXNzYWdlKG8sdCl9fTt2YXIgbXQsdXQsa3Q9Y2xhc3MgZXh0ZW5kcyBEYXRhVmlld3tjb25zdHJ1Y3RvcihlKXtzdXBlcihlKTtPKHRoaXMsdXQsbnVsbCl9anNvbigpe3JldHVybiBKU09OLnBhcnNlKHRoaXMuc3RyaW5nKCkpfWFycmF5QnVmZmVyKCl7cmV0dXJuIHRoaXMuYnVmZmVyfXRleHQoKXtyZXR1cm4gdGhpcy5zdHJpbmcoKX1zdHJpbmcoKXtyZXR1cm4gcChrdCxtdCkuZGVjb2RlKHRoaXMuYnVmZmVyKX1ieXRlcygpe3JldHVybiBwKHRoaXMsdXQpPz9SKHRoaXMsdXQsbmV3IFVpbnQ4QXJyYXkodGhpcy5idWZmZXIpKSxwKHRoaXMsdXQpfXNldEludDgoZSxzKXt0aHJvdyBuZXcgRXJyb3IoIkNhbm5vdCBzZXQgdmFsdWVzIG9uIG91dHB1dCIpfXNldEludDE2KGUscyxpKXt0aHJvdyBuZXcgRXJyb3IoIkNhbm5vdCBzZXQgdmFsdWVzIG9uIG91dHB1dCIpfXNldEludDMyKGUscyxpKXt0aHJvdyBuZXcgRXJyb3IoIkNhbm5vdCBzZXQgdmFsdWVzIG9uIG91dHB1dCIpfXNldFVpbnQ4KGUscyl7dGhyb3cgbmV3IEVycm9yKCJDYW5ub3Qgc2V0IHZhbHVlcyBvbiBvdXRwdXQiKX1zZXRVaW50MTYoZSxzLGkpe3Rocm93IG5ldyBFcnJvcigiQ2Fubm90IHNldCB2YWx1ZXMgb24gb3V0cHV0Iil9c2V0VWludDMyKGUscyxpKXt0aHJvdyBuZXcgRXJyb3IoIkNhbm5vdCBzZXQgdmFsdWVzIG9uIG91dHB1dCIpfXNldEZsb2F0MzIoZSxzLGkpe3Rocm93IG5ldyBFcnJvcigiQ2Fubm90IHNldCB2YWx1ZXMgb24gb3V0cHV0Iil9c2V0RmxvYXQ2NChlLHMsaSl7dGhyb3cgbmV3IEVycm9yKCJDYW5ub3Qgc2V0IHZhbHVlcyBvbiBvdXRwdXQiKX1zZXRCaWdJbnQ2NChlLHMsaSl7dGhyb3cgbmV3IEVycm9yKCJDYW5ub3Qgc2V0IHZhbHVlcyBvbiBvdXRwdXQiKX1zZXRCaWdVaW50NjQoZSxzLGkpe3Rocm93IG5ldyBFcnJvcigiQ2Fubm90IHNldCB2YWx1ZXMgb24gb3V0cHV0Iil9fSxWPWt0O210PW5ldyBXZWFrTWFwLHV0PW5ldyBXZWFrTWFwLE8oVixtdCxuZXcgVGV4dERlY29kZXIpO3ZhciBHPTQ7ZnVuY3Rpb24gdHQobyl7c3dpdGNoKG8pe2Nhc2UidHJhY2UiOnJldHVybiAwO2Nhc2UiZGVidWciOnJldHVybiAxO2Nhc2UiaW5mbyI6cmV0dXJuIDI7Y2FzZSJ3YXJuIjpyZXR1cm4gMztjYXNlImVycm9yIjpyZXR1cm4gNDtjYXNlInNpbGVudCI6cmV0dXJuIDIxNDc0ODM2NDc7ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKGB1bnJlY29nbml6ZWQgbG9nIGxldmVsICIke299IjsgZXhwZWN0ZWQgb25lIG9mICJ0cmFjZSIsICJkZWJ1ZyIsICJpbmZvIiwgIndhcm4iLCAiZXJyb3IiLCAic2lsZW50ImApfX1mdW5jdGlvbiBuZShvKXtzd2l0Y2gobyl7Y2FzZSAwOnJldHVybiJ0cmFjZSI7Y2FzZSAxOnJldHVybiJkZWJ1ZyI7Y2FzZSAyOnJldHVybiJpbmZvIjtjYXNlIDM6cmV0dXJuIndhcm4iO2Nhc2UgNDpyZXR1cm4iZXJyb3IiO2Nhc2UgMjE0NzQ4MzY0NzpyZXR1cm4ic2lsZW50IjtkZWZhdWx0OnRocm93IG5ldyBUeXBlRXJyb3IoYHVucmVjb2duaXplZCBsb2cgbGV2ZWwgIiR7b30iOyBleHBlY3RlZCBvbmUgb2YgInRyYWNlIiwgImRlYnVnIiwgImluZm8iLCAid2FybiIsICJlcnJvciIsICJzaWxlbnQiYCl9fXZhciByZT1nbG9iYWxUaGlzLldlYkFzc2VtYmx5fHx7fSx3dD17c3VwcG9ydHNKU1Byb21pc2VJbnRlcmZhY2U6dHlwZW9mIHJlLlN1c3BlbmRpbmc9PSJmdW5jdGlvbiImJnR5cGVvZiByZS5wcm9taXNpbmc9PSJmdW5jdGlvbiIsYWxsb3dTaGFyZWRCdWZmZXJDb2RlYzohMSxtYW5pZmVzdFN1cHBvcnRzUGF0aHM6ITEsY3Jvc3NPcmlnaW5DaGVja3NFbmZvcmNlZDohMCxmc0FjY2VzczohMSxoYXNXb3JrZXJDYXBhYmlsaXR5OnR5cGVvZiBnbG9iYWxUaGlzPCJ1Ij9nbG9iYWxUaGlzLmNyb3NzT3JpZ2luSXNvbGF0ZWQmJnR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlcjwidSI6ITAsc3VwcG9ydHNXYXNpUHJldmlldzE6ITAsc3VwcG9ydHNUaW1lb3V0czohMCxleHRpc21TdGRvdXRFbnZWYXJTZXQ6ITF9O3ZhciBGdD1TeW1ib2woImJlZ2luIiksRXQ9U3ltYm9sKCJlbmQiKSxqPVN5bWJvbCgiZW52IiksTXQ9U3ltYm9sKCJzZXQtaG9zdC1jb250ZXh0IiksQnQ9U3ltYm9sKCJnZXQtYmxvY2siKSx5dD1TeW1ib2woImltcG9ydC1zdGF0ZSIpLFJ0PVN5bWJvbCgiZXhwb3J0LXN0YXRlIiksaXQ9U3ltYm9sKCJzdG9yZS12YWx1ZSIpLHh0PVN5bWJvbCgicmVzZXQiKSxFPWNsYXNze2dldCBieXRlTGVuZ3RoKCl7cmV0dXJuIHRoaXMuYnVmZmVyLmJ5dGVMZW5ndGh9Y29uc3RydWN0b3IodCxlKXt0aGlzLmJ1ZmZlcj10LHRoaXMudmlldz1uZXcgRGF0YVZpZXcodGhpcy5idWZmZXIpLHRoaXMubG9jYWw9ZX1zdGF0aWMgaW5kZXhUb0FkZHJlc3ModCl7cmV0dXJuIEJpZ0ludCh0KTw8NDhufXN0YXRpYyBhZGRyZXNzVG9JbmRleCh0KXtyZXR1cm4gTnVtYmVyKEJpZ0ludCh0KT4+NDhuKX1zdGF0aWMgbWFza0FkZHJlc3ModCl7cmV0dXJuIE51bWJlcihCaWdJbnQodCkmKDFuPDw0OG4pLTFuKX19LHFlLG90PWNsYXNze2NvbnN0cnVjdG9yKHQsZSxzLGksbil7dGhpcy4jZT1bXTt0aGlzLiNpPW5ldyBNYXA7dGhpc1txZV09e2FsbG9jOnQ9PnRoaXMuYWxsb2ModCksZnJlZTp0PT57dGhpcy4jZVtFLmFkZHJlc3NUb0luZGV4KHQpXT1udWxsfSxsb2FkX3U4OnQ9PntsZXQgZT1FLmFkZHJlc3NUb0luZGV4KHQpLHM9RS5tYXNrQWRkcmVzcyh0KTtyZXR1cm4gdGhpcy4jZVtlXT8udmlldy5nZXRVaW50OChOdW1iZXIocykpfSxsb2FkX3U2NDp0PT57bGV0IGU9RS5hZGRyZXNzVG9JbmRleCh0KSxzPUUubWFza0FkZHJlc3ModCk7cmV0dXJuIHRoaXMuI2VbZV0/LnZpZXcuZ2V0QmlnVWludDY0KE51bWJlcihzKSwhMCl9LHN0b3JlX3U4Oih0LGUpPT57bGV0IHM9RS5hZGRyZXNzVG9JbmRleCh0KSxpPUUubWFza0FkZHJlc3ModCk7dGhpcy4jZVtzXT8udmlldy5zZXRVaW50OChOdW1iZXIoaSksTnVtYmVyKGUpKX0sc3RvcmVfdTY0Oih0LGUpPT57bGV0IHM9RS5hZGRyZXNzVG9JbmRleCh0KSxpPUUubWFza0FkZHJlc3ModCk7dGhpcy4jZVtzXT8udmlldy5zZXRCaWdVaW50NjQoTnVtYmVyKGkpLGUsITApfSxpbnB1dF9vZmZzZXQ6KCk9PntsZXQgdD10aGlzLiN0W3RoaXMuI3QubGVuZ3RoLTFdWzBdO3JldHVybiBFLmluZGV4VG9BZGRyZXNzKHR8fDApfSxpbnB1dF9sZW5ndGg6KCk9PkJpZ0ludCh0aGlzLiNkPy5ieXRlTGVuZ3RoPz8wKSxpbnB1dF9sb2FkX3U4OnQ9PntsZXQgZT1FLm1hc2tBZGRyZXNzKHQpO3JldHVybiB0aGlzLiNkPy52aWV3LmdldFVpbnQ4KE51bWJlcihlKSl9LGlucHV0X2xvYWRfdTY0OnQ9PntsZXQgZT1FLm1hc2tBZGRyZXNzKHQpO3JldHVybiB0aGlzLiNkPy52aWV3LmdldEJpZ1VpbnQ2NChOdW1iZXIoZSksITApfSxvdXRwdXRfc2V0Oih0LGUpPT57bGV0IHM9RS5hZGRyZXNzVG9JbmRleCh0KSxpPXRoaXMuI2Vbc107aWYoIWkpdGhyb3cgbmV3IEVycm9yKGBjYW5ub3QgYXNzaWduIHRvIHRoaXMgYmxvY2sgKGFkZHI9JHt0LnRvU3RyaW5nKDE2KS5wYWRTdGFydCgxNiwiMCIpfTsgbGVuZ3RoPSR7ZX0pYCk7aWYoZT5pLmJ1ZmZlci5ieXRlTGVuZ3RoKXRocm93IG5ldyBFcnJvcigibGVuZ3RoIGxvbmdlciB0aGFuIHRhcmdldCBibG9jayIpO3RoaXMuI3RbdGhpcy4jdC5sZW5ndGgtMV1bMV09c30sZXJyb3Jfc2V0OnQ9PntsZXQgZT1FLmFkZHJlc3NUb0luZGV4KHQpO2lmKCF0aGlzLiNlW2VdKXRocm93IG5ldyBFcnJvcigiY2Fubm90IGFzc2lnbiBlcnJvciB0byB0aGlzIGJsb2NrIik7dGhpcy4jdFt0aGlzLiN0Lmxlbmd0aC0xXVsyXT1lfSxlcnJvcl9nZXQ6KCk9PntsZXQgdD10aGlzLiN0W3RoaXMuI3QubGVuZ3RoLTFdWzJdO3JldHVybiB0P0UuaW5kZXhUb0FkZHJlc3ModCk6MG59LGNvbmZpZ19nZXQ6dD0+e2xldCBlPXRoaXMucmVhZCh0KTtpZihlPT09bnVsbClyZXR1cm4gMG47dHJ5e2xldCBzPWUuc3RyaW5nKCk7aWYocyBpbiB0aGlzLiNoKXJldHVybiB0aGlzLnN0b3JlKHRoaXMuI2hbc10pfWZpbmFsbHl7dGhpc1tqXS5mcmVlKHQpfXJldHVybiAwbn0sdmFyX2dldDp0PT57bGV0IGU9dGhpcy5yZWFkKHQpO2lmKGU9PT1udWxsKXJldHVybiAwbjt0cnl7bGV0IHM9ZS5zdHJpbmcoKSxpPXRoaXMuZ2V0VmFyaWFibGUocyksbj1pJiZ0aGlzW2l0XShpLmJ5dGVzKCkpfHwwO3JldHVybiBFLmluZGV4VG9BZGRyZXNzKG4pfWZpbmFsbHl7dGhpc1tqXS5mcmVlKHQpfX0sdmFyX3NldDoodCxlKT0+e2xldCBzPXRoaXMucmVhZCh0KTtpZihzPT09bnVsbCl7dGhpcy4jcy5lcnJvcihgYXR0ZW1wdGVkIHRvIHNldCB2YXJpYWJsZSB1c2luZyBpbnZhbGlkIGtleSBhZGRyZXNzIChhZGRyPSIke3QudG9TdHJpbmcoMTYpfUgiKWApO3JldHVybn1sZXQgaT1zLnN0cmluZygpO2lmKGU9PT0wbil7dGhpcy5kZWxldGVWYXJpYWJsZShpKTtyZXR1cm59bGV0IG49dGhpcy4jZVtFLmFkZHJlc3NUb0luZGV4KGUpXTtpZighbil7dGhpcy4jcy5lcnJvcihgYXR0ZW1wdGVkIHRvIHNldCB2YXJpYWJsZSB0byBpbnZhbGlkIGFkZHJlc3MgKGtleT0iJHtpfSI7IGFkZHI9IiR7ZS50b1N0cmluZygxNil9SCIpYCk7cmV0dXJufXRyeXtsZXQgcj1uZXcgVWludDhBcnJheShuLmJ1ZmZlci5ieXRlTGVuZ3RoKTtyLnNldChuZXcgVWludDhBcnJheShuLmJ1ZmZlciksMCksdGhpcy5zZXRWYXJpYWJsZShpLHIpfWNhdGNoKHIpe3RoaXMuI3MuZXJyb3Ioci5tZXNzYWdlKSx0aGlzLnNldEVycm9yKHIpO3JldHVybn19LGh0dHBfcmVxdWVzdDoodCxlKT0+KHRoaXMuI3MuZXJyb3IoImh0dHBfcmVxdWVzdCBpcyBub3QgZW5hYmxlZCIpLDBuKSxodHRwX3N0YXR1c19jb2RlOigpPT4odGhpcy4jcy5lcnJvcigiaHR0cF9zdGF0dXNfY29kZSBpcyBub3QgZW5hYmxlZCIpLDApLGh0dHBfaGVhZGVyczooKT0+KHRoaXMuI3MuZXJyb3IoImh0dHBfaGVhZGVycyBpcyBub3QgZW5hYmxlZCIpLDBuKSxsZW5ndGg6dD0+dGhpcy5sZW5ndGgodCksbGVuZ3RoX3Vuc2FmZTp0PT50aGlzLmxlbmd0aCh0KSxsb2dfd2Fybjp0aGlzLiNhLmJpbmQodGhpcyx0dCgid2FybiIpLCJ3YXJuIiksbG9nX2luZm86dGhpcy4jYS5iaW5kKHRoaXMsdHQoImluZm8iKSwiaW5mbyIpLGxvZ19kZWJ1Zzp0aGlzLiNhLmJpbmQodGhpcyx0dCgiZGVidWciKSwiZGVidWciKSxsb2dfZXJyb3I6dGhpcy4jYS5iaW5kKHRoaXMsdHQoImVycm9yIiksImVycm9yIiksbG9nX3RyYWNlOnRoaXMuI2EuYmluZCh0aGlzLHR0KCJ0cmFjZSIpLCJ0cmFjZSIpLGdldF9sb2dfbGV2ZWw6KCk9PmlzRmluaXRlKHRoaXMuI24pP3RoaXMuI246NDI5NDk2NzI5NX07dGhpcy4jYz10LHRoaXMuI3M9ZSx0aGlzLiNuPXM/PzIxNDc0ODM2NDcsdGhpcy4jbD1uZXcgVGV4dERlY29kZXIsdGhpcy4jcj1uZXcgVGV4dEVuY29kZXIsdGhpcy4jbz1uLHRoaXMuI2Y9MCx0aGlzLiN0PVtdLHRoaXMuYWxsb2MoMSksdGhpcy4jaD1pfSN0OyNlOyNzOyNuOyNsOyNyOyNjOyNoOyNpOyNmOyNvOyN1O2hvc3RDb250ZXh0KCl7cmV0dXJuIHRoaXMuI3V9YWxsb2ModCl7bGV0IGU9bmV3IEUobmV3IHRoaXMuI2MoTnVtYmVyKHQpKSwhMCkscz10aGlzLiNlLmxlbmd0aDtpZih0aGlzLiNlLnB1c2goZSksdGhpcy4jby5tYXhQYWdlcyl7bGV0IG49dGhpcy4jZS5yZWR1Y2UoKGEsbCk9PmErKGw/LmJ1ZmZlci5ieXRlTGVuZ3RoPz8wKSwwKSxyPU1hdGguY2VpbChuLzY1NTM2KTtpZihyPnRoaXMuI28ubWF4UGFnZXMpcmV0dXJuIHRoaXMuI3MuZXJyb3IoYG1lbW9yeSBsaW1pdCBleGNlZWRlZDogJHtyfSBwYWdlcyByZXF1ZXN0ZWQsICR7dGhpcy4jby5tYXhQYWdlc30gYWxsb3dlZGApLDBufXJldHVybiBFLmluZGV4VG9BZGRyZXNzKHMpfWdldFZhcmlhYmxlKHQpe3JldHVybiB0aGlzLiNpLmhhcyh0KT9uZXcgVih0aGlzLiNpLmdldCh0KS5idWZmZXIpOm51bGx9c2V0VmFyaWFibGUodCxlKXtsZXQgcz10eXBlb2YgZT09InN0cmluZyI/dGhpcy4jci5lbmNvZGUoZSk6ZSxpPXRoaXMuI2kuZ2V0KHQpLG49dGhpcy4jZitzLmJ5dGVMZW5ndGgtKGk/LmJ5dGVMZW5ndGh8fDApO2lmKG4+KHRoaXMuI28/Lm1heFZhckJ5dGVzfHwxLzApKXRocm93IG5ldyBFcnJvcihgdmFyIG1lbW9yeSBsaW1pdCBleGNlZWRlZDogJHtufSBieXRlcyByZXF1ZXN0ZWQsICR7dGhpcy4jby5tYXhWYXJCeXRlc30gYWxsb3dlZGApO3RoaXMuI2Y9bix0aGlzLiNpLnNldCh0LHMpfWRlbGV0ZVZhcmlhYmxlKHQpe2xldCBlPXRoaXMuI2kuZ2V0KHQpOyFlfHwodGhpcy4jaS5kZWxldGUodCksdGhpcy4jZi09ZS5ieXRlTGVuZ3RoKX1yZWFkKHQpe2xldCBlPUUuYWRkcmVzc1RvSW5kZXgodCkscz10aGlzLiNlW2VdO2lmKCFzKXJldHVybiBudWxsO2xldCBpPSEocy5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikmJiF3dC5hbGxvd1NoYXJlZEJ1ZmZlckNvZGVjP25ldyBVaW50OEFycmF5KHMuYnVmZmVyKS5zbGljZSgpLmJ1ZmZlcjpzLmJ1ZmZlcjtyZXR1cm4gbmV3IFYoaSl9c3RvcmUodCl7bGV0IGU9dGhpc1tpdF0odCk7aWYoIWUpdGhyb3cgbmV3IEVycm9yKCJmYWlsZWQgdG8gc3RvcmUgb3V0cHV0Iik7cmV0dXJuIEUuaW5kZXhUb0FkZHJlc3MoZSl9bGVuZ3RoKHQpe2xldCBlPUUuYWRkcmVzc1RvSW5kZXgodCkscz10aGlzLiNlW2VdO3JldHVybiBzP0JpZ0ludChzLmJ1ZmZlci5ieXRlTGVuZ3RoKTowbn1zZXRFcnJvcih0PW51bGwpe2xldCBlPXQ/dGhpc1tpdF0odCBpbnN0YW5jZW9mIEVycm9yP3QubWVzc2FnZTp0KTowO2lmKCFlKXRocm93IG5ldyBFcnJvcigiY291bGQgbm90IHN0b3JlIGVycm9yIHZhbHVlIik7dGhpcy4jdFt0aGlzLiN0Lmxlbmd0aC0xXVsyXT1lfWdldCBsb2dMZXZlbCgpe3JldHVybiBuZSh0aGlzLiNuKX1zZXQgbG9nTGV2ZWwodCl7dGhpcy4jbj10dCh0KX0jYSh0LGUscyl7bGV0IGk9RS5hZGRyZXNzVG9JbmRleChzKSxuPXRoaXMuI2VbaV07aWYoIW4pe3RoaXMuI3MuZXJyb3IoYGZhaWxlZCB0byBsb2coJHtlfSk6IGJhZCBibG9jayByZWZlcmVuY2UgaW4gYWRkciAweCR7cy50b1N0cmluZygxNikucGFkU3RhcnQoNjQsIjAiKX1gKTtyZXR1cm59dHJ5e2lmKHRoaXMuI248PXQpe2xldCByPXRoaXMuI2wuZGVjb2RlKG4uYnVmZmVyKTt0aGlzLiNzW2VdKHIpfX1maW5hbGx5e3RoaXMuI2VbaV09bnVsbH19Z2V0I2QoKXtsZXQgdD10aGlzLiN0W3RoaXMuI3QubGVuZ3RoLTFdWzBdO3JldHVybiB0PT09bnVsbD9udWxsOnRoaXMuI2VbdF19WyhxZT1qLHh0KV0oKXt0aGlzLiN1PW51bGwsdGhpcy4jZS5sZW5ndGg9MSx0aGlzLiN0Lmxlbmd0aD0wfVtCdF0odCl7bGV0IGU9dGhpcy4jZVt0XTtpZighZSl0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgYmxvY2sgaW5kZXg6ICR7dH1gKTtyZXR1cm4gZX1beXRdKHQsZT0hMSl7Zm9yKGxldFtzLGldb2YgdC5ibG9ja3Mpe2lmKHMmJmUpe2xldCBuPW5ldyBVaW50OEFycmF5KG5ldyB0aGlzLiNjKE51bWJlcihzLmJ5dGVMZW5ndGgpKSk7bi5zZXQobmV3IFVpbnQ4QXJyYXkocykpLHM9bi5idWZmZXJ9dGhpcy4jZVtpXT1zP25ldyBFKHMsITEpOm51bGx9dGhpcy4jdD10LnN0YWNrfVtSdF0oKXtyZXR1cm57c3RhY2s6dGhpcy4jdC5zbGljZSgpLGJsb2Nrczp0aGlzLiNlLm1hcCgodCxlKT0+dD90LmxvY2FsPyh0LmxvY2FsPSExLFt0LmJ1ZmZlcixlXSk6bnVsbDpbbnVsbCxlXSkuZmlsdGVyKEJvb2xlYW4pfX1baXRdKHQpe2lmKHR5cGVvZiB0PT0ic3RyaW5nIiYmKHQ9dGhpcy4jci5lbmNvZGUodCkpLCF0KXJldHVybiBudWxsO2lmKHQgaW5zdGFuY2VvZiBVaW50OEFycmF5KXtpZih0LmJ1ZmZlci5jb25zdHJ1Y3Rvcj09PXRoaXMuI2MmJnQuYnl0ZU9mZnNldD09PTAmJnQuYnl0ZUxlbmd0aD09PXQuYnVmZmVyLmJ5dGVMZW5ndGgpe2xldCBuPXRoaXMuI2UubGVuZ3RoO3JldHVybiB0aGlzLiNlLnB1c2gobmV3IEUodC5idWZmZXIsITApKSxufWxldCBlPUUuYWRkcmVzc1RvSW5kZXgodGhpcy5hbGxvYyh0Lmxlbmd0aCkpLHM9dGhpcy4jZVtlXTtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkocy5idWZmZXIpLnNldCh0LDApLGV9cmV0dXJuIHR9W010XSh0KXt0aGlzLiN1PXR9W0Z0XSh0KXt0aGlzLiN0LnB1c2goW3QsbnVsbCxudWxsXSl9W0V0XSgpe3RoaXMuI3U9bnVsbDtsZXRbLHQsZV09dGhpcy4jdC5wb3AoKSxzPWU9PT1udWxsPzE6MCxpPWU/P3Qsbj1bbnVsbCxudWxsXTtyZXR1cm4gaT09PW51bGx8fHRoaXMuI2VbaV09PT1udWxsfHwobltzXT1pKSxufX07dmFyIHo9Y2xhc3N7c3RhdGljIHJlYWRfYnl0ZXModCxlKXtsZXQgcz1uZXcgejtyZXR1cm4gcy5idWY9dC5nZXRVaW50MzIoZSwhMCkscy5idWZfbGVuPXQuZ2V0VWludDMyKGUrNCwhMCksc31zdGF0aWMgcmVhZF9ieXRlc19hcnJheSh0LGUscyl7bGV0IGk9W107Zm9yKGxldCBuPTA7bjxzO24rKylpLnB1c2goei5yZWFkX2J5dGVzKHQsZSs4Km4pKTtyZXR1cm4gaX19LFk9Y2xhc3N7c3RhdGljIHJlYWRfYnl0ZXModCxlKXtsZXQgcz1uZXcgWTtyZXR1cm4gcy5idWY9dC5nZXRVaW50MzIoZSwhMCkscy5idWZfbGVuPXQuZ2V0VWludDMyKGUrNCwhMCksc31zdGF0aWMgcmVhZF9ieXRlc19hcnJheSh0LGUscyl7bGV0IGk9W107Zm9yKGxldCBuPTA7bjxzO24rKylpLnB1c2goWS5yZWFkX2J5dGVzKHQsZSs4Km4pKTtyZXR1cm4gaX19LGllPTAsb2U9MSxHdD0yO3ZhciBXdD00O3ZhciBhZT0xPDwwLGNuPTE8PDEsZm49MTw8Mix1bj0xPDwzLGhuPTE8PDQsT3Q9Y2xhc3N7d3JpdGVfYnl0ZXModCxlKXt0LnNldFVpbnQ4KGUsdGhpcy5mc19maWxldHlwZSksdC5zZXRVaW50MTYoZSsyLHRoaXMuZnNfZmxhZ3MsITApLHQuc2V0QmlnVWludDY0KGUrOCx0aGlzLmZzX3JpZ2h0c19iYXNlLCEwKSx0LnNldEJpZ1VpbnQ2NChlKzE2LHRoaXMuZnNfcmlnaHRzX2luaGVyaXRlZCwhMCl9Y29uc3RydWN0b3IodCxlKXt0aGlzLmZzX3JpZ2h0c19iYXNlPTBuLHRoaXMuZnNfcmlnaHRzX2luaGVyaXRlZD0wbix0aGlzLmZzX2ZpbGV0eXBlPXQsdGhpcy5mc19mbGFncz1lfX0sZG49MTw8MCxwbj0xPDwxLGduPTE8PDIsX249MTw8MyxaZT0xPDwwLEplPTE8PDEsUWU9MTw8Mix0cz0xPDwzLE50PWNsYXNze3dyaXRlX2J5dGVzKHQsZSl7dC5zZXRCaWdVaW50NjQoZSx0aGlzLmRldiwhMCksdC5zZXRCaWdVaW50NjQoZSs4LHRoaXMuaW5vLCEwKSx0LnNldFVpbnQ4KGUrMTYsdGhpcy5maWxldHlwZSksdC5zZXRCaWdVaW50NjQoZSsyNCx0aGlzLm5saW5rLCEwKSx0LnNldEJpZ1VpbnQ2NChlKzMyLHRoaXMuc2l6ZSwhMCksdC5zZXRCaWdVaW50NjQoZSszOCx0aGlzLmF0aW0sITApLHQuc2V0QmlnVWludDY0KGUrNDYsdGhpcy5tdGltLCEwKSx0LnNldEJpZ1VpbnQ2NChlKzUyLHRoaXMuY3RpbSwhMCl9Y29uc3RydWN0b3IodCxlKXt0aGlzLmRldj0wbix0aGlzLmlubz0wbix0aGlzLm5saW5rPTBuLHRoaXMuYXRpbT0wbix0aGlzLm10aW09MG4sdGhpcy5jdGltPTBuLHRoaXMuZmlsZXR5cGU9dCx0aGlzLnNpemU9ZX19O3ZhciBibj0xPDwwLG1uPTE8PDA7dmFyIHduPTE8PDAsRW49MTw8MSx5bj0xPDwwLFJuPTE8PDAseG49MTw8MTt2YXIgZXM9Y2xhc3N7ZW5hYmxlKHQpe3RoaXMubG9nPXNzKHQ9PT12b2lkIDA/ITA6dCx0aGlzLnByZWZpeCl9Z2V0IGVuYWJsZWQoKXtyZXR1cm4gdGhpcy5pc0VuYWJsZWR9Y29uc3RydWN0b3IodCl7dGhpcy5pc0VuYWJsZWQ9dCx0aGlzLnByZWZpeD0id2FzaToiLHRoaXMuZW5hYmxlKHQpfX07ZnVuY3Rpb24gc3Mobyx0KXtyZXR1cm4gbz9jb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUsIiVjJXMiLCJjb2xvcjogIzI2NUJBMCIsdCk6KCk9Pnt9fXZhciBNPW5ldyBlcyghMSk7dmFyIEF0PWNsYXNzIGV4dGVuZHMgRXJyb3J7Y29uc3RydWN0b3IodCl7c3VwZXIoImV4aXQgd2l0aCBleGl0IGNvZGUgIit0KSx0aGlzLmNvZGU9dH19LCR0PWNsYXNze3N0YXJ0KHQpe3RoaXMuaW5zdD10O3RyeXt0LmV4cG9ydHMuX3N0YXJ0KCl9Y2F0Y2goZSl7aWYoZSBpbnN0YW5jZW9mIEF0KXJldHVybiBlLmNvZGU7dGhyb3cgZX19aW5pdGlhbGl6ZSh0KXt0aGlzLmluc3Q9dCx0LmV4cG9ydHMuX2luaXRpYWxpemUoKX1jb25zdHJ1Y3Rvcih0LGUscyxpPXt9KXt0aGlzLmFyZ3M9W10sdGhpcy5lbnY9W10sdGhpcy5mZHM9W10sTS5lbmFibGUoaS5kZWJ1ZyksdGhpcy5hcmdzPXQsdGhpcy5lbnY9ZSx0aGlzLmZkcz1zO2xldCBuPXRoaXM7dGhpcy53YXNpSW1wb3J0PXthcmdzX3NpemVzX2dldChyLGEpe2xldCBsPW5ldyBEYXRhVmlldyhuLmluc3QuZXhwb3J0cy5tZW1vcnkuYnVmZmVyKTtsLnNldFVpbnQzMihyLG4uYXJncy5sZW5ndGgsITApO2xldCBjPTA7Zm9yKGxldCBmIG9mIG4uYXJncyljKz1mLmxlbmd0aCsxO3JldHVybiBsLnNldFVpbnQzMihhLGMsITApLE0ubG9nKGwuZ2V0VWludDMyKHIsITApLGwuZ2V0VWludDMyKGEsITApKSwwfSxhcmdzX2dldChyLGEpe2xldCBsPW5ldyBEYXRhVmlldyhuLmluc3QuZXhwb3J0cy5tZW1vcnkuYnVmZmVyKSxjPW5ldyBVaW50OEFycmF5KG4uaW5zdC5leHBvcnRzLm1lbW9yeS5idWZmZXIpLGY9YTtmb3IobGV0IGQ9MDtkPG4uYXJncy5sZW5ndGg7ZCsrKXtsLnNldFVpbnQzMihyLGEsITApLHIrPTQ7bGV0IHU9bmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKG4uYXJnc1tkXSk7Yy5zZXQodSxhKSxsLnNldFVpbnQ4KGErdS5sZW5ndGgsMCksYSs9dS5sZW5ndGgrMX1yZXR1cm4gTS5lbmFibGVkJiZNLmxvZyhuZXcgVGV4dERlY29kZXIoInV0Zi04IikuZGVjb2RlKGMuc2xpY2UoZixhKSkpLDB9LGVudmlyb25fc2l6ZXNfZ2V0KHIsYSl7bGV0IGw9bmV3IERhdGFWaWV3KG4uaW5zdC5leHBvcnRzLm1lbW9yeS5idWZmZXIpO2wuc2V0VWludDMyKHIsbi5lbnYubGVuZ3RoLCEwKTtsZXQgYz0wO2ZvcihsZXQgZiBvZiBuLmVudiljKz1mLmxlbmd0aCsxO3JldHVybiBsLnNldFVpbnQzMihhLGMsITApLE0ubG9nKGwuZ2V0VWludDMyKHIsITApLGwuZ2V0VWludDMyKGEsITApKSwwfSxlbnZpcm9uX2dldChyLGEpe2xldCBsPW5ldyBEYXRhVmlldyhuLmluc3QuZXhwb3J0cy5tZW1vcnkuYnVmZmVyKSxjPW5ldyBVaW50OEFycmF5KG4uaW5zdC5leHBvcnRzLm1lbW9yeS5idWZmZXIpLGY9YTtmb3IobGV0IGQ9MDtkPG4uZW52Lmxlbmd0aDtkKyspe2wuc2V0VWludDMyKHIsYSwhMCkscis9NDtsZXQgdT1uZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUobi5lbnZbZF0pO2Muc2V0KHUsYSksbC5zZXRVaW50OChhK3UubGVuZ3RoLDApLGErPXUubGVuZ3RoKzF9cmV0dXJuIE0uZW5hYmxlZCYmTS5sb2cobmV3IFRleHREZWNvZGVyKCJ1dGYtOCIpLmRlY29kZShjLnNsaWNlKGYsYSkpKSwwfSxjbG9ja19yZXNfZ2V0KHIsYSl7bGV0IGw7c3dpdGNoKHIpe2Nhc2UgMTp7bD01MDAwbjticmVha31jYXNlIDA6e2w9MTAwMDAwMG47YnJlYWt9ZGVmYXVsdDpyZXR1cm4gNTJ9cmV0dXJuIG5ldyBEYXRhVmlldyhuLmluc3QuZXhwb3J0cy5tZW1vcnkuYnVmZmVyKS5zZXRCaWdVaW50NjQoYSxsLCEwKSwwfSxjbG9ja190aW1lX2dldChyLGEsbCl7bGV0IGM9bmV3IERhdGFWaWV3KG4uaW5zdC5leHBvcnRzLm1lbW9yeS5idWZmZXIpO2lmKHI9PT0wKWMuc2V0QmlnVWludDY0KGwsQmlnSW50KG5ldyBEYXRlKCkuZ2V0VGltZSgpKSoxMDAwMDAwbiwhMCk7ZWxzZSBpZihyPT0xKXtsZXQgZjt0cnl7Zj1CaWdJbnQoTWF0aC5yb3VuZChwZXJmb3JtYW5jZS5ub3coKSoxZTYpKX1jYXRjaHtmPTBufWMuc2V0QmlnVWludDY0KGwsZiwhMCl9ZWxzZSBjLnNldEJpZ1VpbnQ2NChsLDBuLCEwKTtyZXR1cm4gMH0sZmRfYWR2aXNlKHIsYSxsLGMpe3JldHVybiBuLmZkc1tyXSE9bnVsbD9uLmZkc1tyXS5mZF9hZHZpc2UoYSxsLGMpOjh9LGZkX2FsbG9jYXRlKHIsYSxsKXtyZXR1cm4gbi5mZHNbcl0hPW51bGw/bi5mZHNbcl0uZmRfYWxsb2NhdGUoYSxsKTo4fSxmZF9jbG9zZShyKXtpZihuLmZkc1tyXSE9bnVsbCl7bGV0IGE9bi5mZHNbcl0uZmRfY2xvc2UoKTtyZXR1cm4gbi5mZHNbcl09dm9pZCAwLGF9ZWxzZSByZXR1cm4gOH0sZmRfZGF0YXN5bmMocil7cmV0dXJuIG4uZmRzW3JdIT1udWxsP24uZmRzW3JdLmZkX2RhdGFzeW5jKCk6OH0sZmRfZmRzdGF0X2dldChyLGEpe2lmKG4uZmRzW3JdIT1udWxsKXtsZXR7cmV0OmwsZmRzdGF0OmN9PW4uZmRzW3JdLmZkX2Zkc3RhdF9nZXQoKTtyZXR1cm4gYz8ud3JpdGVfYnl0ZXMobmV3IERhdGFWaWV3KG4uaW5zdC5leHBvcnRzLm1lbW9yeS5idWZmZXIpLGEpLGx9ZWxzZSByZXR1cm4gOH0sZmRfZmRzdGF0X3NldF9mbGFncyhyLGEpe3JldHVybiBuLmZkc1tyXSE9bnVsbD9uLmZkc1tyXS5mZF9mZHN0YXRfc2V0X2ZsYWdzKGEpOjh9LGZkX2Zkc3RhdF9zZXRfcmlnaHRzKHIsYSxsKXtyZXR1cm4gbi5mZHNbcl0hPW51bGw/bi5mZHNbcl0uZmRfZmRzdGF0X3NldF9yaWdodHMoYSxsKTo4fSxmZF9maWxlc3RhdF9nZXQocixhKXtpZihuLmZkc1tyXSE9bnVsbCl7bGV0e3JldDpsLGZpbGVzdGF0OmN9PW4uZmRzW3JdLmZkX2ZpbGVzdGF0X2dldCgpO3JldHVybiBjPy53cml0ZV9ieXRlcyhuZXcgRGF0YVZpZXcobi5pbnN0LmV4cG9ydHMubWVtb3J5LmJ1ZmZlciksYSksbH1lbHNlIHJldHVybiA4fSxmZF9maWxlc3RhdF9zZXRfc2l6ZShyLGEpe3JldHVybiBuLmZkc1tyXSE9bnVsbD9uLmZkc1tyXS5mZF9maWxlc3RhdF9zZXRfc2l6ZShhKTo4fSxmZF9maWxlc3RhdF9zZXRfdGltZXMocixhLGwsYyl7cmV0dXJuIG4uZmRzW3JdIT1udWxsP24uZmRzW3JdLmZkX2ZpbGVzdGF0X3NldF90aW1lcyhhLGwsYyk6OH0sZmRfcHJlYWQocixhLGwsYyxmKXtsZXQgZD1uZXcgRGF0YVZpZXcobi5pbnN0LmV4cG9ydHMubWVtb3J5LmJ1ZmZlciksdT1uZXcgVWludDhBcnJheShuLmluc3QuZXhwb3J0cy5tZW1vcnkuYnVmZmVyKTtpZihuLmZkc1tyXSE9bnVsbCl7bGV0IGc9ei5yZWFkX2J5dGVzX2FycmF5KGQsYSxsKSx7cmV0OmIsbnJlYWQ6aH09bi5mZHNbcl0uZmRfcHJlYWQodSxnLGMpO3JldHVybiBkLnNldFVpbnQzMihmLGgsITApLGJ9ZWxzZSByZXR1cm4gOH0sZmRfcHJlc3RhdF9nZXQocixhKXtsZXQgbD1uZXcgRGF0YVZpZXcobi5pbnN0LmV4cG9ydHMubWVtb3J5LmJ1ZmZlcik7aWYobi5mZHNbcl0hPW51bGwpe2xldHtyZXQ6YyxwcmVzdGF0OmZ9PW4uZmRzW3JdLmZkX3ByZXN0YXRfZ2V0KCk7cmV0dXJuIGY/LndyaXRlX2J5dGVzKGwsYSksY31lbHNlIHJldHVybiA4fSxmZF9wcmVzdGF0X2Rpcl9uYW1lKHIsYSxsKXtpZihuLmZkc1tyXSE9bnVsbCl7bGV0e3JldDpjLHByZXN0YXRfZGlyX25hbWU6Zn09bi5mZHNbcl0uZmRfcHJlc3RhdF9kaXJfbmFtZSgpO3JldHVybiBmIT1udWxsJiZuZXcgVWludDhBcnJheShuLmluc3QuZXhwb3J0cy5tZW1vcnkuYnVmZmVyKS5zZXQoZixhKSxjfWVsc2UgcmV0dXJuIDh9LGZkX3B3cml0ZShyLGEsbCxjLGYpe2xldCBkPW5ldyBEYXRhVmlldyhuLmluc3QuZXhwb3J0cy5tZW1vcnkuYnVmZmVyKSx1PW5ldyBVaW50OEFycmF5KG4uaW5zdC5leHBvcnRzLm1lbW9yeS5idWZmZXIpO2lmKG4uZmRzW3JdIT1udWxsKXtsZXQgZz1ZLnJlYWRfYnl0ZXNfYXJyYXkoZCxhLGwpLHtyZXQ6Yixud3JpdHRlbjpofT1uLmZkc1tyXS5mZF9wd3JpdGUodSxnLGMpO3JldHVybiBkLnNldFVpbnQzMihmLGgsITApLGJ9ZWxzZSByZXR1cm4gOH0sZmRfcmVhZChyLGEsbCxjKXtsZXQgZj1uZXcgRGF0YVZpZXcobi5pbnN0LmV4cG9ydHMubWVtb3J5LmJ1ZmZlciksZD1uZXcgVWludDhBcnJheShuLmluc3QuZXhwb3J0cy5tZW1vcnkuYnVmZmVyKTtpZihuLmZkc1tyXSE9bnVsbCl7bGV0IHU9ei5yZWFkX2J5dGVzX2FycmF5KGYsYSxsKSx7cmV0OmcsbnJlYWQ6Yn09bi5mZHNbcl0uZmRfcmVhZChkLHUpO3JldHVybiBmLnNldFVpbnQzMihjLGIsITApLGd9ZWxzZSByZXR1cm4gOH0sZmRfcmVhZGRpcihyLGEsbCxjLGYpe2xldCBkPW5ldyBEYXRhVmlldyhuLmluc3QuZXhwb3J0cy5tZW1vcnkuYnVmZmVyKSx1PW5ldyBVaW50OEFycmF5KG4uaW5zdC5leHBvcnRzLm1lbW9yeS5idWZmZXIpO2lmKG4uZmRzW3JdIT1udWxsKXtsZXQgZz0wO2Zvcig7Oyl7bGV0e3JldDpiLGRpcmVudDpofT1uLmZkc1tyXS5mZF9yZWFkZGlyX3NpbmdsZShjKTtpZihiIT0wKXJldHVybiBkLnNldFVpbnQzMihmLGcsITApLGI7aWYoaD09bnVsbClicmVhaztpZihsLWc8aC5oZWFkX2xlbmd0aCgpKXtnPWw7YnJlYWt9bGV0IF89bmV3IEFycmF5QnVmZmVyKGguaGVhZF9sZW5ndGgoKSk7aWYoaC53cml0ZV9oZWFkX2J5dGVzKG5ldyBEYXRhVmlldyhfKSwwKSx1LnNldChuZXcgVWludDhBcnJheShfKS5zbGljZSgwLE1hdGgubWluKF8uYnl0ZUxlbmd0aCxsLWcpKSxhKSxhKz1oLmhlYWRfbGVuZ3RoKCksZys9aC5oZWFkX2xlbmd0aCgpLGwtZzxoLm5hbWVfbGVuZ3RoKCkpe2c9bDticmVha31oLndyaXRlX25hbWVfYnl0ZXModSxhLGwtZyksYSs9aC5uYW1lX2xlbmd0aCgpLGcrPWgubmFtZV9sZW5ndGgoKSxjPWguZF9uZXh0fXJldHVybiBkLnNldFVpbnQzMihmLGcsITApLDB9ZWxzZSByZXR1cm4gOH0sZmRfcmVudW1iZXIocixhKXtpZihuLmZkc1tyXSE9bnVsbCYmbi5mZHNbYV0hPW51bGwpe2xldCBsPW4uZmRzW2FdLmZkX2Nsb3NlKCk7cmV0dXJuIGwhPTA/bDoobi5mZHNbYV09bi5mZHNbcl0sbi5mZHNbcl09dm9pZCAwLDApfWVsc2UgcmV0dXJuIDh9LGZkX3NlZWsocixhLGwsYyl7bGV0IGY9bmV3IERhdGFWaWV3KG4uaW5zdC5leHBvcnRzLm1lbW9yeS5idWZmZXIpO2lmKG4uZmRzW3JdIT1udWxsKXtsZXR7cmV0OmQsb2Zmc2V0OnV9PW4uZmRzW3JdLmZkX3NlZWsoYSxsKTtyZXR1cm4gZi5zZXRCaWdJbnQ2NChjLHUsITApLGR9ZWxzZSByZXR1cm4gOH0sZmRfc3luYyhyKXtyZXR1cm4gbi5mZHNbcl0hPW51bGw/bi5mZHNbcl0uZmRfc3luYygpOjh9LGZkX3RlbGwocixhKXtsZXQgbD1uZXcgRGF0YVZpZXcobi5pbnN0LmV4cG9ydHMubWVtb3J5LmJ1ZmZlcik7aWYobi5mZHNbcl0hPW51bGwpe2xldHtyZXQ6YyxvZmZzZXQ6Zn09bi5mZHNbcl0uZmRfdGVsbCgpO3JldHVybiBsLnNldEJpZ1VpbnQ2NChhLGYsITApLGN9ZWxzZSByZXR1cm4gOH0sZmRfd3JpdGUocixhLGwsYyl7bGV0IGY9bmV3IERhdGFWaWV3KG4uaW5zdC5leHBvcnRzLm1lbW9yeS5idWZmZXIpLGQ9bmV3IFVpbnQ4QXJyYXkobi5pbnN0LmV4cG9ydHMubWVtb3J5LmJ1ZmZlcik7aWYobi5mZHNbcl0hPW51bGwpe2xldCB1PVkucmVhZF9ieXRlc19hcnJheShmLGEsbCkse3JldDpnLG53cml0dGVuOmJ9PW4uZmRzW3JdLmZkX3dyaXRlKGQsdSk7cmV0dXJuIGYuc2V0VWludDMyKGMsYiwhMCksZ31lbHNlIHJldHVybiA4fSxwYXRoX2NyZWF0ZV9kaXJlY3RvcnkocixhLGwpe2xldCBjPW5ldyBVaW50OEFycmF5KG4uaW5zdC5leHBvcnRzLm1lbW9yeS5idWZmZXIpO2lmKG4uZmRzW3JdIT1udWxsKXtsZXQgZj1uZXcgVGV4dERlY29kZXIoInV0Zi04IikuZGVjb2RlKGMuc2xpY2UoYSxhK2wpKTtyZXR1cm4gbi5mZHNbcl0ucGF0aF9jcmVhdGVfZGlyZWN0b3J5KGYpfX0scGF0aF9maWxlc3RhdF9nZXQocixhLGwsYyxmKXtsZXQgZD1uZXcgRGF0YVZpZXcobi5pbnN0LmV4cG9ydHMubWVtb3J5LmJ1ZmZlciksdT1uZXcgVWludDhBcnJheShuLmluc3QuZXhwb3J0cy5tZW1vcnkuYnVmZmVyKTtpZihuLmZkc1tyXSE9bnVsbCl7bGV0IGc9bmV3IFRleHREZWNvZGVyKCJ1dGYtOCIpLmRlY29kZSh1LnNsaWNlKGwsbCtjKSkse3JldDpiLGZpbGVzdGF0Omh9PW4uZmRzW3JdLnBhdGhfZmlsZXN0YXRfZ2V0KGEsZyk7cmV0dXJuIGg/LndyaXRlX2J5dGVzKGQsZiksYn1lbHNlIHJldHVybiA4fSxwYXRoX2ZpbGVzdGF0X3NldF90aW1lcyhyLGEsbCxjLGYsZCx1KXtsZXQgZz1uZXcgVWludDhBcnJheShuLmluc3QuZXhwb3J0cy5tZW1vcnkuYnVmZmVyKTtpZihuLmZkc1tyXSE9bnVsbCl7bGV0IGI9bmV3IFRleHREZWNvZGVyKCJ1dGYtOCIpLmRlY29kZShnLnNsaWNlKGwsbCtjKSk7cmV0dXJuIG4uZmRzW3JdLnBhdGhfZmlsZXN0YXRfc2V0X3RpbWVzKGEsYixmLGQsdSl9ZWxzZSByZXR1cm4gOH0scGF0aF9saW5rKHIsYSxsLGMsZixkLHUpe2xldCBnPW5ldyBVaW50OEFycmF5KG4uaW5zdC5leHBvcnRzLm1lbW9yeS5idWZmZXIpO2lmKG4uZmRzW3JdIT1udWxsJiZuLmZkc1tmXSE9bnVsbCl7bGV0IGI9bmV3IFRleHREZWNvZGVyKCJ1dGYtOCIpLmRlY29kZShnLnNsaWNlKGwsbCtjKSksaD1uZXcgVGV4dERlY29kZXIoInV0Zi04IikuZGVjb2RlKGcuc2xpY2UoZCxkK3UpKTtyZXR1cm4gbi5mZHNbZl0ucGF0aF9saW5rKHIsYSxiLGgpfWVsc2UgcmV0dXJuIDh9LHBhdGhfb3BlbihyLGEsbCxjLGYsZCx1LGcsYil7bGV0IGg9bmV3IERhdGFWaWV3KG4uaW5zdC5leHBvcnRzLm1lbW9yeS5idWZmZXIpLF89bmV3IFVpbnQ4QXJyYXkobi5pbnN0LmV4cG9ydHMubWVtb3J5LmJ1ZmZlcik7aWYobi5mZHNbcl0hPW51bGwpe2xldCBtPW5ldyBUZXh0RGVjb2RlcigidXRmLTgiKS5kZWNvZGUoXy5zbGljZShsLGwrYykpO00ubG9nKG0pO2xldHtyZXQ6QSxmZF9vYmo6Tn09bi5mZHNbcl0ucGF0aF9vcGVuKGEsbSxmLGQsdSxnKTtpZihBIT0wKXJldHVybiBBO24uZmRzLnB1c2goTik7bGV0IEQ9bi5mZHMubGVuZ3RoLTE7cmV0dXJuIGguc2V0VWludDMyKGIsRCwhMCksMH1lbHNlIHJldHVybiA4fSxwYXRoX3JlYWRsaW5rKHIsYSxsLGMsZixkKXtsZXQgdT1uZXcgRGF0YVZpZXcobi5pbnN0LmV4cG9ydHMubWVtb3J5LmJ1ZmZlciksZz1uZXcgVWludDhBcnJheShuLmluc3QuZXhwb3J0cy5tZW1vcnkuYnVmZmVyKTtpZihuLmZkc1tyXSE9bnVsbCl7bGV0IGI9bmV3IFRleHREZWNvZGVyKCJ1dGYtOCIpLmRlY29kZShnLnNsaWNlKGEsYStsKSk7TS5sb2coYik7bGV0e3JldDpoLGRhdGE6X309bi5mZHNbcl0ucGF0aF9yZWFkbGluayhiKTtpZihfIT1udWxsKXtpZihfLmxlbmd0aD5mKXJldHVybiB1LnNldFVpbnQzMihkLDAsITApLDg7Zy5zZXQoXyxjKSx1LnNldFVpbnQzMihkLF8ubGVuZ3RoLCEwKX1yZXR1cm4gaH1lbHNlIHJldHVybiA4fSxwYXRoX3JlbW92ZV9kaXJlY3RvcnkocixhLGwpe2xldCBjPW5ldyBVaW50OEFycmF5KG4uaW5zdC5leHBvcnRzLm1lbW9yeS5idWZmZXIpO2lmKG4uZmRzW3JdIT1udWxsKXtsZXQgZj1uZXcgVGV4dERlY29kZXIoInV0Zi04IikuZGVjb2RlKGMuc2xpY2UoYSxhK2wpKTtyZXR1cm4gbi5mZHNbcl0ucGF0aF9yZW1vdmVfZGlyZWN0b3J5KGYpfWVsc2UgcmV0dXJuIDh9LHBhdGhfcmVuYW1lKHIsYSxsLGMsZixkKXt0aHJvdyJGSVhNRSB3aGF0IGlzIHRoZSBiZXN0IGFic3RyYWN0aW9uIGZvciB0aGlzPyJ9LHBhdGhfc3ltbGluayhyLGEsbCxjLGYpe2xldCBkPW5ldyBVaW50OEFycmF5KG4uaW5zdC5leHBvcnRzLm1lbW9yeS5idWZmZXIpO2lmKG4uZmRzW2xdIT1udWxsKXtsZXQgdT1uZXcgVGV4dERlY29kZXIoInV0Zi04IikuZGVjb2RlKGQuc2xpY2UocixyK2EpKSxnPW5ldyBUZXh0RGVjb2RlcigidXRmLTgiKS5kZWNvZGUoZC5zbGljZShjLGMrZikpO3JldHVybiBuLmZkc1tsXS5wYXRoX3N5bWxpbmsodSxnKX1lbHNlIHJldHVybiA4fSxwYXRoX3VubGlua19maWxlKHIsYSxsKXtsZXQgYz1uZXcgVWludDhBcnJheShuLmluc3QuZXhwb3J0cy5tZW1vcnkuYnVmZmVyKTtpZihuLmZkc1tyXSE9bnVsbCl7bGV0IGY9bmV3IFRleHREZWNvZGVyKCJ1dGYtOCIpLmRlY29kZShjLnNsaWNlKGEsYStsKSk7cmV0dXJuIG4uZmRzW3JdLnBhdGhfdW5saW5rX2ZpbGUoZil9ZWxzZSByZXR1cm4gOH0scG9sbF9vbmVvZmYocixhLGwpe3Rocm93ImFzeW5jIGlvIG5vdCBzdXBwb3J0ZWQifSxwcm9jX2V4aXQocil7dGhyb3cgbmV3IEF0KHIpfSxwcm9jX3JhaXNlKHIpe3Rocm93InJhaXNlZCBzaWduYWwgIityfSxzY2hlZF95aWVsZCgpe30scmFuZG9tX2dldChyLGEpe2xldCBsPW5ldyBVaW50OEFycmF5KG4uaW5zdC5leHBvcnRzLm1lbW9yeS5idWZmZXIpO2ZvcihsZXQgYz0wO2M8YTtjKyspbFtyK2NdPU1hdGgucmFuZG9tKCkqMjU2fDB9LHNvY2tfcmVjdihyLGEsbCl7dGhyb3cic29ja2V0cyBub3Qgc3VwcG9ydGVkIn0sc29ja19zZW5kKHIsYSxsKXt0aHJvdyJzb2NrZXRzIG5vdCBzdXBwb3J0ZWQifSxzb2NrX3NodXRkb3duKHIsYSl7dGhyb3cic29ja2V0cyBub3Qgc3VwcG9ydGVkIn0sc29ja19hY2NlcHQocixhKXt0aHJvdyJzb2NrZXRzIG5vdCBzdXBwb3J0ZWQifX19fTt2YXIgZXQ9Y2xhc3N7ZmRfYWR2aXNlKHQsZSxzKXtyZXR1cm4gNTh9ZmRfYWxsb2NhdGUodCxlKXtyZXR1cm4gNTh9ZmRfY2xvc2UoKXtyZXR1cm4gMH1mZF9kYXRhc3luYygpe3JldHVybiA1OH1mZF9mZHN0YXRfZ2V0KCl7cmV0dXJue3JldDo1OCxmZHN0YXQ6bnVsbH19ZmRfZmRzdGF0X3NldF9mbGFncyh0KXtyZXR1cm4gNTh9ZmRfZmRzdGF0X3NldF9yaWdodHModCxlKXtyZXR1cm4gNTh9ZmRfZmlsZXN0YXRfZ2V0KCl7cmV0dXJue3JldDo1OCxmaWxlc3RhdDpudWxsfX1mZF9maWxlc3RhdF9zZXRfc2l6ZSh0KXtyZXR1cm4gNTh9ZmRfZmlsZXN0YXRfc2V0X3RpbWVzKHQsZSxzKXtyZXR1cm4gNTh9ZmRfcHJlYWQodCxlLHMpe3JldHVybntyZXQ6NTgsbnJlYWQ6MH19ZmRfcHJlc3RhdF9nZXQoKXtyZXR1cm57cmV0OjU4LHByZXN0YXQ6bnVsbH19ZmRfcHJlc3RhdF9kaXJfbmFtZSgpe3JldHVybntyZXQ6NTgscHJlc3RhdF9kaXJfbmFtZTpudWxsfX1mZF9wd3JpdGUodCxlLHMpe3JldHVybntyZXQ6NTgsbndyaXR0ZW46MH19ZmRfcmVhZCh0LGUpe3JldHVybntyZXQ6NTgsbnJlYWQ6MH19ZmRfcmVhZGRpcl9zaW5nbGUodCl7cmV0dXJue3JldDo1OCxkaXJlbnQ6bnVsbH19ZmRfc2Vlayh0LGUpe3JldHVybntyZXQ6NTgsb2Zmc2V0OjBufX1mZF9zeW5jKCl7cmV0dXJuIDB9ZmRfdGVsbCgpe3JldHVybntyZXQ6NTgsb2Zmc2V0OjBufX1mZF93cml0ZSh0LGUpe3JldHVybntyZXQ6NTgsbndyaXR0ZW46MH19cGF0aF9jcmVhdGVfZGlyZWN0b3J5KHQpe3JldHVybiA1OH1wYXRoX2ZpbGVzdGF0X2dldCh0LGUpe3JldHVybntyZXQ6NTgsZmlsZXN0YXQ6bnVsbH19cGF0aF9maWxlc3RhdF9zZXRfdGltZXModCxlLHMsaSxuKXtyZXR1cm4gNTh9cGF0aF9saW5rKHQsZSxzLGkpe3JldHVybiA1OH1wYXRoX29wZW4odCxlLHMsaSxuLHIpe3JldHVybntyZXQ6NTgsZmRfb2JqOm51bGx9fXBhdGhfcmVhZGxpbmsodCl7cmV0dXJue3JldDo1OCxkYXRhOm51bGx9fXBhdGhfcmVtb3ZlX2RpcmVjdG9yeSh0KXtyZXR1cm4gNTh9cGF0aF9yZW5hbWUodCxlLHMpe3JldHVybiA1OH1wYXRoX3N5bWxpbmsodCxlKXtyZXR1cm4gNTh9cGF0aF91bmxpbmtfZmlsZSh0KXtyZXR1cm4gNTh9fTt2YXIgSz1jbGFzcyBleHRlbmRzIGV0e2ZkX2Zkc3RhdF9nZXQoKXtyZXR1cm57cmV0OjAsZmRzdGF0Om5ldyBPdChXdCwwKX19ZmRfcmVhZCh0LGUpe2xldCBzPTA7Zm9yKGxldCBpIG9mIGUpaWYodGhpcy5maWxlX3Bvczx0aGlzLmZpbGUuZGF0YS5ieXRlTGVuZ3RoKXtsZXQgbj10aGlzLmZpbGUuZGF0YS5zbGljZShOdW1iZXIodGhpcy5maWxlX3BvcyksTnVtYmVyKHRoaXMuZmlsZV9wb3MrQmlnSW50KGkuYnVmX2xlbikpKTt0LnNldChuLGkuYnVmKSx0aGlzLmZpbGVfcG9zKz1CaWdJbnQobi5sZW5ndGgpLHMrPW4ubGVuZ3RofWVsc2UgYnJlYWs7cmV0dXJue3JldDowLG5yZWFkOnN9fWZkX3ByZWFkKHQsZSxzKXtsZXQgaT0wO2ZvcihsZXQgbiBvZiBlKWlmKHM8dGhpcy5maWxlLmRhdGEuYnl0ZUxlbmd0aCl7bGV0IHI9dGhpcy5maWxlLmRhdGEuc2xpY2UoTnVtYmVyKHMpLE51bWJlcihzK0JpZ0ludChuLmJ1Zl9sZW4pKSk7dC5zZXQocixuLmJ1Zikscys9QmlnSW50KHIubGVuZ3RoKSxpKz1yLmxlbmd0aH1lbHNlIGJyZWFrO3JldHVybntyZXQ6MCxucmVhZDppfX1mZF9zZWVrKHQsZSl7bGV0IHM7c3dpdGNoKGUpe2Nhc2UgaWU6cz10O2JyZWFrO2Nhc2Ugb2U6cz10aGlzLmZpbGVfcG9zK3Q7YnJlYWs7Y2FzZSBHdDpzPUJpZ0ludCh0aGlzLmZpbGUuZGF0YS5ieXRlTGVuZ3RoKSt0O2JyZWFrO2RlZmF1bHQ6cmV0dXJue3JldDoyOCxvZmZzZXQ6MG59fXJldHVybiBzPDA/e3JldDoyOCxvZmZzZXQ6MG59Oih0aGlzLmZpbGVfcG9zPXMse3JldDowLG9mZnNldDp0aGlzLmZpbGVfcG9zfSl9ZmRfdGVsbCgpe3JldHVybntyZXQ6MCxvZmZzZXQ6dGhpcy5maWxlX3Bvc319ZmRfd3JpdGUodCxlKXtsZXQgcz0wO2lmKHRoaXMuZmlsZS5yZWFkb25seSlyZXR1cm57cmV0OjgsbndyaXR0ZW46c307Zm9yKGxldCBpIG9mIGUpe2xldCBuPXQuc2xpY2UoaS5idWYsaS5idWYraS5idWZfbGVuKTtpZih0aGlzLmZpbGVfcG9zK0JpZ0ludChuLmJ5dGVMZW5ndGgpPnRoaXMuZmlsZS5zaXplKXtsZXQgcj10aGlzLmZpbGUuZGF0YTt0aGlzLmZpbGUuZGF0YT1uZXcgVWludDhBcnJheShOdW1iZXIodGhpcy5maWxlX3BvcytCaWdJbnQobi5ieXRlTGVuZ3RoKSkpLHRoaXMuZmlsZS5kYXRhLnNldChyKX10aGlzLmZpbGUuZGF0YS5zZXQobi5zbGljZSgwLE51bWJlcih0aGlzLmZpbGUuc2l6ZS10aGlzLmZpbGVfcG9zKSksTnVtYmVyKHRoaXMuZmlsZV9wb3MpKSx0aGlzLmZpbGVfcG9zKz1CaWdJbnQobi5ieXRlTGVuZ3RoKSxzKz1pLmJ1Zl9sZW59cmV0dXJue3JldDowLG53cml0dGVuOnN9fWZkX3B3cml0ZSh0LGUscyl7bGV0IGk9MDtpZih0aGlzLmZpbGUucmVhZG9ubHkpcmV0dXJue3JldDo4LG53cml0dGVuOml9O2ZvcihsZXQgbiBvZiBlKXtsZXQgcj10LnNsaWNlKG4uYnVmLG4uYnVmK24uYnVmX2xlbik7aWYocytCaWdJbnQoci5ieXRlTGVuZ3RoKT50aGlzLmZpbGUuc2l6ZSl7bGV0IGE9dGhpcy5maWxlLmRhdGE7dGhpcy5maWxlLmRhdGE9bmV3IFVpbnQ4QXJyYXkoTnVtYmVyKHMrQmlnSW50KHIuYnl0ZUxlbmd0aCkpKSx0aGlzLmZpbGUuZGF0YS5zZXQoYSl9dGhpcy5maWxlLmRhdGEuc2V0KHIuc2xpY2UoMCxOdW1iZXIodGhpcy5maWxlLnNpemUtcykpLE51bWJlcihzKSkscys9QmlnSW50KHIuYnl0ZUxlbmd0aCksaSs9bi5idWZfbGVufXJldHVybntyZXQ6MCxud3JpdHRlbjppfX1mZF9maWxlc3RhdF9nZXQoKXtyZXR1cm57cmV0OjAsZmlsZXN0YXQ6dGhpcy5maWxlLnN0YXQoKX19Y29uc3RydWN0b3IodCl7c3VwZXIoKSx0aGlzLmZpbGVfcG9zPTBuLHRoaXMuZmlsZT10fX07dmFyIHN0PWNsYXNze29wZW4odCl7bGV0IGU9bmV3IEsodGhpcyk7cmV0dXJuIHQmYWUmJmUuZmRfc2VlaygwbixHdCksZX1nZXQgc2l6ZSgpe3JldHVybiBCaWdJbnQodGhpcy5kYXRhLmJ5dGVMZW5ndGgpfXN0YXQoKXtyZXR1cm4gbmV3IE50KFd0LHRoaXMuc2l6ZSl9dHJ1bmNhdGUoKXtyZXR1cm4gdGhpcy5yZWFkb25seT82MzoodGhpcy5kYXRhPW5ldyBVaW50OEFycmF5KFtdKSwwKX1jb25zdHJ1Y3Rvcih0LGUpe3RoaXMuZGF0YT1uZXcgVWludDhBcnJheSh0KSx0aGlzLnJlYWRvbmx5PSEhZT8ucmVhZG9ubHl9fTt2YXIgaHQ9Y2xhc3MgZXh0ZW5kcyBldHsjdDtjb25zdHJ1Y3Rvcih0KXtzdXBlcigpLHRoaXMuI3Q9dH1mZF93cml0ZSh0LGUpe2xldCBzPTAsaT1uZXcgVGV4dERlY29kZXIsbj1lLnJlZHVjZSgocixhLGwsYyk9PntzKz1hLmJ1Zl9sZW47bGV0IGY9dC5zbGljZShhLmJ1ZixhLmJ1ZithLmJ1Zl9sZW4pO3JldHVybiByK2kuZGVjb2RlKGYse3N0cmVhbTpsIT09Yy5sZW5ndGgtMX0pfSwiIik7cmV0dXJuIGNvbnNvbGVbdGhpcy4jdF0obikse3JldDowLG53cml0dGVuOnN9fX07YXN5bmMgZnVuY3Rpb24gdWUobyx0KXtsZXQgZT1bXSxzPVtdLGk9dD9bbmV3IGh0KCJsb2ciKSxuZXcgaHQoImxvZyIpLG5ldyBodCgiZXJyb3IiKV06W25ldyBLKG5ldyBzdChbXSkpLG5ldyBLKG5ldyBzdChbXSkpLG5ldyBLKG5ldyBzdChbXSkpXSxuPW5ldyAkdChlLHMsaSk7cmV0dXJue2FzeW5jIGltcG9ydE9iamVjdCgpe3JldHVybiBuLndhc2lJbXBvcnR9LGFzeW5jIGNsb3NlKCl7fSxhc3luYyBpbml0aWFsaXplKHIpe2xldCBhPXIuZXhwb3J0cy5tZW1vcnk7aWYoIWEpdGhyb3cgbmV3IEVycm9yKCJUaGUgbW9kdWxlIGhhcyB0byBleHBvcnQgYSBkZWZhdWx0IG1lbW9yeS4iKTtpZihyLmV4cG9ydHMuX2luaXRpYWxpemUpe2xldCBsPXIuZXhwb3J0cy5faW5pdGlhbGl6ZTtuLmluaXRpYWxpemU/bi5pbml0aWFsaXplKHtleHBvcnRzOnttZW1vcnk6YSxfaW5pdGlhbGl6ZTooKT0+e2woKX19fSk6bCgpfWVsc2Ugbi5zdGFydCh7ZXhwb3J0czp7bWVtb3J5OmEsX3N0YXJ0OigpPT57fX19KX19fXZhciBQZT1YZShPZSgpLDEpO3ZhciBwdD1vPT57aWYodHlwZW9mIG8hPSJzdHJpbmciKXRocm93IG5ldyBUeXBlRXJyb3IoImludmFsaWQgcGF0dGVybiIpO2lmKG8ubGVuZ3RoPjY1NTM2KXRocm93IG5ldyBUeXBlRXJyb3IoInBhdHRlcm4gaXMgdG9vIGxvbmciKX07dmFyIGhzPXsiWzphbG51bTpdIjpbIlxccHtMfVxccHtObH1cXHB7TmR9IiwhMF0sIls6YWxwaGE6XSI6WyJcXHB7TH1cXHB7Tmx9IiwhMF0sIls6YXNjaWk6XSI6WyJcXHgwMC1cXHg3ZiIsITFdLCJbOmJsYW5rOl0iOlsiXFxwe1pzfVxcdCIsITBdLCJbOmNudHJsOl0iOlsiXFxwe0NjfSIsITBdLCJbOmRpZ2l0Ol0iOlsiXFxwe05kfSIsITBdLCJbOmdyYXBoOl0iOlsiXFxwe1p9XFxwe0N9IiwhMCwhMF0sIls6bG93ZXI6XSI6WyJcXHB7TGx9IiwhMF0sIls6cHJpbnQ6XSI6WyJcXHB7Q30iLCEwXSwiWzpwdW5jdDpdIjpbIlxccHtQfSIsITBdLCJbOnNwYWNlOl0iOlsiXFxwe1p9XFx0XFxyXFxuXFx2XFxmIiwhMF0sIls6dXBwZXI6XSI6WyJcXHB7THV9IiwhMF0sIls6d29yZDpdIjpbIlxccHtMfVxccHtObH1cXHB7TmR9XFxwe1BjfSIsITBdLCJbOnhkaWdpdDpdIjpbIkEtRmEtZjAtOSIsITFdfSxndD1vPT5vLnJlcGxhY2UoL1tbXF1cXC1dL2csIlxcJCYiKSxkcz1vPT5vLnJlcGxhY2UoL1stW1xde30oKSorPy4sXFxeJHwjXHNdL2csIlxcJCYiKSxOZT1vPT5vLmpvaW4oIiIpLFRlPShvLHQpPT57bGV0IGU9dDtpZihvLmNoYXJBdChlKSE9PSJbIil0aHJvdyBuZXcgRXJyb3IoIm5vdCBpbiBhIGJyYWNlIGV4cHJlc3Npb24iKTtsZXQgcz1bXSxpPVtdLG49ZSsxLHI9ITEsYT0hMSxsPSExLGM9ITEsZj1lLGQ9IiI7dDpmb3IoO248by5sZW5ndGg7KXtsZXQgaD1vLmNoYXJBdChuKTtpZigoaD09PSIhInx8aD09PSJeIikmJm49PT1lKzEpe2M9ITAsbisrO2NvbnRpbnVlfWlmKGg9PT0iXSImJnImJiFsKXtmPW4rMTticmVha31pZihyPSEwLGg9PT0iXFwiJiYhbCl7bD0hMCxuKys7Y29udGludWV9aWYoaD09PSJbIiYmIWwpe2ZvcihsZXRbXyxbbSxBLE5dXW9mIE9iamVjdC5lbnRyaWVzKGhzKSlpZihvLnN0YXJ0c1dpdGgoXyxuKSl7aWYoZClyZXR1cm5bIiQuIiwhMSxvLmxlbmd0aC1lLCEwXTtuKz1fLmxlbmd0aCxOP2kucHVzaChtKTpzLnB1c2gobSksYT1hfHxBO2NvbnRpbnVlIHR9fWlmKGw9ITEsZCl7aD5kP3MucHVzaChndChkKSsiLSIrZ3QoaCkpOmg9PT1kJiZzLnB1c2goZ3QoaCkpLGQ9IiIsbisrO2NvbnRpbnVlfWlmKG8uc3RhcnRzV2l0aCgiLV0iLG4rMSkpe3MucHVzaChndChoKyItIikpLG4rPTI7Y29udGludWV9aWYoby5zdGFydHNXaXRoKCItIixuKzEpKXtkPWgsbis9Mjtjb250aW51ZX1zLnB1c2goZ3QoaCkpLG4rK31pZihmPG4pcmV0dXJuWyIiLCExLDAsITFdO2lmKCFzLmxlbmd0aCYmIWkubGVuZ3RoKXJldHVyblsiJC4iLCExLG8ubGVuZ3RoLWUsITBdO2lmKGkubGVuZ3RoPT09MCYmcy5sZW5ndGg9PT0xJiYvXlxcPy4kLy50ZXN0KHNbMF0pJiYhYyl7bGV0IGg9c1swXS5sZW5ndGg9PT0yP3NbMF0uc2xpY2UoLTEpOnNbMF07cmV0dXJuW2RzKGgpLCExLGYtZSwhMV19bGV0IHU9IlsiKyhjPyJeIjoiIikrTmUocykrIl0iLGc9IlsiKyhjPyIiOiJeIikrTmUoaSkrIl0iO3JldHVybltzLmxlbmd0aCYmaS5sZW5ndGg/IigiK3UrInwiK2crIikiOnMubGVuZ3RoP3U6ZyxhLGYtZSwhMF19O3ZhciBYPShvLHt3aW5kb3dzUGF0aHNOb0VzY2FwZTp0PSExfT17fSk9PnQ/by5yZXBsYWNlKC9cWyhbXlwvXFxdKVxdL2csIiQxIik6by5yZXBsYWNlKC8oKD8hXFwpLnxeKVxbKFteXC9cXF0pXF0vZywiJDEkMiIpLnJlcGxhY2UoL1xcKFteXC9dKS9nLCIkMSIpO3ZhciBwcz1uZXcgU2V0KFsiISIsIj8iLCIrIiwiKiIsIkAiXSksQWU9bz0+cHMuaGFzKG8pLGdzPSIoPyEoPzpefC8pXFwuXFwuPyg/OiR8LykpIixTdD0iKD8hXFwuKSIsX3M9bmV3IFNldChbIlsiLCIuIl0pLGJzPW5ldyBTZXQoWyIuLiIsIi4iXSksbXM9bmV3IFNldCgiKCkuKnt9Kz9bXV4kXFwhIiksd3M9bz0+by5yZXBsYWNlKC9bLVtcXXt9KCkqKz8uLFxcXiR8I1xzXS9nLCJcXCQmIiksWXQ9IlteL10iLFNlPVl0KyIqPyIsSWU9WXQrIis/IixTLEksVyx4LFQscSxudCxaLEgscnQsX3QsTHQsTGUsYXQsSXQsYnQsenQsQ3QsQ2Usdj1jbGFzc3tjb25zdHJ1Y3Rvcih0LGUscz17fSl7Tyh0aGlzLEx0KTtPKHRoaXMsYnQpO2VlKHRoaXMsInR5cGUiKTtPKHRoaXMsUyx2b2lkIDApO08odGhpcyxJLHZvaWQgMCk7Tyh0aGlzLFcsITEpO08odGhpcyx4LFtdKTtPKHRoaXMsVCx2b2lkIDApO08odGhpcyxxLHZvaWQgMCk7Tyh0aGlzLG50LHZvaWQgMCk7Tyh0aGlzLFosITEpO08odGhpcyxILHZvaWQgMCk7Tyh0aGlzLHJ0LHZvaWQgMCk7Tyh0aGlzLF90LCExKTt0aGlzLnR5cGU9dCx0JiZSKHRoaXMsSSwhMCksUih0aGlzLFQsZSksUih0aGlzLFMscCh0aGlzLFQpP3AocCh0aGlzLFQpLFMpOnRoaXMpLFIodGhpcyxILHAodGhpcyxTKT09PXRoaXM/czpwKHAodGhpcyxTKSxIKSksUih0aGlzLG50LHAodGhpcyxTKT09PXRoaXM/W106cChwKHRoaXMsUyksbnQpKSx0PT09IiEiJiYhcChwKHRoaXMsUyksWikmJnAodGhpcyxudCkucHVzaCh0aGlzKSxSKHRoaXMscSxwKHRoaXMsVCk/cChwKHRoaXMsVCkseCkubGVuZ3RoOjApfWdldCBoYXNNYWdpYygpe2lmKHAodGhpcyxJKSE9PXZvaWQgMClyZXR1cm4gcCh0aGlzLEkpO2ZvcihsZXQgdCBvZiBwKHRoaXMseCkpaWYodHlwZW9mIHQhPSJzdHJpbmciJiYodC50eXBlfHx0Lmhhc01hZ2ljKSlyZXR1cm4gUih0aGlzLEksITApO3JldHVybiBwKHRoaXMsSSl9dG9TdHJpbmcoKXtyZXR1cm4gcCh0aGlzLHJ0KSE9PXZvaWQgMD9wKHRoaXMscnQpOnRoaXMudHlwZT9SKHRoaXMscnQsdGhpcy50eXBlKyIoIitwKHRoaXMseCkubWFwKHQ9PlN0cmluZyh0KSkuam9pbigifCIpKyIpIik6Uih0aGlzLHJ0LHAodGhpcyx4KS5tYXAodD0+U3RyaW5nKHQpKS5qb2luKCIiKSl9cHVzaCguLi50KXtmb3IobGV0IGUgb2YgdClpZihlIT09IiIpe2lmKHR5cGVvZiBlIT0ic3RyaW5nIiYmIShlIGluc3RhbmNlb2YgdiYmcChlLFQpPT09dGhpcykpdGhyb3cgbmV3IEVycm9yKCJpbnZhbGlkIHBhcnQ6ICIrZSk7cCh0aGlzLHgpLnB1c2goZSl9fXRvSlNPTigpe2xldCB0PXRoaXMudHlwZT09PW51bGw/cCh0aGlzLHgpLnNsaWNlKCkubWFwKGU9PnR5cGVvZiBlPT0ic3RyaW5nIj9lOmUudG9KU09OKCkpOlt0aGlzLnR5cGUsLi4ucCh0aGlzLHgpLm1hcChlPT5lLnRvSlNPTigpKV07cmV0dXJuIHRoaXMuaXNTdGFydCgpJiYhdGhpcy50eXBlJiZ0LnVuc2hpZnQoW10pLHRoaXMuaXNFbmQoKSYmKHRoaXM9PT1wKHRoaXMsUyl8fHAocCh0aGlzLFMpLFopJiZwKHRoaXMsVCk/LnR5cGU9PT0iISIpJiZ0LnB1c2goe30pLHR9aXNTdGFydCgpe2lmKHAodGhpcyxTKT09PXRoaXMpcmV0dXJuITA7aWYoIXAodGhpcyxUKT8uaXNTdGFydCgpKXJldHVybiExO2lmKHAodGhpcyxxKT09PTApcmV0dXJuITA7bGV0IHQ9cCh0aGlzLFQpO2ZvcihsZXQgZT0wO2U8cCh0aGlzLHEpO2UrKyl7bGV0IHM9cCh0LHgpW2VdO2lmKCEocyBpbnN0YW5jZW9mIHYmJnMudHlwZT09PSIhIikpcmV0dXJuITF9cmV0dXJuITB9aXNFbmQoKXtpZihwKHRoaXMsUyk9PT10aGlzfHxwKHRoaXMsVCk/LnR5cGU9PT0iISIpcmV0dXJuITA7aWYoIXAodGhpcyxUKT8uaXNFbmQoKSlyZXR1cm4hMTtpZighdGhpcy50eXBlKXJldHVybiBwKHRoaXMsVCk/LmlzRW5kKCk7bGV0IHQ9cCh0aGlzLFQpP3AocCh0aGlzLFQpLHgpLmxlbmd0aDowO3JldHVybiBwKHRoaXMscSk9PT10LTF9Y29weUluKHQpe3R5cGVvZiB0PT0ic3RyaW5nIj90aGlzLnB1c2godCk6dGhpcy5wdXNoKHQuY2xvbmUodGhpcykpfWNsb25lKHQpe2xldCBlPW5ldyB2KHRoaXMudHlwZSx0KTtmb3IobGV0IHMgb2YgcCh0aGlzLHgpKWUuY29weUluKHMpO3JldHVybiBlfXN0YXRpYyBmcm9tR2xvYih0LGU9e30pe3ZhciBpO2xldCBzPW5ldyB2KG51bGwsdm9pZCAwLGUpO3JldHVybiAkKGk9dixhdCxJdCkuY2FsbChpLHQscywwLGUpLHN9dG9NTVBhdHRlcm4oKXtpZih0aGlzIT09cCh0aGlzLFMpKXJldHVybiBwKHRoaXMsUykudG9NTVBhdHRlcm4oKTtsZXQgdD10aGlzLnRvU3RyaW5nKCksW2UscyxpLG5dPXRoaXMudG9SZWdFeHBTb3VyY2UoKTtpZighKGl8fHAodGhpcyxJKXx8cCh0aGlzLEgpLm5vY2FzZSYmIXAodGhpcyxIKS5ub2Nhc2VNYWdpY09ubHkmJnQudG9VcHBlckNhc2UoKSE9PXQudG9Mb3dlckNhc2UoKSkpcmV0dXJuIHM7bGV0IGE9KHAodGhpcyxIKS5ub2Nhc2U/ImkiOiIiKSsobj8idSI6IiIpO3JldHVybiBPYmplY3QuYXNzaWduKG5ldyBSZWdFeHAoYF4ke2V9JGAsYSkse19zcmM6ZSxfZ2xvYjp0fSl9dG9SZWdFeHBTb3VyY2UodCl7bGV0IGU9dD8/ISFwKHRoaXMsSCkuZG90O2lmKHAodGhpcyxTKT09PXRoaXMmJiQodGhpcyxMdCxMZSkuY2FsbCh0aGlzKSwhdGhpcy50eXBlKXtsZXQgbD10aGlzLmlzU3RhcnQoKSYmdGhpcy5pc0VuZCgpLGM9cCh0aGlzLHgpLm1hcChnPT57dmFyIEE7bGV0W2IsaCxfLG1dPXR5cGVvZiBnPT0ic3RyaW5nIj8kKEE9dixDdCxDZSkuY2FsbChBLGcscCh0aGlzLEkpLGwpOmcudG9SZWdFeHBTb3VyY2UodCk7cmV0dXJuIFIodGhpcyxJLHAodGhpcyxJKXx8XyksUih0aGlzLFcscCh0aGlzLFcpfHxtKSxifSkuam9pbigiIiksZj0iIjtpZih0aGlzLmlzU3RhcnQoKSYmdHlwZW9mIHAodGhpcyx4KVswXT09InN0cmluZyImJiEocCh0aGlzLHgpLmxlbmd0aD09PTEmJmJzLmhhcyhwKHRoaXMseClbMF0pKSl7bGV0IGI9X3MsaD1lJiZiLmhhcyhjLmNoYXJBdCgwKSl8fGMuc3RhcnRzV2l0aCgiXFwuIikmJmIuaGFzKGMuY2hhckF0KDIpKXx8Yy5zdGFydHNXaXRoKCJcXC5cXC4iKSYmYi5oYXMoYy5jaGFyQXQoNCkpLF89IWUmJiF0JiZiLmhhcyhjLmNoYXJBdCgwKSk7Zj1oP2dzOl8/U3Q6IiJ9bGV0IGQ9IiI7cmV0dXJuIHRoaXMuaXNFbmQoKSYmcChwKHRoaXMsUyksWikmJnAodGhpcyxUKT8udHlwZT09PSIhIiYmKGQ9Iig/OiR8XFwvKSIpLFtmK2MrZCxYKGMpLFIodGhpcyxJLCEhcCh0aGlzLEkpKSxwKHRoaXMsVyldfWxldCBzPXRoaXMudHlwZT09PSIqInx8dGhpcy50eXBlPT09IisiLGk9dGhpcy50eXBlPT09IiEiPyIoPzooPyEoPzoiOiIoPzoiLG49JCh0aGlzLGJ0LHp0KS5jYWxsKHRoaXMsZSk7aWYodGhpcy5pc1N0YXJ0KCkmJnRoaXMuaXNFbmQoKSYmIW4mJnRoaXMudHlwZSE9PSIhIil7bGV0IGw9dGhpcy50b1N0cmluZygpO3JldHVybiBSKHRoaXMseCxbbF0pLHRoaXMudHlwZT1udWxsLFIodGhpcyxJLHZvaWQgMCksW2wsWCh0aGlzLnRvU3RyaW5nKCkpLCExLCExXX1sZXQgcj0hc3x8dHx8ZXx8IVN0PyIiOiQodGhpcyxidCx6dCkuY2FsbCh0aGlzLCEwKTtyPT09biYmKHI9IiIpLHImJihuPWAoPzoke259KSg/OiR7cn0pKj9gKTtsZXQgYT0iIjtpZih0aGlzLnR5cGU9PT0iISImJnAodGhpcyxfdCkpYT0odGhpcy5pc1N0YXJ0KCkmJiFlP1N0OiIiKStJZTtlbHNle2xldCBsPXRoaXMudHlwZT09PSIhIj8iKSkiKyh0aGlzLmlzU3RhcnQoKSYmIWUmJiF0P1N0OiIiKStTZSsiKSI6dGhpcy50eXBlPT09IkAiPyIpIjp0aGlzLnR5cGU9PT0iPyI/Iik/Ijp0aGlzLnR5cGU9PT0iKyImJnI/IikiOnRoaXMudHlwZT09PSIqIiYmcj8iKT8iOmApJHt0aGlzLnR5cGV9YDthPWkrbitsfXJldHVyblthLFgobiksUih0aGlzLEksISFwKHRoaXMsSSkpLHAodGhpcyxXKV19fSxKPXY7Uz1uZXcgV2Vha01hcCxJPW5ldyBXZWFrTWFwLFc9bmV3IFdlYWtNYXAseD1uZXcgV2Vha01hcCxUPW5ldyBXZWFrTWFwLHE9bmV3IFdlYWtNYXAsbnQ9bmV3IFdlYWtNYXAsWj1uZXcgV2Vha01hcCxIPW5ldyBXZWFrTWFwLHJ0PW5ldyBXZWFrTWFwLF90PW5ldyBXZWFrTWFwLEx0PW5ldyBXZWFrU2V0LExlPWZ1bmN0aW9uKCl7aWYodGhpcyE9PXAodGhpcyxTKSl0aHJvdyBuZXcgRXJyb3IoInNob3VsZCBvbmx5IGNhbGwgb24gcm9vdCIpO2lmKHAodGhpcyxaKSlyZXR1cm4gdGhpczt0aGlzLnRvU3RyaW5nKCksUih0aGlzLFosITApO2xldCB0O2Zvcig7dD1wKHRoaXMsbnQpLnBvcCgpOyl7aWYodC50eXBlIT09IiEiKWNvbnRpbnVlO2xldCBlPXQscz1wKGUsVCk7Zm9yKDtzOyl7Zm9yKGxldCBpPXAoZSxxKSsxOyFzLnR5cGUmJmk8cChzLHgpLmxlbmd0aDtpKyspZm9yKGxldCBuIG9mIHAodCx4KSl7aWYodHlwZW9mIG49PSJzdHJpbmciKXRocm93IG5ldyBFcnJvcigic3RyaW5nIHBhcnQgaW4gZXh0Z2xvYiBBU1Q/PyIpO24uY29weUluKHAocyx4KVtpXSl9ZT1zLHM9cChlLFQpfX1yZXR1cm4gdGhpc30sYXQ9bmV3IFdlYWtTZXQsSXQ9ZnVuY3Rpb24odCxlLHMsaSl7dmFyIGcsYjtsZXQgbj0hMSxyPSExLGE9LTEsbD0hMTtpZihlLnR5cGU9PT1udWxsKXtsZXQgaD1zLF89IiI7Zm9yKDtoPHQubGVuZ3RoOyl7bGV0IG09dC5jaGFyQXQoaCsrKTtpZihufHxtPT09IlxcIil7bj0hbixfKz1tO2NvbnRpbnVlfWlmKHIpe2g9PT1hKzE/KG09PT0iXiJ8fG09PT0iISIpJiYobD0hMCk6bT09PSJdIiYmIShoPT09YSsyJiZsKSYmKHI9ITEpLF8rPW07Y29udGludWV9ZWxzZSBpZihtPT09IlsiKXtyPSEwLGE9aCxsPSExLF8rPW07Y29udGludWV9aWYoIWkubm9leHQmJkFlKG0pJiZ0LmNoYXJBdChoKT09PSIoIil7ZS5wdXNoKF8pLF89IiI7bGV0IEE9bmV3IHYobSxlKTtoPSQoZz12LGF0LEl0KS5jYWxsKGcsdCxBLGgsaSksZS5wdXNoKEEpO2NvbnRpbnVlfV8rPW19cmV0dXJuIGUucHVzaChfKSxofWxldCBjPXMrMSxmPW5ldyB2KG51bGwsZSksZD1bXSx1PSIiO2Zvcig7Yzx0Lmxlbmd0aDspe2xldCBoPXQuY2hhckF0KGMrKyk7aWYobnx8aD09PSJcXCIpe249IW4sdSs9aDtjb250aW51ZX1pZihyKXtjPT09YSsxPyhoPT09Il4ifHxoPT09IiEiKSYmKGw9ITApOmg9PT0iXSImJiEoYz09PWErMiYmbCkmJihyPSExKSx1Kz1oO2NvbnRpbnVlfWVsc2UgaWYoaD09PSJbIil7cj0hMCxhPWMsbD0hMSx1Kz1oO2NvbnRpbnVlfWlmKEFlKGgpJiZ0LmNoYXJBdChjKT09PSIoIil7Zi5wdXNoKHUpLHU9IiI7bGV0IF89bmV3IHYoaCxmKTtmLnB1c2goXyksYz0kKGI9dixhdCxJdCkuY2FsbChiLHQsXyxjLGkpO2NvbnRpbnVlfWlmKGg9PT0ifCIpe2YucHVzaCh1KSx1PSIiLGQucHVzaChmKSxmPW5ldyB2KG51bGwsZSk7Y29udGludWV9aWYoaD09PSIpIilyZXR1cm4gdT09PSIiJiZwKGUseCkubGVuZ3RoPT09MCYmUihlLF90LCEwKSxmLnB1c2godSksdT0iIixlLnB1c2goLi4uZCxmKSxjO3UrPWh9cmV0dXJuIGUudHlwZT1udWxsLFIoZSxJLHZvaWQgMCksUihlLHgsW3Quc3Vic3RyaW5nKHMtMSldKSxjfSxidD1uZXcgV2Vha1NldCx6dD1mdW5jdGlvbih0KXtyZXR1cm4gcCh0aGlzLHgpLm1hcChlPT57aWYodHlwZW9mIGU9PSJzdHJpbmciKXRocm93IG5ldyBFcnJvcigic3RyaW5nIHR5cGUgaW4gZXh0Z2xvYiBhc3Q/PyIpO2xldFtzLGksbixyXT1lLnRvUmVnRXhwU291cmNlKHQpO3JldHVybiBSKHRoaXMsVyxwKHRoaXMsVyl8fHIpLHN9KS5maWx0ZXIoZT0+ISh0aGlzLmlzU3RhcnQoKSYmdGhpcy5pc0VuZCgpKXx8ISFlKS5qb2luKCJ8Iil9LEN0PW5ldyBXZWFrU2V0LENlPWZ1bmN0aW9uKHQsZSxzPSExKXtsZXQgaT0hMSxuPSIiLHI9ITE7Zm9yKGxldCBhPTA7YTx0Lmxlbmd0aDthKyspe2xldCBsPXQuY2hhckF0KGEpO2lmKGkpe2k9ITEsbis9KG1zLmhhcyhsKT8iXFwiOiIiKStsO2NvbnRpbnVlfWlmKGw9PT0iXFwiKXthPT09dC5sZW5ndGgtMT9uKz0iXFxcXCI6aT0hMDtjb250aW51ZX1pZihsPT09IlsiKXtsZXRbYyxmLGQsdV09VGUodCxhKTtpZihkKXtuKz1jLHI9cnx8ZixhKz1kLTEsZT1lfHx1O2NvbnRpbnVlfX1pZihsPT09IioiKXtzJiZ0PT09IioiP24rPUllOm4rPVNlLGU9ITA7Y29udGludWV9aWYobD09PSI/Iil7bis9WXQsZT0hMDtjb250aW51ZX1uKz13cyhsKX1yZXR1cm5bbixYKHQpLCEhZSxyXX0sTyhKLGF0KSxPKEosQ3QpO3ZhciBLdD0obyx7d2luZG93c1BhdGhzTm9Fc2NhcGU6dD0hMX09e30pPT50P28ucmVwbGFjZSgvWz8qKClbXF1dL2csIlskJl0iKTpvLnJlcGxhY2UoL1s/KigpW1xdXFxdL2csIlxcJCYiKTt2YXIgQz0obyx0LGU9e30pPT4ocHQodCksIWUubm9jb21tZW50JiZ0LmNoYXJBdCgwKT09PSIjIj8hMTpuZXcgbHQodCxlKS5tYXRjaChvKSksRXM9L15cKisoW14rQCE/XCpcW1woXSopJC8seXM9bz0+dD0+IXQuc3RhcnRzV2l0aCgiLiIpJiZ0LmVuZHNXaXRoKG8pLFJzPW89PnQ9PnQuZW5kc1dpdGgobykseHM9bz0+KG89by50b0xvd2VyQ2FzZSgpLHQ9PiF0LnN0YXJ0c1dpdGgoIi4iKSYmdC50b0xvd2VyQ2FzZSgpLmVuZHNXaXRoKG8pKSxPcz1vPT4obz1vLnRvTG93ZXJDYXNlKCksdD0+dC50b0xvd2VyQ2FzZSgpLmVuZHNXaXRoKG8pKSxOcz0vXlwqK1wuXCorJC8sVHM9bz0+IW8uc3RhcnRzV2l0aCgiLiIpJiZvLmluY2x1ZGVzKCIuIiksQXM9bz0+byE9PSIuIiYmbyE9PSIuLiImJm8uaW5jbHVkZXMoIi4iKSxTcz0vXlwuXCorJC8sSXM9bz0+byE9PSIuIiYmbyE9PSIuLiImJm8uc3RhcnRzV2l0aCgiLiIpLExzPS9eXCorJC8sQ3M9bz0+by5sZW5ndGghPT0wJiYhby5zdGFydHNXaXRoKCIuIiksRHM9bz0+by5sZW5ndGghPT0wJiZvIT09Ii4iJiZvIT09Ii4uIix2cz0vXlw/KyhbXitAIT9cKlxbXChdKik/JC8sUHM9KFtvLHQ9IiJdKT0+e2xldCBlPVVlKFtvXSk7cmV0dXJuIHQ/KHQ9dC50b0xvd2VyQ2FzZSgpLHM9PmUocykmJnMudG9Mb3dlckNhc2UoKS5lbmRzV2l0aCh0KSk6ZX0sVXM9KFtvLHQ9IiJdKT0+e2xldCBlPWtlKFtvXSk7cmV0dXJuIHQ/KHQ9dC50b0xvd2VyQ2FzZSgpLHM9PmUocykmJnMudG9Mb3dlckNhc2UoKS5lbmRzV2l0aCh0KSk6ZX0sa3M9KFtvLHQ9IiJdKT0+e2xldCBlPWtlKFtvXSk7cmV0dXJuIHQ/cz0+ZShzKSYmcy5lbmRzV2l0aCh0KTplfSxGcz0oW28sdD0iIl0pPT57bGV0IGU9VWUoW29dKTtyZXR1cm4gdD9zPT5lKHMpJiZzLmVuZHNXaXRoKHQpOmV9LFVlPShbb10pPT57bGV0IHQ9by5sZW5ndGg7cmV0dXJuIGU9PmUubGVuZ3RoPT09dCYmIWUuc3RhcnRzV2l0aCgiLiIpfSxrZT0oW29dKT0+e2xldCB0PW8ubGVuZ3RoO3JldHVybiBlPT5lLmxlbmd0aD09PXQmJmUhPT0iLiImJmUhPT0iLi4ifSxGZT10eXBlb2YgcHJvY2Vzcz09Im9iamVjdCImJnByb2Nlc3M/dHlwZW9mIHByb2Nlc3MuZW52PT0ib2JqZWN0IiYmcHJvY2Vzcy5lbnYmJnByb2Nlc3MuZW52Ll9fTUlOSU1BVENIX1RFU1RJTkdfUExBVEZPUk1fX3x8cHJvY2Vzcy5wbGF0Zm9ybToicG9zaXgiLERlPXt3aW4zMjp7c2VwOiJcXCJ9LHBvc2l4OntzZXA6Ii8ifX0sTXM9RmU9PT0id2luMzIiP0RlLndpbjMyLnNlcDpEZS5wb3NpeC5zZXA7Qy5zZXA9TXM7dmFyIGs9U3ltYm9sKCJnbG9ic3RhciAqKiIpO0MuR0xPQlNUQVI9azt2YXIgQnM9IlteL10iLEdzPUJzKyIqPyIsV3M9Iig/Oig/ISg/OlxcL3xeKSg/OlxcLnsxLDJ9KSgkfFxcLykpLikqPyIsSHM9Iig/Oig/ISg/OlxcL3xeKVxcLikuKSo/Iiwkcz0obyx0PXt9KT0+ZT0+QyhlLG8sdCk7Qy5maWx0ZXI9JHM7dmFyIFU9KG8sdD17fSk9Pk9iamVjdC5hc3NpZ24oe30sbyx0KSxWcz1vPT57aWYoIW98fHR5cGVvZiBvIT0ib2JqZWN0Inx8IU9iamVjdC5rZXlzKG8pLmxlbmd0aClyZXR1cm4gQztsZXQgdD1DO3JldHVybiBPYmplY3QuYXNzaWduKChzLGksbj17fSk9PnQocyxpLFUobyxuKSkse01pbmltYXRjaDpjbGFzcyBleHRlbmRzIHQuTWluaW1hdGNoe2NvbnN0cnVjdG9yKGksbj17fSl7c3VwZXIoaSxVKG8sbikpfXN0YXRpYyBkZWZhdWx0cyhpKXtyZXR1cm4gdC5kZWZhdWx0cyhVKG8saSkpLk1pbmltYXRjaH19LEFTVDpjbGFzcyBleHRlbmRzIHQuQVNUe2NvbnN0cnVjdG9yKGksbixyPXt9KXtzdXBlcihpLG4sVShvLHIpKX1zdGF0aWMgZnJvbUdsb2IoaSxuPXt9KXtyZXR1cm4gdC5BU1QuZnJvbUdsb2IoaSxVKG8sbikpfX0sdW5lc2NhcGU6KHMsaT17fSk9PnQudW5lc2NhcGUocyxVKG8saSkpLGVzY2FwZToocyxpPXt9KT0+dC5lc2NhcGUocyxVKG8saSkpLGZpbHRlcjoocyxpPXt9KT0+dC5maWx0ZXIocyxVKG8saSkpLGRlZmF1bHRzOnM9PnQuZGVmYXVsdHMoVShvLHMpKSxtYWtlUmU6KHMsaT17fSk9PnQubWFrZVJlKHMsVShvLGkpKSxicmFjZUV4cGFuZDoocyxpPXt9KT0+dC5icmFjZUV4cGFuZChzLFUobyxpKSksbWF0Y2g6KHMsaSxuPXt9KT0+dC5tYXRjaChzLGksVShvLG4pKSxzZXA6dC5zZXAsR0xPQlNUQVI6a30pfTtDLmRlZmF1bHRzPVZzO3ZhciBNZT0obyx0PXt9KT0+KHB0KG8pLHQubm9icmFjZXx8IS9ceyg/Oig/IVx7KS4pKlx9Ly50ZXN0KG8pP1tvXTooMCxQZS5kZWZhdWx0KShvKSk7Qy5icmFjZUV4cGFuZD1NZTt2YXIganM9KG8sdD17fSk9Pm5ldyBsdChvLHQpLm1ha2VSZSgpO0MubWFrZVJlPWpzO3ZhciB6cz0obyx0LGU9e30pPT57bGV0IHM9bmV3IGx0KHQsZSk7cmV0dXJuIG89by5maWx0ZXIoaT0+cy5tYXRjaChpKSkscy5vcHRpb25zLm5vbnVsbCYmIW8ubGVuZ3RoJiZvLnB1c2godCksb307Qy5tYXRjaD16czt2YXIgdmU9L1s/Kl18WytAIV1cKC4qP1wpfFxbfFxdLyxZcz1vPT5vLnJlcGxhY2UoL1stW1xde30oKSorPy4sXFxeJHwjXHNdL2csIlxcJCYiKSxsdD1jbGFzc3tvcHRpb25zO3NldDtwYXR0ZXJuO3dpbmRvd3NQYXRoc05vRXNjYXBlO25vbmVnYXRlO25lZ2F0ZTtjb21tZW50O2VtcHR5O3ByZXNlcnZlTXVsdGlwbGVTbGFzaGVzO3BhcnRpYWw7Z2xvYlNldDtnbG9iUGFydHM7bm9jYXNlO2lzV2luZG93cztwbGF0Zm9ybTt3aW5kb3dzTm9NYWdpY1Jvb3Q7cmVnZXhwO2NvbnN0cnVjdG9yKHQsZT17fSl7cHQodCksZT1lfHx7fSx0aGlzLm9wdGlvbnM9ZSx0aGlzLnBhdHRlcm49dCx0aGlzLnBsYXRmb3JtPWUucGxhdGZvcm18fEZlLHRoaXMuaXNXaW5kb3dzPXRoaXMucGxhdGZvcm09PT0id2luMzIiLHRoaXMud2luZG93c1BhdGhzTm9Fc2NhcGU9ISFlLndpbmRvd3NQYXRoc05vRXNjYXBlfHxlLmFsbG93V2luZG93c0VzY2FwZT09PSExLHRoaXMud2luZG93c1BhdGhzTm9Fc2NhcGUmJih0aGlzLnBhdHRlcm49dGhpcy5wYXR0ZXJuLnJlcGxhY2UoL1xcL2csIi8iKSksdGhpcy5wcmVzZXJ2ZU11bHRpcGxlU2xhc2hlcz0hIWUucHJlc2VydmVNdWx0aXBsZVNsYXNoZXMsdGhpcy5yZWdleHA9bnVsbCx0aGlzLm5lZ2F0ZT0hMSx0aGlzLm5vbmVnYXRlPSEhZS5ub25lZ2F0ZSx0aGlzLmNvbW1lbnQ9ITEsdGhpcy5lbXB0eT0hMSx0aGlzLnBhcnRpYWw9ISFlLnBhcnRpYWwsdGhpcy5ub2Nhc2U9ISF0aGlzLm9wdGlvbnMubm9jYXNlLHRoaXMud2luZG93c05vTWFnaWNSb290PWUud2luZG93c05vTWFnaWNSb290IT09dm9pZCAwP2Uud2luZG93c05vTWFnaWNSb290OiEhKHRoaXMuaXNXaW5kb3dzJiZ0aGlzLm5vY2FzZSksdGhpcy5nbG9iU2V0PVtdLHRoaXMuZ2xvYlBhcnRzPVtdLHRoaXMuc2V0PVtdLHRoaXMubWFrZSgpfWhhc01hZ2ljKCl7aWYodGhpcy5vcHRpb25zLm1hZ2ljYWxCcmFjZXMmJnRoaXMuc2V0Lmxlbmd0aD4xKXJldHVybiEwO2ZvcihsZXQgdCBvZiB0aGlzLnNldClmb3IobGV0IGUgb2YgdClpZih0eXBlb2YgZSE9InN0cmluZyIpcmV0dXJuITA7cmV0dXJuITF9ZGVidWcoLi4udCl7fW1ha2UoKXtsZXQgdD10aGlzLnBhdHRlcm4sZT10aGlzLm9wdGlvbnM7aWYoIWUubm9jb21tZW50JiZ0LmNoYXJBdCgwKT09PSIjIil7dGhpcy5jb21tZW50PSEwO3JldHVybn1pZighdCl7dGhpcy5lbXB0eT0hMDtyZXR1cm59dGhpcy5wYXJzZU5lZ2F0ZSgpLHRoaXMuZ2xvYlNldD1bLi4ubmV3IFNldCh0aGlzLmJyYWNlRXhwYW5kKCkpXSxlLmRlYnVnJiYodGhpcy5kZWJ1Zz0oLi4ubik9PmNvbnNvbGUuZXJyb3IoLi4ubikpLHRoaXMuZGVidWcodGhpcy5wYXR0ZXJuLHRoaXMuZ2xvYlNldCk7bGV0IHM9dGhpcy5nbG9iU2V0Lm1hcChuPT50aGlzLnNsYXNoU3BsaXQobikpO3RoaXMuZ2xvYlBhcnRzPXRoaXMucHJlcHJvY2VzcyhzKSx0aGlzLmRlYnVnKHRoaXMucGF0dGVybix0aGlzLmdsb2JQYXJ0cyk7bGV0IGk9dGhpcy5nbG9iUGFydHMubWFwKChuLHIsYSk9PntpZih0aGlzLmlzV2luZG93cyYmdGhpcy53aW5kb3dzTm9NYWdpY1Jvb3Qpe2xldCBsPW5bMF09PT0iIiYmblsxXT09PSIiJiYoblsyXT09PSI/Inx8IXZlLnRlc3QoblsyXSkpJiYhdmUudGVzdChuWzNdKSxjPS9eW2Etel06L2kudGVzdChuWzBdKTtpZihsKXJldHVyblsuLi5uLnNsaWNlKDAsNCksLi4ubi5zbGljZSg0KS5tYXAoZj0+dGhpcy5wYXJzZShmKSldO2lmKGMpcmV0dXJuW25bMF0sLi4ubi5zbGljZSgxKS5tYXAoZj0+dGhpcy5wYXJzZShmKSldfXJldHVybiBuLm1hcChsPT50aGlzLnBhcnNlKGwpKX0pO2lmKHRoaXMuZGVidWcodGhpcy5wYXR0ZXJuLGkpLHRoaXMuc2V0PWkuZmlsdGVyKG49Pm4uaW5kZXhPZighMSk9PT0tMSksdGhpcy5pc1dpbmRvd3MpZm9yKGxldCBuPTA7bjx0aGlzLnNldC5sZW5ndGg7bisrKXtsZXQgcj10aGlzLnNldFtuXTtyWzBdPT09IiImJnJbMV09PT0iIiYmdGhpcy5nbG9iUGFydHNbbl1bMl09PT0iPyImJnR5cGVvZiByWzNdPT0ic3RyaW5nIiYmL15bYS16XTokL2kudGVzdChyWzNdKSYmKHJbMl09Ij8iKX10aGlzLmRlYnVnKHRoaXMucGF0dGVybix0aGlzLnNldCl9cHJlcHJvY2Vzcyh0KXtpZih0aGlzLm9wdGlvbnMubm9nbG9ic3Rhcilmb3IobGV0IHM9MDtzPHQubGVuZ3RoO3MrKylmb3IobGV0IGk9MDtpPHRbc10ubGVuZ3RoO2krKyl0W3NdW2ldPT09IioqIiYmKHRbc11baV09IioiKTtsZXR7b3B0aW1pemF0aW9uTGV2ZWw6ZT0xfT10aGlzLm9wdGlvbnM7cmV0dXJuIGU+PTI/KHQ9dGhpcy5maXJzdFBoYXNlUHJlUHJvY2Vzcyh0KSx0PXRoaXMuc2Vjb25kUGhhc2VQcmVQcm9jZXNzKHQpKTplPj0xP3Q9dGhpcy5sZXZlbE9uZU9wdGltaXplKHQpOnQ9dGhpcy5hZGphc2NlbnRHbG9ic3Rhck9wdGltaXplKHQpLHR9YWRqYXNjZW50R2xvYnN0YXJPcHRpbWl6ZSh0KXtyZXR1cm4gdC5tYXAoZT0+e2xldCBzPS0xO2Zvcig7KHM9ZS5pbmRleE9mKCIqKiIscysxKSkhPT0tMTspe2xldCBpPXM7Zm9yKDtlW2krMV09PT0iKioiOylpKys7aSE9PXMmJmUuc3BsaWNlKHMsaS1zKX1yZXR1cm4gZX0pfWxldmVsT25lT3B0aW1pemUodCl7cmV0dXJuIHQubWFwKGU9PihlPWUucmVkdWNlKChzLGkpPT57bGV0IG49c1tzLmxlbmd0aC0xXTtyZXR1cm4gaT09PSIqKiImJm49PT0iKioiP3M6aT09PSIuLiImJm4mJm4hPT0iLi4iJiZuIT09Ii4iJiZuIT09IioqIj8ocy5wb3AoKSxzKToocy5wdXNoKGkpLHMpfSxbXSksZS5sZW5ndGg9PT0wP1siIl06ZSkpfWxldmVsVHdvRmlsZU9wdGltaXplKHQpe0FycmF5LmlzQXJyYXkodCl8fCh0PXRoaXMuc2xhc2hTcGxpdCh0KSk7bGV0IGU9ITE7ZG97aWYoZT0hMSwhdGhpcy5wcmVzZXJ2ZU11bHRpcGxlU2xhc2hlcyl7Zm9yKGxldCBpPTE7aTx0Lmxlbmd0aC0xO2krKyl7bGV0IG49dFtpXTtpPT09MSYmbj09PSIiJiZ0WzBdPT09IiJ8fChuPT09Ii4ifHxuPT09IiIpJiYoZT0hMCx0LnNwbGljZShpLDEpLGktLSl9dFswXT09PSIuIiYmdC5sZW5ndGg9PT0yJiYodFsxXT09PSIuInx8dFsxXT09PSIiKSYmKGU9ITAsdC5wb3AoKSl9bGV0IHM9MDtmb3IoOyhzPXQuaW5kZXhPZigiLi4iLHMrMSkpIT09LTE7KXtsZXQgaT10W3MtMV07aSYmaSE9PSIuIiYmaSE9PSIuLiImJmkhPT0iKioiJiYoZT0hMCx0LnNwbGljZShzLTEsMikscy09Mil9fXdoaWxlKGUpO3JldHVybiB0Lmxlbmd0aD09PTA/WyIiXTp0fWZpcnN0UGhhc2VQcmVQcm9jZXNzKHQpe2xldCBlPSExO2Rve2U9ITE7Zm9yKGxldCBzIG9mIHQpe2xldCBpPS0xO2Zvcig7KGk9cy5pbmRleE9mKCIqKiIsaSsxKSkhPT0tMTspe2xldCByPWk7Zm9yKDtzW3IrMV09PT0iKioiOylyKys7cj5pJiZzLnNwbGljZShpKzEsci1pKTtsZXQgYT1zW2krMV0sbD1zW2krMl0sYz1zW2krM107aWYoYSE9PSIuLiJ8fCFsfHxsPT09Ii4ifHxsPT09Ii4uInx8IWN8fGM9PT0iLiJ8fGM9PT0iLi4iKWNvbnRpbnVlO2U9ITAscy5zcGxpY2UoaSwxKTtsZXQgZj1zLnNsaWNlKDApO2ZbaV09IioqIix0LnB1c2goZiksaS0tfWlmKCF0aGlzLnByZXNlcnZlTXVsdGlwbGVTbGFzaGVzKXtmb3IobGV0IHI9MTtyPHMubGVuZ3RoLTE7cisrKXtsZXQgYT1zW3JdO3I9PT0xJiZhPT09IiImJnNbMF09PT0iInx8KGE9PT0iLiJ8fGE9PT0iIikmJihlPSEwLHMuc3BsaWNlKHIsMSksci0tKX1zWzBdPT09Ii4iJiZzLmxlbmd0aD09PTImJihzWzFdPT09Ii4ifHxzWzFdPT09IiIpJiYoZT0hMCxzLnBvcCgpKX1sZXQgbj0wO2Zvcig7KG49cy5pbmRleE9mKCIuLiIsbisxKSkhPT0tMTspe2xldCByPXNbbi0xXTtpZihyJiZyIT09Ii4iJiZyIT09Ii4uIiYmciE9PSIqKiIpe2U9ITA7bGV0IGw9bj09PTEmJnNbbisxXT09PSIqKiI/WyIuIl06W107cy5zcGxpY2Uobi0xLDIsLi4ubCkscy5sZW5ndGg9PT0wJiZzLnB1c2goIiIpLG4tPTJ9fX19d2hpbGUoZSk7cmV0dXJuIHR9c2Vjb25kUGhhc2VQcmVQcm9jZXNzKHQpe2ZvcihsZXQgZT0wO2U8dC5sZW5ndGgtMTtlKyspZm9yKGxldCBzPWUrMTtzPHQubGVuZ3RoO3MrKyl7bGV0IGk9dGhpcy5wYXJ0c01hdGNoKHRbZV0sdFtzXSwhdGhpcy5wcmVzZXJ2ZU11bHRpcGxlU2xhc2hlcyk7IWl8fCh0W2VdPWksdFtzXT1bXSl9cmV0dXJuIHQuZmlsdGVyKGU9PmUubGVuZ3RoKX1wYXJ0c01hdGNoKHQsZSxzPSExKXtsZXQgaT0wLG49MCxyPVtdLGE9IiI7Zm9yKDtpPHQubGVuZ3RoJiZuPGUubGVuZ3RoOylpZih0W2ldPT09ZVtuXSlyLnB1c2goYT09PSJiIj9lW25dOnRbaV0pLGkrKyxuKys7ZWxzZSBpZihzJiZ0W2ldPT09IioqIiYmZVtuXT09PXRbaSsxXSlyLnB1c2godFtpXSksaSsrO2Vsc2UgaWYocyYmZVtuXT09PSIqKiImJnRbaV09PT1lW24rMV0pci5wdXNoKGVbbl0pLG4rKztlbHNlIGlmKHRbaV09PT0iKiImJmVbbl0mJih0aGlzLm9wdGlvbnMuZG90fHwhZVtuXS5zdGFydHNXaXRoKCIuIikpJiZlW25dIT09IioqIil7aWYoYT09PSJiIilyZXR1cm4hMTthPSJhIixyLnB1c2godFtpXSksaSsrLG4rK31lbHNlIGlmKGVbbl09PT0iKiImJnRbaV0mJih0aGlzLm9wdGlvbnMuZG90fHwhdFtpXS5zdGFydHNXaXRoKCIuIikpJiZ0W2ldIT09IioqIil7aWYoYT09PSJhIilyZXR1cm4hMTthPSJiIixyLnB1c2goZVtuXSksaSsrLG4rK31lbHNlIHJldHVybiExO3JldHVybiB0Lmxlbmd0aD09PWUubGVuZ3RoJiZyfXBhcnNlTmVnYXRlKCl7aWYodGhpcy5ub25lZ2F0ZSlyZXR1cm47bGV0IHQ9dGhpcy5wYXR0ZXJuLGU9ITEscz0wO2ZvcihsZXQgaT0wO2k8dC5sZW5ndGgmJnQuY2hhckF0KGkpPT09IiEiO2krKyllPSFlLHMrKztzJiYodGhpcy5wYXR0ZXJuPXQuc2xpY2UocykpLHRoaXMubmVnYXRlPWV9bWF0Y2hPbmUodCxlLHM9ITEpe2xldCBpPXRoaXMub3B0aW9ucztpZih0aGlzLmlzV2luZG93cyl7bGV0IGg9dHlwZW9mIHRbMF09PSJzdHJpbmciJiYvXlthLXpdOiQvaS50ZXN0KHRbMF0pLF89IWgmJnRbMF09PT0iIiYmdFsxXT09PSIiJiZ0WzJdPT09Ij8iJiYvXlthLXpdOiQvaS50ZXN0KHRbM10pLG09dHlwZW9mIGVbMF09PSJzdHJpbmciJiYvXlthLXpdOiQvaS50ZXN0KGVbMF0pLEE9IW0mJmVbMF09PT0iIiYmZVsxXT09PSIiJiZlWzJdPT09Ij8iJiZ0eXBlb2YgZVszXT09InN0cmluZyImJi9eW2Etel06JC9pLnRlc3QoZVszXSksTj1fPzM6aD8wOnZvaWQgMCxEPUE/MzptPzA6dm9pZCAwO2lmKHR5cGVvZiBOPT0ibnVtYmVyIiYmdHlwZW9mIEQ9PSJudW1iZXIiKXtsZXRbRixMXT1bdFtOXSxlW0RdXTtGLnRvTG93ZXJDYXNlKCk9PT1MLnRvTG93ZXJDYXNlKCkmJihlW0RdPUYsRD5OP2U9ZS5zbGljZShEKTpOPkQmJih0PXQuc2xpY2UoTikpKX19bGV0e29wdGltaXphdGlvbkxldmVsOm49MX09dGhpcy5vcHRpb25zO24+PTImJih0PXRoaXMubGV2ZWxUd29GaWxlT3B0aW1pemUodCkpLHRoaXMuZGVidWcoIm1hdGNoT25lIix0aGlzLHtmaWxlOnQscGF0dGVybjplfSksdGhpcy5kZWJ1ZygibWF0Y2hPbmUiLHQubGVuZ3RoLGUubGVuZ3RoKTtmb3IodmFyIHI9MCxhPTAsbD10Lmxlbmd0aCxjPWUubGVuZ3RoO3I8bCYmYTxjO3IrKyxhKyspe3RoaXMuZGVidWcoIm1hdGNoT25lIGxvb3AiKTt2YXIgZj1lW2FdLGQ9dFtyXTtpZih0aGlzLmRlYnVnKGUsZixkKSxmPT09ITEpcmV0dXJuITE7aWYoZj09PWspe3RoaXMuZGVidWcoIkdMT0JTVEFSIixbZSxmLGRdKTt2YXIgdT1yLGc9YSsxO2lmKGc9PT1jKXtmb3IodGhpcy5kZWJ1ZygiKiogYXQgdGhlIGVuZCIpO3I8bDtyKyspaWYodFtyXT09PSIuInx8dFtyXT09PSIuLiJ8fCFpLmRvdCYmdFtyXS5jaGFyQXQoMCk9PT0iLiIpcmV0dXJuITE7cmV0dXJuITB9Zm9yKDt1PGw7KXt2YXIgYj10W3VdO2lmKHRoaXMuZGVidWcoYApnbG9ic3RhciB3aGlsZWAsdCx1LGUsZyxiKSx0aGlzLm1hdGNoT25lKHQuc2xpY2UodSksZS5zbGljZShnKSxzKSlyZXR1cm4gdGhpcy5kZWJ1ZygiZ2xvYnN0YXIgZm91bmQgbWF0Y2ghIix1LGwsYiksITA7aWYoYj09PSIuInx8Yj09PSIuLiJ8fCFpLmRvdCYmYi5jaGFyQXQoMCk9PT0iLiIpe3RoaXMuZGVidWcoImRvdCBkZXRlY3RlZCEiLHQsdSxlLGcpO2JyZWFrfXRoaXMuZGVidWcoImdsb2JzdGFyIHN3YWxsb3cgYSBzZWdtZW50LCBhbmQgY29udGludWUiKSx1Kyt9cmV0dXJuISEocyYmKHRoaXMuZGVidWcoYAo+Pj4gbm8gbWF0Y2gsIHBhcnRpYWw/YCx0LHUsZSxnKSx1PT09bCkpfWxldCBoO2lmKHR5cGVvZiBmPT0ic3RyaW5nIj8oaD1kPT09Zix0aGlzLmRlYnVnKCJzdHJpbmcgbWF0Y2giLGYsZCxoKSk6KGg9Zi50ZXN0KGQpLHRoaXMuZGVidWcoInBhdHRlcm4gbWF0Y2giLGYsZCxoKSksIWgpcmV0dXJuITF9aWYocj09PWwmJmE9PT1jKXJldHVybiEwO2lmKHI9PT1sKXJldHVybiBzO2lmKGE9PT1jKXJldHVybiByPT09bC0xJiZ0W3JdPT09IiI7dGhyb3cgbmV3IEVycm9yKCJ3dGY/Iil9YnJhY2VFeHBhbmQoKXtyZXR1cm4gTWUodGhpcy5wYXR0ZXJuLHRoaXMub3B0aW9ucyl9cGFyc2UodCl7cHQodCk7bGV0IGU9dGhpcy5vcHRpb25zO2lmKHQ9PT0iKioiKXJldHVybiBrO2lmKHQ9PT0iIilyZXR1cm4iIjtsZXQgcyxpPW51bGw7KHM9dC5tYXRjaChMcykpP2k9ZS5kb3Q/RHM6Q3M6KHM9dC5tYXRjaChFcykpP2k9KGUubm9jYXNlP2UuZG90P09zOnhzOmUuZG90P1JzOnlzKShzWzFdKToocz10Lm1hdGNoKHZzKSk/aT0oZS5ub2Nhc2U/ZS5kb3Q/VXM6UHM6ZS5kb3Q/a3M6RnMpKHMpOihzPXQubWF0Y2goTnMpKT9pPWUuZG90P0FzOlRzOihzPXQubWF0Y2goU3MpKSYmKGk9SXMpO2xldCBuPUouZnJvbUdsb2IodCx0aGlzLm9wdGlvbnMpLnRvTU1QYXR0ZXJuKCk7cmV0dXJuIGk/T2JqZWN0LmFzc2lnbihuLHt0ZXN0Oml9KTpufW1ha2VSZSgpe2lmKHRoaXMucmVnZXhwfHx0aGlzLnJlZ2V4cD09PSExKXJldHVybiB0aGlzLnJlZ2V4cDtsZXQgdD10aGlzLnNldDtpZighdC5sZW5ndGgpcmV0dXJuIHRoaXMucmVnZXhwPSExLHRoaXMucmVnZXhwO2xldCBlPXRoaXMub3B0aW9ucyxzPWUubm9nbG9ic3Rhcj9HczplLmRvdD9XczpIcyxpPW5ldyBTZXQoZS5ub2Nhc2U/WyJpIl06W10pLG49dC5tYXAobD0+e2xldCBjPWwubWFwKGY9PntpZihmIGluc3RhbmNlb2YgUmVnRXhwKWZvcihsZXQgZCBvZiBmLmZsYWdzLnNwbGl0KCIiKSlpLmFkZChkKTtyZXR1cm4gdHlwZW9mIGY9PSJzdHJpbmciP1lzKGYpOmY9PT1rP2s6Zi5fc3JjfSk7cmV0dXJuIGMuZm9yRWFjaCgoZixkKT0+e2xldCB1PWNbZCsxXSxnPWNbZC0xXTtmIT09a3x8Zz09PWt8fChnPT09dm9pZCAwP3UhPT12b2lkIDAmJnUhPT1rP2NbZCsxXT0iKD86XFwvfCIrcysiXFwvKT8iK3U6Y1tkXT1zOnU9PT12b2lkIDA/Y1tkLTFdPWcrIig/OlxcL3wiK3MrIik/Ijp1IT09ayYmKGNbZC0xXT1nKyIoPzpcXC98XFwvIitzKyJcXC8pIit1LGNbZCsxXT1rKSl9KSxjLmZpbHRlcihmPT5mIT09aykuam9pbigiLyIpfSkuam9pbigifCIpLFtyLGFdPXQubGVuZ3RoPjE/WyIoPzoiLCIpIl06WyIiLCIiXTtuPSJeIityK24rYSsiJCIsdGhpcy5uZWdhdGUmJihuPSJeKD8hIituKyIpLiskIik7dHJ5e3RoaXMucmVnZXhwPW5ldyBSZWdFeHAobixbLi4uaV0uam9pbigiIikpfWNhdGNoe3RoaXMucmVnZXhwPSExfXJldHVybiB0aGlzLnJlZ2V4cH1zbGFzaFNwbGl0KHQpe3JldHVybiB0aGlzLnByZXNlcnZlTXVsdGlwbGVTbGFzaGVzP3Quc3BsaXQoIi8iKTp0aGlzLmlzV2luZG93cyYmL15cL1wvW15cL10rLy50ZXN0KHQpP1siIiwuLi50LnNwbGl0KC9cLysvKV06dC5zcGxpdCgvXC8rLyl9bWF0Y2godCxlPXRoaXMucGFydGlhbCl7aWYodGhpcy5kZWJ1ZygibWF0Y2giLHQsdGhpcy5wYXR0ZXJuKSx0aGlzLmNvbW1lbnQpcmV0dXJuITE7aWYodGhpcy5lbXB0eSlyZXR1cm4gdD09PSIiO2lmKHQ9PT0iLyImJmUpcmV0dXJuITA7bGV0IHM9dGhpcy5vcHRpb25zO3RoaXMuaXNXaW5kb3dzJiYodD10LnNwbGl0KCJcXCIpLmpvaW4oIi8iKSk7bGV0IGk9dGhpcy5zbGFzaFNwbGl0KHQpO3RoaXMuZGVidWcodGhpcy5wYXR0ZXJuLCJzcGxpdCIsaSk7bGV0IG49dGhpcy5zZXQ7dGhpcy5kZWJ1Zyh0aGlzLnBhdHRlcm4sInNldCIsbik7bGV0IHI9aVtpLmxlbmd0aC0xXTtpZighcilmb3IobGV0IGE9aS5sZW5ndGgtMjshciYmYT49MDthLS0pcj1pW2FdO2ZvcihsZXQgYT0wO2E8bi5sZW5ndGg7YSsrKXtsZXQgbD1uW2FdLGM9aTtpZihzLm1hdGNoQmFzZSYmbC5sZW5ndGg9PT0xJiYoYz1bcl0pLHRoaXMubWF0Y2hPbmUoYyxsLGUpKXJldHVybiBzLmZsaXBOZWdhdGU/ITA6IXRoaXMubmVnYXRlfXJldHVybiBzLmZsaXBOZWdhdGU/ITE6dGhpcy5uZWdhdGV9c3RhdGljIGRlZmF1bHRzKHQpe3JldHVybiBDLmRlZmF1bHRzKHQpLk1pbmltYXRjaH19O0MuQVNUPUo7Qy5NaW5pbWF0Y2g9bHQ7Qy5lc2NhcGU9S3Q7Qy51bmVzY2FwZT1YO2Z1bmN0aW9uIEJlKG8sdCl7cmV0dXJuIEMobyx0KX12YXIgRHQ9Y2xhc3N7Y29uc3RydWN0b3IodCxlLHMsaSl7dGhpcy5mZXRjaD10LHRoaXMuYWxsb3dlZEhvc3RzPWUsdGhpcy5sYXN0U3RhdHVzQ29kZT0wLHRoaXMubWVtb3J5T3B0aW9ucz1zLHRoaXMubGFzdEhlYWRlcnM9aT97fTpudWxsfWNvbnRyaWJ1dGUodCl7dFtRXT8/PXt9LHRbUV0uaHR0cF9yZXF1ZXN0PShlLHMsaSk9PnRoaXMubWFrZVJlcXVlc3QoZSxzLGkpLHRbUV0uaHR0cF9zdGF0dXNfY29kZT0oKT0+dGhpcy5sYXN0U3RhdHVzQ29kZSx0W1FdLmh0dHBfaGVhZGVycz1lPT50aGlzLmxhc3RIZWFkZXJzPT09bnVsbD8wbjplLnN0b3JlKEpTT04uc3RyaW5naWZ5KHRoaXMubGFzdEhlYWRlcnMpKX1hc3luYyBtYWtlUmVxdWVzdCh0LGUscyl7dGhpcy5sYXN0SGVhZGVycyE9PW51bGwmJih0aGlzLmxhc3RIZWFkZXJzPXt9KSx0aGlzLmxhc3RTdGF0dXNDb2RlPTA7bGV0IGk9dC5yZWFkKGUpO2lmKGk9PT1udWxsKXJldHVybiAwbjtsZXR7aGVhZGVyczpuLGhlYWRlcjpyLHVybDphLG1ldGhvZDpsfT1pLmpzb24oKSxjPWw/LnRvVXBwZXJDYXNlKCk/PyJHRVQiLGY9bmV3IFVSTChhKTtpZighdGhpcy5hbGxvd2VkSG9zdHMuc29tZShoPT5oPT09Zi5ob3N0bmFtZXx8QmUoZi5ob3N0bmFtZSxoKSkpdGhyb3cgbmV3IEVycm9yKGBDYWxsIGVycm9yOiBIVFRQIHJlcXVlc3QgdG8gIiR7Zn0iIGlzIG5vdCBhbGxvd2VkIChubyBhbGxvd2VkSG9zdHMgbWF0Y2ggIiR7Zi5ob3N0bmFtZX0iKWApO2xldCB1PXM9PT0wbnx8Yz09PSJHRVQifHxjPT09IkhFQUQiP251bGw6dC5yZWFkKHMpPy5ieXRlcygpLGc9dGhpcy5mZXRjaCxiPWF3YWl0IGcoYSx7aGVhZGVyczpufHxyLG1ldGhvZDpjLC4uLnU/e2JvZHk6dS5zbGljZSgpfTp7fX0pO3RoaXMubGFzdFN0YXR1c0NvZGU9Yi5zdGF0dXMsdGhpcy5sYXN0SGVhZGVycyE9PW51bGwmJih0aGlzLmxhc3RIZWFkZXJzPU9iamVjdC5mcm9tRW50cmllcyhiLmhlYWRlcnMpKTt0cnl7bGV0IGg9dGhpcy5tZW1vcnlPcHRpb25zLm1heEh0dHBSZXNwb25zZUJ5dGVzP2F3YWl0IEtzKGIsdGhpcy5tZW1vcnlPcHRpb25zLm1heEh0dHBSZXNwb25zZUJ5dGVzKTpuZXcgVWludDhBcnJheShhd2FpdCBiLmFycmF5QnVmZmVyKCkpO3JldHVybiB0LnN0b3JlKGgpfWNhdGNoKGgpe2lmKGggaW5zdGFuY2VvZiBFcnJvcil7bGV0IF89dC5zdG9yZShuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoaC5tZXNzYWdlKSk7cmV0dXJuIHRbal0ubG9nX2Vycm9yKF8pLDBufXJldHVybiAwbn19fTthc3luYyBmdW5jdGlvbiBLcyhvLHQpe2xldCBlPW8uYm9keT8uZ2V0UmVhZGVyKCk7aWYoIWUpcmV0dXJuIG5ldyBVaW50OEFycmF5KDApO2xldCBzPTAsaT1bXTtmb3IoO3M8dDspe2xldHtkb25lOmEsdmFsdWU6bH09YXdhaXQgZS5yZWFkKCk7aWYoYSlicmVhaztpZihpLnB1c2gobCkscys9bC5sZW5ndGgscz49dCl0aHJvdyBuZXcgRXJyb3IoYFJlc3BvbnNlIGJvZHkgZXhjZWVkZWQgJHt0fSBieXRlc2ApfWxldCBuPW5ldyBVaW50OEFycmF5KHMpLHI9MDtmb3IobGV0IGEgb2YgaSluLnNldChhLHIpLHIrPWEubGVuZ3RoO3JldHVybiBufXZhciBRPSJleHRpc206aG9zdC9lbnYiLFhzPShhc3luYygpPT57fSkuY29uc3RydWN0b3IsWHQ9V2ViQXNzZW1ibHkuU3VzcGVuZGluZyxKdD1XZWJBc3NlbWJseS5wcm9taXNpbmcscXQ9Y2xhc3N7I3Q7I2U7I3M9ITE7I247I2w7I3I7Y29uc3RydWN0b3IodCxlLHMsaSxuKXt0aGlzLiN0PWUsdGhpcy4jZT1zLHRoaXMuI249aSx0aGlzLiNsPXQsdGhpcy4jcj1ufWFzeW5jIHJlc2V0KCl7cmV0dXJuIHRoaXMuaXNBY3RpdmUoKT8hMToodGhpcy4jdFt4dF0oKSwhMCl9aXNBY3RpdmUoKXtyZXR1cm4gdGhpcy4jc31hc3luYyBmdW5jdGlvbkV4aXN0cyh0KXtyZXR1cm4gdHlwZW9mIHRoaXMuI2VbMV0uZXhwb3J0c1t0XT09ImZ1bmN0aW9uIn1hc3luYyBjYWxsQmxvY2sodCxlKXt0aGlzLiNzPSEwO2xldCBzPXRoaXMuI2VbMV0uZXhwb3J0c1t0XTtpZighcyl0aHJvdyBFcnJvcihgUGx1Z2luIGVycm9yOiBmdW5jdGlvbiAiJHt0fSIgZG9lcyBub3QgZXhpc3RgKTtpZih0eXBlb2YgcyE9ImZ1bmN0aW9uIil0aHJvdyBFcnJvcihgUGx1Z2luIGVycm9yOiBleHBvcnQgIiR7dH0iIGlzIG5vdCBhIGZ1bmN0aW9uYCk7dGhpcy4jdFtGdF0oZT8/bnVsbCk7dHJ5e3JldHVybiB0aGlzLiNyP2F3YWl0IEp0KHMpKCk6cygpLHRoaXMuI3RbRXRdKCl9Y2F0Y2goaSl7dGhyb3cgdGhpcy4jdFtFdF0oKSxpfWZpbmFsbHl7dGhpcy4jcz0hMX19YXN5bmMgY2FsbCh0LGUscyl7dGhpcy4jdFt4dF0oKTtsZXQgaT10aGlzLiN0W2l0XShlKTt0aGlzLiN0W010XShzKTtsZXRbbixyXT1hd2FpdCB0aGlzLmNhbGxCbG9jayh0LGkpLGE9biE9PW51bGwsbD1uPz9yO2lmKGw9PT1udWxsKXJldHVybiBudWxsO2xldCBjPXRoaXMuI3RbQnRdKGwpO2lmKCFjKXJldHVybiBudWxsO2xldCBmPW5ldyBWKGMuYnVmZmVyKTtpZihhKXRocm93IG5ldyBFcnJvcihgUGx1Z2luLW9yaWdpbmF0ZWQgZXJyb3I6ICR7Zi5zdHJpbmcoKX1gKTtyZXR1cm4gZn1hc3luYyBnZXRFeHBvcnRzKCl7cmV0dXJuIFdlYkFzc2VtYmx5Lk1vZHVsZS5leHBvcnRzKHRoaXMuI2VbMF0pfHxbXX1hc3luYyBnZXRJbXBvcnRzKCl7cmV0dXJuIFdlYkFzc2VtYmx5Lk1vZHVsZS5pbXBvcnRzKHRoaXMuI2VbMF0pfHxbXX1hc3luYyBnZXRJbnN0YW5jZSgpe3JldHVybiB0aGlzLiNlWzFdfWFzeW5jIGNsb3NlKCl7YXdhaXQgUHJvbWlzZS5hbGwodGhpcy4jbi5tYXAodD0+dC5jbG9zZSgpKSksdGhpcy4jbi5sZW5ndGg9MH19O2FzeW5jIGZ1bmN0aW9uIEdlKG8sdCxlLHM9bmV3IG90KEFycmF5QnVmZmVyLG8ubG9nZ2VyLG8ubG9nTGV2ZWwsby5jb25maWcsby5tZW1vcnkpKXtsZXQgaT17W1FdOnNbal0sZW52Ont9fSxuPSExO2ZvcihsZXQgZCBpbiBvLmZ1bmN0aW9ucyl7aVtkXT1pW2RdfHx7fTtmb3IobGV0W3UsZ11vZiBPYmplY3QuZW50cmllcyhvLmZ1bmN0aW9uc1tkXSkpe2xldCBiPWcuY29uc3RydWN0b3I9PT1YcztufHw9YjtsZXQgaD1nLmJpbmQobnVsbCxzKTtpW2RdW3VdPWI/bmV3IFh0KGgpOmh9fWlmKG4mJighWHR8fCFKdCkpdGhyb3cgbmV3IFR5cGVFcnJvcigiVGhpcyBwbGF0Zm9ybSBkb2VzIG5vdCBzdXBwb3J0IGFzeW5jIGZ1bmN0aW9uIGltcG9ydHMgb24gdGhlIG1haW4gdGhyZWFkOyBjb25zaWRlciB1c2luZyBgcnVuSW5Xb3JrZXJgLiIpO2xldCByPXQuaW5kZXhPZigibWFpbiIpO2lmKHI9PT0tMSl0aHJvdyBuZXcgRXJyb3IoJ1VucmVhY2hhYmxlOiBtYW5pZmVzdHMgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSAibWFpbiIgbW9kdWxlLiBFbmZvcmNlZCBieSAic3JjL21hbmlmZXN0LnRzIiknKTtsZXQgYT1uZXcgTWFwLGw9W10sYz17c3VzcGVuZHNPbkludm9rZTpufSxmPWF3YWl0IFp0KHMsWyJtYWluIl0sZVtyXSxpLG8sbCx0LGUsYSxjKTtyZXR1cm4gbmV3IHF0KG8scyxbZVtyXSxmXSxsLGMuc3VzcGVuZHNPbkludm9rZSl9YXN5bmMgZnVuY3Rpb24gWnQobyx0LGUscyxpLG4scixhLGwsYyl7bC5zZXQoZSxudWxsKTtsZXQgZj17fSxkPVdlYkFzc2VtYmx5Lk1vZHVsZS5pbXBvcnRzKGUpLHU9bnVsbDtmb3IobGV0e2tpbmQ6aCxtb2R1bGU6XyxuYW1lOm19b2YgZCl7bGV0IEE9ci5pbmRleE9mKF8pO2lmKEE9PT0tMSl7aWYoXz09PSJ3YXNpX3NuYXBzaG90X3ByZXZpZXcxIiYmdT09PW51bGwpe2lmKCF3dC5zdXBwb3J0c1dhc2lQcmV2aWV3MSl0aHJvdyBuZXcgRXJyb3IoIldBU0kgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGlzIHBsYXRmb3JtIik7aWYoIWkud2FzaUVuYWJsZWQpdGhyb3cgbmV3IEVycm9yKCdXQVNJIGlzIG5vdCBlbmFibGVkOyBzZWUgdGhlICJ1c2VXYXNpIiBwbHVnaW4gb3B0aW9uJyk7dT09PW51bGwmJih1PWF3YWl0IHVlKGkuYWxsb3dlZFBhdGhzLGkuZW5hYmxlV2FzaU91dHB1dCksbi5wdXNoKHUpLHMud2FzaV9zbmFwc2hvdF9wcmV2aWV3MT1hd2FpdCB1LmltcG9ydE9iamVjdCgpKX1pZighT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocyxfKSl0aHJvdyBuZXcgRXJyb3IoYGZyb20gbW9kdWxlICIke3Quam9pbignIi8iJyl9IjogY2Fubm90IHJlc29sdmUgaW1wb3J0ICIke199IiAiJHttfSI6IG5vdCBwcm92aWRlZCBieSBob3N0IGltcG9ydHMgbm9yIGxpbmtlZCBtYW5pZmVzdCBpdGVtc2ApO2lmKCFPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChzW19dLG0pKXRocm93IG5ldyBFcnJvcihgZnJvbSBtb2R1bGUgIiR7dC5qb2luKCciLyInKX0iOiBjYW5ub3QgcmVzb2x2ZSBpbXBvcnQgIiR7X30iICIke219IiAoIiR7X30iIGlzIGEgaG9zdCBtb2R1bGUsIGJ1dCBkb2VzIG5vdCBjb250YWluICIke219IilgKTtpZihfPT09USYmbT09PSJodHRwX3JlcXVlc3QiJiZKdCYmc1tfXVttXT09PW9bal0uaHR0cF9yZXF1ZXN0JiYhaS5leGVjdXRpbmdJbldvcmtlcil7bGV0IE49bmV3IER0KGkuZmV0Y2gsaS5hbGxvd2VkSG9zdHMsaS5tZW1vcnksaS5hbGxvd0h0dHBSZXNwb25zZUhlYWRlcnMpO2Muc3VzcGVuZHNPbkludm9rZT0hMDtsZXQgRD17fTtOLmNvbnRyaWJ1dGUoRCk7Zm9yKGxldFtGLExdb2YgT2JqZWN0LmVudHJpZXMoRFtRXSkpc1tfXVtGXT1MLmJpbmQobnVsbCxvKTtzW19dW21dPW5ldyBYdChzW19dW21dKX1zd2l0Y2goaCl7Y2FzZSJmdW5jdGlvbiI6e2ZbX10/Pz17fSxmW19dW21dPXNbX11bbV07YnJlYWt9ZGVmYXVsdDp0aHJvdyBuZXcgRXJyb3IoYGZyb20gbW9kdWxlICIke3Quam9pbignIi8iJyl9IjogaW4gaW1wb3J0ICIke199IiAiJHttfSIsICIke2h9Ii10eXBlZCBob3N0IGltcG9ydHMgYXJlIG5vdCBzdXBwb3J0ZWQgeWV0YCl9fWVsc2V7bGV0IE49YVtBXSxEPVdlYkFzc2VtYmx5Lk1vZHVsZS5leHBvcnRzKE4pO2lmKCFELmZpbmQoUD0+UC5uYW1lPT09bSYmUC5raW5kPT09aCkpdGhyb3cgbmV3IEVycm9yKGBmcm9tIG1vZHVsZSAiJHt0LmpvaW4oJyIvIicpfSI6IGNhbm5vdCBpbXBvcnQgIiR7X30iICIke219Ijsgbm8gZXhwb3J0IG1hdGNoZWQgcmVxdWVzdGApO2xldCBMPUQuZmluZChQPT5QLm5hbWU9PT0iX3N0YXJ0Iik/YXdhaXQgWnQobyxbLi4udCxfXSxOLHMsaSxuLHIsYSxuZXcgTWFwLGMpOihsLmhhcyhOKXx8YXdhaXQgWnQobyxbLi4udCxfXSxOLHMsaSxuLHIsYSxsLGMpLGwuZ2V0KE4pKTtpZihMKWZbX10/Pz17fSxmW19dW21dPUwuZXhwb3J0c1ttXTtlbHNlIGlmKGg9PT0iZnVuY3Rpb24iKXtmW19dPXt9O2xldCBQPW51bGw7ZltfXVttXT0oLi4uZnQpPT57aWYoUClyZXR1cm4gUCguLi5mdCk7bGV0IEI9bC5nZXQoYVtBXSk7aWYoIUIpdGhyb3cgbmV3IEVycm9yKGBmcm9tIG1vZHVsZSBpbnN0YW5jZSAiJHt0LmpvaW4oJyIvIicpfSI6IHRhcmdldCBtb2R1bGUgIiR7X30iIHdhcyBuZXZlciBpbnN0YW50aWF0ZWRgKTtyZXR1cm4gUD1CLmV4cG9ydHNbbV0sUCguLi5mdCl9fWVsc2UgdGhyb3cgbmV3IEVycm9yKGBmcm9tIG1vZHVsZSAiJHt0LmpvaW4oJyIvIicpfSI6IGNhbm5vdCBpbXBvcnQgIiR7X30iICIke219IjsgY2lyY3VsYXIgaW1wb3J0cyBvZiB0eXBlPSIke2h9IiBhcmUgbm90IHN1cHBvcnRlZGApfX1sZXQgZz1hd2FpdCBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZShlLGYpLGI9Zy5leHBvcnRzLmhzX2luaXQ/Imhhc2tlbGwiOmcuZXhwb3J0cy5faW5pdGlhbGl6ZT8icmVhY3RvciI6Zy5leHBvcnRzLl9zdGFydD8iY29tbWFuZCI6Im5vbmUiO2lmKHUpYXdhaXQgdT8uaW5pdGlhbGl6ZShnKSxnLmV4cG9ydHMuaHNfaW5pdCYmZy5leHBvcnRzLmhzX2luaXQoKTtlbHNlIHN3aXRjaChiKXtjYXNlImNvbW1hbmQiOmcuZXhwb3J0cy5faW5pdGlhbGl6ZSYmZy5leHBvcnRzLl9pbml0aWFsaXplKCksZy5leHBvcnRzLl9zdGFydCgpO2JyZWFrO2Nhc2UicmVhY3RvciI6Zy5leHBvcnRzLl9pbml0aWFsaXplKCk7YnJlYWs7Y2FzZSJoYXNrZWxsIjpnLmV4cG9ydHMuaHNfaW5pdCgpO2JyZWFrfXJldHVybiBsLnNldChlLGcpLGd9dmFyIFF0PWNsYXNze2NvbnN0cnVjdG9yKHQpe2lmKCF0KXRocm93IG5ldyBFcnJvcigiVGhpcyBzaG91bGQgYmUgdW5yZWFjaGFibGU6IHRoaXMgbW9kdWxlIHNob3VsZCBvbmx5IGJlIGludm9rZWQgYXMgYSB3ZWIgd29ya2VyLiIpO3RoaXMuc2hhcmVkRGF0YT1udWxsLHRoaXMuc2hhcmVkRGF0YVZpZXc9bnVsbCx0aGlzLmhvc3RGbGFnPW51bGwsdGhpcy5wb3J0PXQsdGhpcy5wb3J0Lm9uKCJtZXNzYWdlIixlPT50aGlzLmhhbmRsZU1lc3NhZ2UoZSkpLHRoaXMucG9ydC5wb3N0TWVzc2FnZSh7dHlwZToiaW5pdGlhbGl6ZWQifSksdGhpcy5keW5hbWljSGFuZGxlcnM9bmV3IE1hcCx0aGlzLmR5bmFtaWNIYW5kbGVycy5zZXQoImNhbGwiLGFzeW5jKGUscyxpLG4pPT57aWYoIXRoaXMuY29udGV4dCl0aHJvdyBuZXcgRXJyb3IoImludmFsaWQgc3RhdGU6IG5vIGNvbnRleHQgYXZhaWxhYmxlIHRvIHdvcmtlciByZWFjdG9yIik7dGhpcy5jb250ZXh0W3l0XShuKTtsZXQgcj1hd2FpdCB0aGlzLnBsdWdpbj8uY2FsbEJsb2NrKHMsaSkudGhlbihhPT5bbnVsbCxhXSxhPT5bYSxudWxsXSk7bj10aGlzLmNvbnRleHRbUnRdKCk7Zm9yKGxldFthXW9mIG4uYmxvY2tzKWEmJmUucHVzaChhKTtyZXR1cm4gclswXSYmKHJbMF09e29yaWdpbmFsU3RhY2s6clswXT8uc3RhY2ssbWVzc2FnZTpyWzBdPy5tZXNzYWdlfSkse3Jlc3VsdHM6cixzdGF0ZTpufX0pLHRoaXMuZHluYW1pY0hhbmRsZXJzLnNldCgicmVzZXQiLGFzeW5jIGU9PnRoaXMucGx1Z2luPy5yZXNldCgpKSx0aGlzLmR5bmFtaWNIYW5kbGVycy5zZXQoImdldEV4cG9ydHMiLGFzeW5jIGU9PnRoaXMucGx1Z2luPy5nZXRFeHBvcnRzKCkpLHRoaXMuZHluYW1pY0hhbmRsZXJzLnNldCgiZ2V0SW1wb3J0cyIsYXN5bmMgZT0+dGhpcy5wbHVnaW4/LmdldEltcG9ydHMoKSksdGhpcy5keW5hbWljSGFuZGxlcnMuc2V0KCJmdW5jdGlvbkV4aXN0cyIsYXN5bmMoZSxzKT0+dGhpcy5wbHVnaW4/LmZ1bmN0aW9uRXhpc3RzKHMpKX1hc3luYyBoYW5kbGVNZXNzYWdlKHQpe3N3aXRjaCh0LnR5cGUpe2Nhc2UiaW5pdCI6cmV0dXJuIGF3YWl0IHRoaXMuaGFuZGxlSW5pdCh0KTtjYXNlImludm9rZSI6cmV0dXJuIGF3YWl0IHRoaXMuaGFuZGxlSW52b2tlKHQpfX1hc3luYyBoYW5kbGVJbnZva2UodCl7bGV0IGU9dGhpcy5keW5hbWljSGFuZGxlcnMuZ2V0KHQuaGFuZGxlcik7aWYoIWUpcmV0dXJuIHRoaXMucG9ydC5wb3N0TWVzc2FnZSh7dHlwZToicmV0dXJuIixyZXN1bHQ6W2BubyBoYW5kbGVyIHJlZ2lzdGVyZWQgZm9yICR7dC5oYW5kbGVyfWAsbnVsbF19KTtsZXQgcz1bXSxpPWF3YWl0IGUocywuLi50LmFyZ3N8fFtdKS50aGVuKG49PltudWxsLG5dLG49PltuLG51bGxdKTtyZXR1cm4gaVswXSYmKGlbMF09e29yaWdpbmFsU3RhY2s6aVswXT8uc3RhY2ssbWVzc2FnZTppWzBdPy5tZXNzYWdlfSksdGhpcy5wb3J0LnBvc3RNZXNzYWdlKHt0eXBlOiJyZXR1cm4iLHJlc3VsdHM6aX0scyl9YXN5bmMgaGFuZGxlSW5pdCh0KXt0aGlzLnNoYXJlZERhdGE9dC5zaGFyZWREYXRhLHRoaXMuc2hhcmVkRGF0YVZpZXc9bmV3IERhdGFWaWV3KHQuc2hhcmVkRGF0YSksdGhpcy5ob3N0RmxhZz1uZXcgSW50MzJBcnJheSh0aGlzLnNoYXJlZERhdGEpO2xldCBlPU9iamVjdC5mcm9tRW50cmllcyhPYmplY3QuZW50cmllcyh0LmZ1bmN0aW9ucykubWFwKChbYyxmXSk9PltjLE9iamVjdC5mcm9tRW50cmllcyhmLm1hcChkPT5bZCwodSwuLi5nKT0+dGhpcy5jYWxsSG9zdCh1LGMsZCxnKV0pKV0pKSx7dHlwZTpzLG1vZHVsZXM6aSxmdW5jdGlvbnM6biwuLi5yfT10LGE9Yz0+Zj0+dGhpcy5wb3J0LnBvc3RNZXNzYWdlKHt0eXBlOiJsb2ciLGxldmVsOmMsbWVzc2FnZTpmfSksbD1PYmplY3QuZnJvbUVudHJpZXMoWyJpbmZvIiwiZGVidWciLCJ3YXJuIiwiZXJyb3IiLCJ0cmFjZSJdLm1hcChjPT5bYyxhKGMpXSkpO3RoaXMuY29udGV4dD1uZXcgb3QoQXJyYXlCdWZmZXIsbCx0LmxvZ0xldmVsLHQuY29uZmlnLHQubWVtb3J5KSx0aGlzLnBsdWdpbj1hd2FpdCBHZSh7Li4ucixmdW5jdGlvbnM6ZSxmZXRjaCxsb2dnZXI6bCxleGVjdXRpbmdJbldvcmtlcjohMH0sdC5uYW1lcyxpLHRoaXMuY29udGV4dCksdGhpcy5wb3J0LnBvc3RNZXNzYWdlKHt0eXBlOiJyZWFkeSJ9KX1jYWxsSG9zdCh0LGUscyxpKXtpZighdGhpcy5ob3N0RmxhZyl0aHJvdyBuZXcgRXJyb3IoImF0dGVtcHRlZCB0byBjYWxsIGhvc3QgYmVmb3JlIHJlY2VpdmluZyBzaGFyZWQgYXJyYXkgYnVmZmVyIik7QXRvbWljcy5zdG9yZSh0aGlzLmhvc3RGbGFnLDAsRyk7bGV0IG49dFtSdF0oKTt0aGlzLnBvcnQucG9zdE1lc3NhZ2Uoe3R5cGU6Imludm9rZSIsbmFtZXNwYWNlOmUsZnVuYzpzLGFyZ3M6aSxzdGF0ZTpufSk7bGV0IHI9bmV3IHZ0KHRoaXMuc2hhcmVkRGF0YSksYT1bXSxsO2Rve2xldCBjPXIucmVhZFVpbnQ4KCk7c3dpdGNoKGMpe2Nhc2UgMjU1OnJldHVybiBuLmJsb2Nrcz1hLHRbeXRdKG4pLHIuY2xvc2UoKSxsO2Nhc2UgMTpsPXIucmVhZFVpbnQ2NCgpO2JyZWFrO2Nhc2UgMjpsPXIucmVhZEZsb2F0NjQoKTticmVhaztjYXNlIDM6bD12b2lkIDA7YnJlYWs7Y2FzZSA0OntsZXQgZj1yLnJlYWRVaW50MzIoKSxkPXIucmVhZFVpbnQzMigpO2lmKCFkKWEucHVzaChbbnVsbCxmXSk7ZWxzZXtsZXQgdT1uZXcgVWludDhBcnJheShkKTtyLnJlYWQodSksYS5wdXNoKFt1LmJ1ZmZlcixmXSl9fWJyZWFrO2RlZmF1bHQ6dGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIHNlY3Rpb24gdHlwZT0iJHtjfSIgYXQgcG9zaXRpb24gJHtyLnBvc2l0aW9ufTsgcGxlYXNlIG9wZW4gYW4gaXNzdWUgKGh0dHBzOi8vZ2l0aHViLmNvbS9leHRpc20vanMtc2RrL2lzc3Vlcy9uZXc/dGl0bGU9c2hhcmVkK2FycmF5K2J1ZmZlcitiYWQrc2VjdGlvbit0eXBlKyR7Y30mbGFiZWxzPWJ1ZylgKX19d2hpbGUoMSl9fTtuZXcgUXQoc2UpO3ZhciBxcz01MDAsY3QsdnQ9Y2xhc3N7Y29uc3RydWN0b3IodCl7Tyh0aGlzLGN0LHZvaWQgMCk7dGhpcy5pbnB1dD10LHRoaXMuaW5wdXRPZmZzZXQ9Ryx0aGlzLmZsYWc9bmV3IEludDMyQXJyYXkodGhpcy5pbnB1dCksdGhpcy5zY3JhdGNoPW5ldyBBcnJheUJ1ZmZlcig4KSx0aGlzLnNjcmF0Y2hWaWV3PW5ldyBEYXRhVmlldyh0aGlzLnNjcmF0Y2gpLHRoaXMucG9zaXRpb249MCxSKHRoaXMsY3QsMCksdGhpcy53YWl0KCl9Y2xvc2UoKXt0aGlzLnNpZ25hbCgpLEF0b21pY3Muc3RvcmUodGhpcy5mbGFnLDAsRyl9d2FpdCgpe2xldCB0PUc7ZG8gdD1BdG9taWNzLmxvYWQodGhpcy5mbGFnLDApLHQ9PT1HJiZBdG9taWNzLndhaXQodGhpcy5mbGFnLDAsRyxxcyk7d2hpbGUodDw9Ryk7Uih0aGlzLGN0LEF0b21pY3MubG9hZCh0aGlzLmZsYWcsMCkpLHRoaXMuaW5wdXRPZmZzZXQ9R31nZXQgYXZhaWxhYmxlKCl7cmV0dXJuIHAodGhpcyxjdCktdGhpcy5pbnB1dE9mZnNldH1zaWduYWwoKXtBdG9taWNzLnN0b3JlKHRoaXMuZmxhZywwLEcpLEF0b21pY3Mubm90aWZ5KHRoaXMuZmxhZywwLDEpfXB1bGwoKXt0aGlzLnNpZ25hbCgpLHRoaXMud2FpdCgpfXJlYWQodCl7aWYodGhpcy5wb3NpdGlvbis9dC5ieXRlTGVuZ3RoLHQuYnl0ZUxlbmd0aDx0aGlzLmF2YWlsYWJsZSl7dC5zZXQobmV3IFVpbnQ4QXJyYXkodGhpcy5pbnB1dCkuc3ViYXJyYXkodGhpcy5pbnB1dE9mZnNldCx0aGlzLmlucHV0T2Zmc2V0K3QuYnl0ZUxlbmd0aCkpLHRoaXMuaW5wdXRPZmZzZXQrPXQuYnl0ZUxlbmd0aDtyZXR1cm59bGV0IGU9MCxzPXRoaXMuYXZhaWxhYmxlO2Rve2lmKHQuc2V0KG5ldyBVaW50OEFycmF5KHRoaXMuaW5wdXQpLnN1YmFycmF5KHRoaXMuaW5wdXRPZmZzZXQsdGhpcy5pbnB1dE9mZnNldCtzKSxlKSxlKz1zLHRoaXMuaW5wdXRPZmZzZXQrPXMsZT09PXQuYnl0ZUxlbmd0aHx8dGhpcy5hdmFpbGFibGU8MClicmVhazt0aGlzLnB1bGwoKSxzPU1hdGgubWluKE1hdGgubWF4KHRoaXMuYXZhaWxhYmxlLDApLHQuYnl0ZUxlbmd0aC1lKX13aGlsZShlIT09dC5ieXRlTGVuZ3RoKX1yZWFkVWludDgoKXtyZXR1cm4gdGhpcy5yZWFkKG5ldyBVaW50OEFycmF5KHRoaXMuc2NyYXRjaCkuc3ViYXJyYXkoMCwxKSksdGhpcy5zY3JhdGNoVmlldy5nZXRVaW50OCgwKX1yZWFkVWludDMyKCl7cmV0dXJuIHRoaXMucmVhZChuZXcgVWludDhBcnJheSh0aGlzLnNjcmF0Y2gpLnN1YmFycmF5KDAsNCkpLHRoaXMuc2NyYXRjaFZpZXcuZ2V0VWludDMyKDAsITApfXJlYWRVaW50NjQoKXtyZXR1cm4gdGhpcy5yZWFkKG5ldyBVaW50OEFycmF5KHRoaXMuc2NyYXRjaCkpLHRoaXMuc2NyYXRjaFZpZXcuZ2V0QmlnVWludDY0KDAsITApfXJlYWRGbG9hdDY0KCl7cmV0dXJuIHRoaXMucmVhZChuZXcgVWludDhBcnJheSh0aGlzLnNjcmF0Y2gpKSx0aGlzLnNjcmF0Y2hWaWV3LmdldEZsb2F0NjQoMCwhMCl9fTtjdD1uZXcgV2Vha01hcCx2dC5TQUJfSURYPTA7Ci8vIyBzb3VyY2VNYXBwaW5nVVJMPXdvcmtlci5qcy5tYXAK");
var Qe = /* @__PURE__ */ new WeakMap(), Rt = class extends (globalThis.Worker || Object) {
  constructor(t) {
    super(t, { type: "module", credentials: "omit", name: "extism-worker", crossOriginIsolated: true });
  }
  on(t, e) {
    let s = (o) => e(o.data);
    Qe.set(e, s), this.addEventListener(t, s);
  }
  removeListener(t, e) {
    let s = Qe.get(e);
    s && this.removeEventListener(t, s);
  }
  once(t, e) {
    let s = this;
    this.addEventListener(t, function o(...i) {
      s.removeEventListener(t, o), e.call(s, ...i);
    });
  }
};
var ri = Atomics.waitAsync || (() => {
  let l = `onmessage = ev => {
    const [b, i, v] = ev.data
    const f = new Int32Array(b)
    postMessage(Atomics.wait(f, i, v));
  }`, t = new Blob([l], { type: "text/javascript" }), e = URL.createObjectURL(t), s = new Rt(e, { execArgv: [] });
  return (o, i, n) => {
    let r = new Promise((c) => {
      s.once("message", (a) => {
        c(a);
      });
    });
    return s.postMessage([o.buffer, i, n]), { async: true, value: r };
  };
})(), ee = class {
  constructor(t, e, s, o, i, n) {
    this.#e = null;
    this.sharedData = e, this.sharedDataView = new DataView(e), this.hostFlag = new Int32Array(e), this.opts = i, this.names = s, this.modules = o, this.worker = t, this.#t = n, this.hostFlag[0] = Q, this.worker.on("message", (r) => this.#i(r));
  }
  #t;
  #e;
  async #s() {
    let t = this.#e;
    this.#e = [() => {
    }, () => {
    }];
    let e = {}, s = {}, o = await Promise.race([se(this.opts.timeoutMs, e), Promise.all([ie(this.worker), De(this.opts, this.names, this.modules, this.sharedData)])].filter(Boolean)).catch(() => s);
    if (this.#t[it](), o === e) {
      this.opts.logger.error("EXTISM: Plugin timed out while handling a timeout. Plugin will hang. This Wasm module may have a non-trivial `start` section."), this.worker = null;
      return;
    }
    if (o === s) {
      this.opts.logger.error("EXTISM: Plugin failed to restart during a timeout. Plugin will hang."), this.worker = null;
      return;
    }
    let [, i] = o;
    this.worker = i, t && t.pop()(new Error("EXTISM: call canceled due to timeout")), this.#e = null, this.worker.on("message", (n) => this.#i(n));
  }
  async reset() {
    return this.isActive() ? false : (await this.#n("reset"), this.#t[it](), true);
  }
  isActive() {
    return Boolean(this.#e);
  }
  async #i(t) {
    switch (t?.type) {
      case "invoke":
        return this.#a(t);
      case "return":
        return this.#l(t);
      case "log":
        return this.#o(t);
    }
  }
  #o(t) {
    let e = this.opts.logger[t.level];
    typeof e != "function" ? this.opts.logger?.error(`failed to find loglevel="${t.level}" on logger: message=${t.message}`) : e.call(this.opts.logger, t.message);
  }
  #l(t) {
    let e = this.#e || null;
    if (e === null) throw new Error('received "return" call with no corresponding request');
    this.#e = null;
    let [s, o] = e;
    if (!Array.isArray(t.results) || t.results.length !== 2) return o(new Error('received malformed "return"'));
    let [i, n] = t.results;
    i ? o(i) : s(n);
  }
  async #n(t, ...e) {
    if (this.#e) throw new Error("plugin is not reentrant");
    let s, o, i = new Promise((r, c) => {
      s = r, o = c;
    });
    if (this.#e = [s, o], !this.worker) throw new Error("worker not initialized");
    let n = {};
    return Promise.race([se(this.opts.timeoutMs, n), i].filter(Boolean)).then(async (r) => {
      r === n && await this.#s();
    }, () => {
    }), this.worker.postMessage({ type: "invoke", handler: t, args: e }), i;
  }
  async functionExists(t) {
    return await this.#n("functionExists", t);
  }
  async call(t, e, s) {
    let o = this.#t[A](e);
    this.#t[bt](s);
    let [i, n] = await this.callBlock(t, o), r = i !== null, c = i ?? n;
    if (c === null) return null;
    let a = this.#t[pt](c);
    if (a === null) return null;
    let d = new B(new Uint8Array(a.buffer).slice().buffer);
    if (r) {
      let h = new TextDecoder().decode(d);
      throw new Error(`Plugin-originated error: ${h}`);
    }
    return d;
  }
  async callBlock(t, e) {
    let s = this.#t[Vt](), { results: o, state: i } = await this.#n("call", t, e, s);
    this.#t[gt](i, true);
    let [n, r] = o;
    if (n) throw n;
    return r;
  }
  async getExports() {
    return await this.#n("getExports");
  }
  async getImports() {
    return await this.#n("getImports");
  }
  async getInstance() {
    throw new Error("todo");
  }
  async close() {
    this.worker && (await ie(this.worker), this.worker = null);
  }
  async #a(t) {
    let e = new Yt(this.sharedData), o = (this.opts.functions[t.namespace] ?? {})[t.func], i = setInterval(() => {
    }, 0);
    try {
      if (!o) throw Error(`Plugin error: host function "${t.namespace}" "${t.func}" does not exist`);
      new Uint8Array(this.sharedData).subarray(8).fill(254), this.#t[gt](t.state, true);
      let n = await o(this.#t, ...t.args), { blocks: r } = this.#t[Vt](), c;
      for (let [a, d] of r) c = e.writeUint8(4), c && await c, c = e.writeUint32(d), c && await c, c = e.writeUint32(a?.byteLength || 0), c && await c, a && (c = e.write(a), c && await c);
      typeof n == "bigint" ? (c = e.writeUint8(1), c && await c, c = e.writeUint64(n), c && await c) : typeof n == "number" ? (c = e.writeUint8(2), c && await c, c = e.writeFloat64(n), c && await c) : (c = e.writeUint8(3), c && await c), c = e.writeUint8(255), c && await c, await e.flush();
    } catch (n) {
      this.close();
      let [, r] = this.#e;
      return this.#e = null, r(n);
    } finally {
      clearInterval(i);
    }
  }
}, ci = 500, Yt = class {
  constructor(t) {
    this.scratch = new ArrayBuffer(8), this.scratchView = new DataView(this.scratch), this.output = t, this.outputOffset = Q, this.flag = new Int32Array(this.output), this.wait(0);
  }
  async wait(t) {
    let e = 0;
    do
      if (e = Atomics.load(this.flag, 0), e === t) {
        let { value: s, async: o } = ri(this.flag, 0, t, ci);
        if (o && await s === "timed-out") continue;
      }
    while (e === t);
  }
  signal() {
    let t = Atomics.load(this.flag, 0);
    for (; Atomics.compareExchange(this.flag, 0, t, this.outputOffset) === t; ) ;
    Atomics.notify(this.flag, 0, 1);
  }
  async flush() {
    if (this.outputOffset === Q) return;
    let t = this.outputOffset;
    this.signal(), this.outputOffset = Q, await this.wait(t);
  }
  async spanningWrite(t) {
    let e = 0, s = this.output.byteLength - this.outputOffset, o = 1 + Math.floor((t.byteLength - s) / (this.output.byteLength - Q)), i = (t.byteLength - s) % (this.output.byteLength - Q);
    do
      new Uint8Array(this.output).set(t.subarray(e, e + s), this.outputOffset), this.outputOffset += s, e += s, await this.flush(), s = this.output.byteLength - Q, --o;
    while (o != 0);
    i && this.write(t.subarray(e, e + i));
  }
  write(t) {
    if (t.byteLength + this.outputOffset < this.output.byteLength) {
      new Uint8Array(this.output).set(new Uint8Array(t), this.outputOffset), this.outputOffset += t.byteLength;
      return;
    }
    return this.spanningWrite(new Uint8Array(t));
  }
  writeUint8(t) {
    return this.scratchView.setUint8(0, t), this.write(this.scratch.slice(0, 1));
  }
  writeUint32(t) {
    return this.scratchView.setUint32(0, t, true), this.write(this.scratch.slice(0, 4));
  }
  writeUint64(t) {
    return this.scratchView.setBigUint64(0, t, true), this.write(this.scratch.slice(0, 8));
  }
  writeFloat64(t) {
    return this.scratchView.setFloat64(0, t, true), this.write(this.scratch.slice(0, 8));
  }
};
Yt.SAB_IDX = 0;
async function Ae(l, t, e) {
  let s = new ct(SharedArrayBuffer, l.logger, l.logLevel, l.config, l.memory);
  new ut(l.fetch, l.allowedHosts, l.memory, l.allowHttpResponseHeaders).contribute(l.functions), l.functions[J] ??= {}, l.functions[J].var_get ??= (d, h) => s[k].var_get(h), l.functions[J].var_set ??= (d, h, u) => s[k].var_set(h, u);
  let i = new SharedArrayBuffer(l.sharedArrayBufferSize);
  new Uint8Array(i).subarray(8).fill(254);
  let n = {}, r, c = (d) => {
    r = d;
  }, a = await Promise.race([se(l.timeoutMs, n), De(l, t, e, i, c)].filter(Boolean));
  if (a === n) throw await ie(r), new Error("EXTISM: timed out while waiting for plugin to instantiate");
  return new ee(a, i, t, e, l, s);
}
async function De(l, t, e, s, o = (i) => {
}) {
  let i = new Rt(ve, l.nodeWorkerArgs);
  o(i), await new Promise((h, u) => {
    i.on("message", function b(y) {
      y?.type !== "initialized" && u(new Error(`received unexpected message (type=${y?.type})`)), i.removeListener("message", b), h(null);
    });
  });
  let n = new Promise((h, u) => {
    i.on("message", function b(y) {
      y?.type !== "ready" && u(new Error(`received unexpected message (type=${y?.type})`)), i.removeListener("message", b), h(null);
    });
  }), { fetch: r, logger: c, ...a } = l, d = { ...a, type: "init", functions: Object.fromEntries(Object.entries(l.functions || {}).map(([h, u]) => [h, Object.keys(u)])), names: t, modules: e, sharedData: s };
  return i.postMessage(d), await n, i;
}
function se(l, t) {
  return l === null ? null : new Promise((e) => setTimeout(() => e(t), l));
}
async function ie(l) {
  if (typeof globalThis.Bun < "u") {
    let t = setTimeout(() => {
    }, 10);
    await l.terminate(), clearTimeout(t);
  } else await l.terminate();
}
async function ai(l, t = {}) {
  t = { ...t }, t.useWasi ??= false, t.enableWasiOutput ??= t.useWasi ? M.extismStdoutEnvVarSet : false, t.functions = t.functions || {}, t.runInWorker ??= false, t.logger ??= console, t.logLevel ??= "silent", t.fetch ??= fetch;
  let [e, s, o] = await de(await Promise.resolve(l), t.fetch ?? fetch);
  if (t.allowedPaths = t.allowedPaths || e.allowedPaths || {}, t.allowedHosts = t.allowedHosts || e.allowedHosts || [], t.config = t.config || e.config || {}, t.memory = t.memory || e.memory || {}, t.timeoutMs = t.timeoutMs || e.timeoutMs || null, t.nodeWorkerArgs = Object.assign({ name: "extism plugin", execArgv: ["--disable-warning=ExperimentalWarning"] }, t.nodeWorkerArgs || {}), t.allowedHosts.length && !t.runInWorker && !WebAssembly.Suspending) throw new TypeError('"allowedHosts" requires "runInWorker: true". HTTP functions are only available to plugins running in a worker.');
  if (t.timeoutMs && !t.runInWorker) throw new TypeError('"timeout" requires "runInWorker: true". Call timeouts are only available to plugins running in a worker.');
  if (t.runInWorker && !M.hasWorkerCapability) throw new Error("Cannot enable off-thread wasm; current context is not `crossOriginIsolated` (see https://mdn.io/crossOriginIsolated)");
  for (let n in t.allowedPaths) {
    let r = t.allowedPaths[n];
    if (r.startsWith("ro:")) throw new Error(`Readonly dirs are not supported: ${r}`);
  }
  let i = { executingInWorker: false, allowedHosts: t.allowedHosts, allowedPaths: t.allowedPaths, functions: t.functions, fetch: t.fetch || fetch, wasiEnabled: t.useWasi, logger: t.logger, logLevel: O(t.logLevel || "silent"), config: t.config, enableWasiOutput: t.enableWasiOutput, sharedArrayBufferSize: Number(t.sharedArrayBufferSize) || 1 << 16, timeoutMs: t.timeoutMs, memory: t.memory, allowHttpResponseHeaders: !!t.allowHttpResponseHeaders, nodeWorkerArgs: t.nodeWorkerArgs || {} };
  return (t.runInWorker ? Ae : Ue)(i, s, o);
}
class rhylokWASMAdapter {
  constructor() {
    this.plugin = null;
    this.isInitialized = false;
    this.loadWASMPlugin();
    this.initializeUI();
  }
  async loadWASMPlugin() {
    try {
      console.log("📦 Loading WASM plugin...");
      const manifestResponse = await fetch("./manifest.json");
      const manifest = await manifestResponse.json();
      const wasmResponse = await fetch("./plugin.wasm");
      const wasmBytes = await wasmResponse.arrayBuffer();
      manifest.wasm = [{ data: new Uint8Array(wasmBytes) }];
      this.plugin = await ai(manifest, {
        // Generic console logging
        console_log: (offset) => {
          const message = this.plugin.read(offset).text();
          console.log("🔧 WASM:", message);
        },
        // Generic DOM element access
        dom_get_element_by_id: (idOffset) => {
          const id = this.plugin.read(idOffset).text();
          const element = document.getElementById(id);
          return element ? 1 : 0;
        },
        // Generic text content setting
        dom_set_text_content: (handleOffset, textOffset) => {
          const handle = this.plugin.read(handleOffset).text();
          const text = this.plugin.read(textOffset).text();
          const data = JSON.parse(handle);
          const element = document.getElementById(data.handle);
          if (element) {
            element.textContent = data.text;
          }
          return 1;
        },
        // Generic event listener
        dom_add_event_listener: (handleOffset, eventOffset, handlerOffset) => {
          const handleData = this.plugin.read(handleOffset).text();
          const event = this.plugin.read(eventOffset).text();
          const handler = this.plugin.read(handlerOffset).text();
          const data = JSON.parse(handleData);
          const element = document.getElementById(data.handle);
          if (element) {
            element.addEventListener(event, () => {
              try {
                this.plugin.call(handler);
              } catch (error) {
                console.log("WASM handler not found:", handler);
              }
            });
          }
          return 1;
        },
        // Generic timing function
        get_current_time: () => Date.now()
      });
      try {
        this.plugin.call("main");
      } catch (error) {
        console.log("No main function found, module loaded successfully");
      }
      this.isInitialized = true;
      console.log("✅ WASM plugin loaded successfully!");
    } catch (error) {
      console.error("❌ Failed to load WASM plugin:", error);
    }
  }
  initializeUI() {
    document.addEventListener("DOMContentLoaded", () => {
      console.log("🌐 Generic WASM adapter initialized");
      document.addEventListener("keydown", (e) => this.handleInput(e));
      document.addEventListener("click", (e) => this.handleClick(e));
    });
  }
  handleInput(event) {
    if (!this.plugin || !this.isInitialized) return;
    try {
      this.plugin.call("processInput", event.keyCode, Date.now());
    } catch (error) {
    }
  }
  handleClick(event) {
    if (!this.plugin || !this.isInitialized) return;
    try {
      this.plugin.call("handleClick", Date.now());
    } catch (error) {
    }
  }
}
window.addEventListener("load", () => {
  new rhylokWASMAdapter();
});
