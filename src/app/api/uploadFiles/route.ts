// app/api/uploadFiles/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  let status = 200;
  let resultBody = {
    status: "ok",
    message: "Files were uploaded successfully",
    files: [] as string[],
  };

  if (files.length) {
    const targetPath = path.join(process.cwd(), `/uploads/`);
    try {
      await fs.access(targetPath);
    } catch (e) {
      await fs.mkdir(targetPath);
    }

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const newFileName = `${Date.now()}-${file.name}`;
      const newFilePath = path.join(targetPath, newFileName);
      await fs.writeFile(newFilePath, buffer);
      resultBody.files.push(newFileName); // Ajouter le chemin du fichier à la réponse
    }
  } else {
    status = 400;
    resultBody = {
      status: "fail",
      message: "No files were uploaded",
      files: [],
    };
  }

  return NextResponse.json(resultBody, { status });
}
