import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCsv } from "./csv.ts";

test("parses CRLF rows, quoted commas, escaped quotes, and empty cells", () => {
  const rows = parseCsv('Plot Number,Size,Price\r\nA-001,"50, by 100",850000\r\nA-002,"50 ""standard"" by 100",');
  assert.deepEqual(rows, [
    ["Plot Number", "Size", "Price"],
    ["A-001", "50, by 100", "850000"],
    ["A-002", '50 "standard" by 100', ""],
  ]);
});

test("parses newlines inside quoted cells", () => {
  assert.deepEqual(parseCsv('Plot Number,Note\nA-001,"north\ncorner"'), [
    ["Plot Number", "Note"],
    ["A-001", "north\ncorner"],
  ]);
});

test("rejects malformed quoting", () => {
  assert.throws(() => parseCsv('Plot Number\n"A-001'), /not closed/);
  assert.throws(() => parseCsv('Plot Number\nA-"001'), /Unexpected quote/);
});