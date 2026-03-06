import nodemailer from "nodemailer";

import path from "path";
import fs from "fs";

// Configurer le transporteur SMTP
const transporter = nodemailer.createTransport({
  host: "localhost", // Utilisation de votre serveur SMTP local
  port: 25, // Port du serveur SMTP (25 est le port par défaut pour SMTP)
  secure: false, // True pour 465, false pour les autres ports
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1", // Spécifiez la version minimale de TLS
  },
  greetingTimeout: 10000, // Ajouter un délai plus long pour recevoir la salutation
});

const sendMail = async (
  to: string,
  subject: string,
  text: string,
  html: string,
  fileName?: string,
  pdfPath?: string,
) => {
  try {
    let attachments: { filename: string; path: string; contentType: string }[] =
      [];

    if (pdfPath && fileName) {
      const fullPath = path.join(process.cwd(), pdfPath);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
      }
      attachments = [
        {
          filename: path.basename(fileName),
          path: fullPath,
          contentType: "application/pdf",
        },
      ];
    }


    await transporter.sendMail({
      from: '"Swing-Technologies" <swing-technologies@example.com>', // Adresse de l'expéditeur
      to, // Adresse du destinataire
      subject, // Sujet de l'email
      text, // Corps de l'email en texte brut
      html, // Corps de l'email en HTML
      attachments, // Pièces jointes
    });

    return { success: true, message: "Email envoyé avec succès" };
  } catch (error) {
    return {
      success: false,
      message: "Erreur lors de l'envoi de l'email",
      error,
    };
  }
};

export default sendMail;
