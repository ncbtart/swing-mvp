import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { tmpdir } from "node:os";
import xlsx from "xlsx";

import { readExcel } from "./exel";

function createWorkbookFile(filePath: string) {
  const workbook = xlsx.utils.book_new();
  const sheet = xlsx.utils.json_to_sheet([
    { name: "Alice", score: 12 },
    { name: "Bob", score: 18 },
  ]);

  xlsx.utils.book_append_sheet(workbook, sheet, "Scores");
  xlsx.writeFile(workbook, filePath);
}

void test("readExcel reads rows from the first sheet", () => {
  const dir = mkdtempSync(join(tmpdir(), "swing-excel-test-"));
  const filePath = join(dir, "sample.xlsx");
  createWorkbookFile(filePath);

  const data = readExcel(filePath, 0);

  assert.deepEqual(data, [
    { name: "Alice", score: 12 },
    { name: "Bob", score: 18 },
  ]);

  rmSync(dir, { recursive: true, force: true });
});

void test("readExcel throws when sheet index does not exist", () => {
  const dir = mkdtempSync(join(tmpdir(), "swing-excel-test-"));
  const filePath = join(dir, "sample.xlsx");
  createWorkbookFile(filePath);

  assert.throws(() => readExcel(filePath, 42), {
    message: "Aucune feuille n'a été trouvée dans le fichier Excel",
  });

  rmSync(dir, { recursive: true, force: true });
});
