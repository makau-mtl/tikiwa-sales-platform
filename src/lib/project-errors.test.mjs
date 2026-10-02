import assert from "node:assert/strict";
import { test } from "node:test";
import { projectSaveErrorMessage } from "./project-errors.ts";

test("development output includes database code, message, and available details", () => {
  const message = projectSaveErrorMessage(
    {
      code: "23502",
      message: 'null value in column "base_price" violates not-null constraint',
      details: "Failing row contains (..., null).",
    },
    true,
  );

  assert.match(message, /Postgres code: 23502/);
  assert.match(message, /Supabase message: null value in column "base_price"/);
  assert.match(message, /Details: Failing row contains/);
});

test("production messages are friendly and database errors are logged", () => {
  const originalError = console.error;
  const logged = [];
  console.error = (...args) => logged.push(args);

  try {
    for (const [code, expected] of [
      ["23502", "Some required project information is missing."],
      ["23505", "A project with conflicting information already exists."],
      ["42501", "You do not have permission to save this project."],
    ]) {
      const rawMessage = `sensitive database detail for ${code}`;
      const displayMessage = projectSaveErrorMessage(
        { code, message: rawMessage, details: "internal row values" },
        false,
      );
      assert.match(displayMessage, new RegExp(expected));
      assert.doesNotMatch(displayMessage, /sensitive database detail|internal row values/);
    }
  } finally {
    console.error = originalError;
  }

  assert.equal(logged.length, 3);
  assert.match(JSON.stringify(logged), /sensitive database detail for 23502/);
  assert.match(JSON.stringify(logged), /internal row values/);
});