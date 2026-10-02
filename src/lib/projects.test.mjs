import assert from "node:assert/strict";
import { test } from "node:test";
import {
  combineProjectDescription,
  formatProjectLocation,
  slugifyProjectName,
  splitProjectDescription,
  splitProjectLocation,
} from "./projects.ts";

test("formats and splits area/town and county using the current location field", () => {
  const location = formatProjectLocation("Juja", "Kiambu County");
  assert.equal(location, "Juja, Kiambu County");
  assert.deepEqual(splitProjectLocation(location), { areaTown: "Juja", county: "Kiambu" });
});

test("generates a normalized project slug", () => {
  assert.equal(slugifyProjectName("Greenview Ridge - Juja"), "greenview-ridge-juja");
  assert.equal(slugifyProjectName("Kiambu Résidence"), "kiambu-residence");
  assert.equal(slugifyProjectName("!!!"), "project");
});

test("round-trips developer information without losing the description", () => {
  const stored = combineProjectDescription("Close to the highway", "Tikiwa Lands Ltd");
  assert.deepEqual(splitProjectDescription(stored), {
    description: "Close to the highway",
    developerInfo: "Tikiwa Lands Ltd",
  });
  assert.equal(combineProjectDescription("", ""), null);
});