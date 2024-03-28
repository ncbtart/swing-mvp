import xlsx from "xlsx";

export function readExcel(file: string, sheetIndex = 0) {
  const workbook = xlsx.readFile(file);

  const sheetName = workbook.SheetNames[sheetIndex];

  if (!sheetName) {
    throw new Error("Aucune feuille n'a été trouvée dans le fichier Excel");
  }

  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    throw new Error("La feuille spécifiée n'existe pas");
  }

  const data = xlsx.utils.sheet_to_json(sheet);
  return data;
}
