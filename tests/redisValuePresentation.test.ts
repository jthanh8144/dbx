import { strict as assert } from "node:assert";
import test from "node:test";
import { formatRedisMemberDetail } from "../src/lib/redisValuePresentation.ts";

test("formats JSON object strings for Redis member details", () => {
  const detail = formatRedisMemberDetail('{"id":1,"name":"Ada","tags":["dbx","redis"]}');

  assert.equal(detail.format, "json");
  assert.equal(detail.text, '{\n  "id": 1,\n  "name": "Ada",\n  "tags": [\n    "dbx",\n    "redis"\n  ]\n}');
});

test("keeps plain Redis member strings unchanged", () => {
  const detail = formatRedisMemberDetail("plain long member value");

  assert.equal(detail.format, "text");
  assert.equal(detail.text, "plain long member value");
});

test("formats non-string Redis member values as JSON", () => {
  const detail = formatRedisMemberDetail({ field: "name", value: '{"nested":true}' });

  assert.equal(detail.format, "json");
  assert.equal(detail.text, '{\n  "field": "name",\n  "value": "{\\"nested\\":true}"\n}');
});
