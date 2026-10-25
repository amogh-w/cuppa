// node --test "shared/*.test.mjs"    (from the cuppa plugin repo)
import { test, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const { RemoteLink } = createRequire(import.meta.url)("./remote-client.js");

class FakeSocket {
  static all = [];
  constructor(url) {
    this.url = url;
    this.readyState = 0;
    this.sent = [];
    FakeSocket.all.push(this);
  }
  send(s) {
    this.sent.push(JSON.parse(s));
  }
  close() {
    if (this.readyState === 3) return;
    this.readyState = 3;
    queueMicrotask(() => this.onclose && this.onclose());
  }
  open() {
    this.readyState = 1;
    this.onopen && this.onopen();
  }
  say(obj) {
    this.onmessage && this.onmessage({ data: typeof obj === "string" ? obj : JSON.stringify(obj) });
  }
  drop() {
    this.readyState = 3;
    this.onclose && this.onclose();
  }
}
const live = () => FakeSocket.all.filter((s) => s.readyState < 2);

function make(extra = {}) {
  const states = [];
  const msgs = [];
  const closes = [];
  const link = RemoteLink({
    url: "ws://pc/ws",
    WebSocket: FakeSocket,
    onState: (s) => states.push(s),
    onMessage: (m) => msgs.push(m),
    onClose: (i) => closes.push(i),
    ...extra,
  });
  return { link, states, msgs, closes };
}

beforeEach(() => {
  FakeSocket.all = [];
  mock.timers.enable({ apis: ["setTimeout", "setInterval", "Date"] });
});
afterEach(() => mock.timers.reset());

test("opens, delivers parsed messages and ignores junk", () => {
  const { link, states, msgs } = make();
  link.start();
  const s = FakeSocket.all[0];
  s.open();
  s.say({ t: "hello" });
  s.say("not json");
  assert.deepEqual(states, ["connecting", "open"]);
  assert.deepEqual(msgs, [{ t: "hello" }]);
  assert.equal(link.send({ t: "key" }), true);
  assert.deepEqual(s.sent, [{ t: "key" }]);
});

test("send reports false while there is no open socket", () => {
  const { link } = make();
  assert.equal(link.send({ t: "x" }), false);
  link.start();
  assert.equal(link.send({ t: "x" }), false, "still connecting");
});

test("reconnects with growing, capped backoff and goes down after three failures", () => {
  const { link, states, closes } = make();
  link.start();
  const waits = [];
  for (let i = 0; i < 6; i++) {
    const before = FakeSocket.all.length;
    FakeSocket.all.at(-1).drop();
    let waited = 0;
    while (FakeSocket.all.length === before && waited < 10000) {
      mock.timers.tick(50);
      waited += 50;
    }
    waits.push(waited);
  }
  assert.equal(FakeSocket.all.length, 7);
  assert.ok(waits[0] <= 400 * 1.2 + 50, `first wait ${waits[0]}`);
  assert.ok(Math.max(...waits) <= 3000 * 1.2 + 50, `capped: ${waits}`);
  assert.deepEqual(closes.map((c) => c.retry), [1, 2, 3, 4, 5, 6]);
  assert.ok(states.includes("down") && states.indexOf("down") > 0);
});

test("a successful open resets the backoff", () => {
  const { link, closes } = make();
  link.start();
  FakeSocket.all[0].drop();
  mock.timers.tick(2000);
  FakeSocket.all[1].open();
  FakeSocket.all[1].drop();
  assert.equal(closes.at(-1).retry, 1);
  assert.equal(closes.at(-1).wasOpen, true);
});

test("never more than one live socket, however it is poked", () => {
  const { link } = make();
  link.start();
  link.start();
  link.reconnectNow();
  link.reconnectNow();
  FakeSocket.all.at(-1).open();
  link.reconnectNow();
  FakeSocket.all.at(-1).drop();
  mock.timers.tick(5000);
  assert.ok(live().length <= 1, `live sockets: ${live().length}`);
});

test("stop ends the retries and closes the socket", () => {
  const { link } = make();
  link.start();
  FakeSocket.all[0].open();
  link.stop();
  mock.timers.tick(10000);
  assert.equal(FakeSocket.all.length, 1);
  assert.equal(live().length, 0);
  assert.equal(link.send({ t: "x" }), false);
});

test("onClose can call stop to cancel the reconnect", () => {
  let link;
  ({ link } = make({ onClose: () => link.stop() }));
  link.start();
  FakeSocket.all[0].drop();
  mock.timers.tick(10000);
  assert.equal(FakeSocket.all.length, 1);
});

test("pings on the interval and a silent link is dropped and replaced", () => {
  const { link } = make({ pingMs: 1000, staleMs: 3500, ping: () => ({ t: "ping" }) });
  link.start();
  const s = FakeSocket.all[0];
  s.open();
  mock.timers.tick(1000);
  assert.deepEqual(s.sent, [{ t: "ping" }]);
  s.say({ t: "pong" });
  mock.timers.tick(2000);
  assert.equal(s.readyState, 1, "answers keep it alive");
  mock.timers.tick(5000); // nothing heard for longer than staleMs
  assert.notEqual(s.readyState, 1, "the dead socket was dropped");
  mock.timers.tick(5000);
  assert.ok(FakeSocket.all.length >= 2, "and a new one was opened");
});

test("onClose runs before the state changes, so the page still sees the old state", () => {
  const seen = [];
  const { link } = make({ onClose: () => seen.push(seen.length), onState: (s) => seen.push(s) });
  link.start();
  FakeSocket.all[0].open();
  seen.length = 0;
  FakeSocket.all[0].drop();
  assert.deepEqual(seen, [0, "connecting"]);
});
