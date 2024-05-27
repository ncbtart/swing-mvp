import { type Jour } from "@prisma/client";
import validator from "validator";

export function formatPrenom(prenom: string): string {
  return prenom
    .toLowerCase()
    .replace(
      /[A-Za-zÀ-ÖØ-öø-ÿ]+/g,
      (c) => c[0]?.toUpperCase() + c.substring(1),
    );
}

export function formatNumeroTelephone(num: string): string | undefined {
  // Supprime tout espace existant pour travailler sur un format uniforme
  const numero = num.replace(/\s+/g, "");

  // Vérifie si le numéro commence par +33
  if (numero.startsWith("+33")) {
    // Retire le préfixe +33
    const sansPrefixe = numero.slice(4);
    // Ajoute un espace tous les deux caractères
    return "+33 " + numero[3] + " " + sansPrefixe.match(/.{1,2}/g)?.join(" ");
  } else {
    // Pour les numéros ne commençant pas par +33, ajoute un espace tous les deux caractères
    return numero.match(/.{1,2}/g)?.join(" ");
  }
}

export function sortDays(days: Jour[]): Jour[] {
  const jours = [
    "LUNDI",
    "MARDI",
    "MERCREDI",
    "JEUDI",
    "VENDREDI",
    "SAMEDI",
  ] as Jour[];
  return days.sort((a, b) => jours.indexOf(a) - jours.indexOf(b));
}

// Fonction pour vérifier si le numéro de téléphone est valide, incluant les formats nationaux et internationaux
export function isFrenchPhoneNumber(number: string) {
  // Expression régulière pour un numéro de téléphone français au format national ou international
  // Cette expression accepte les numéros commençant par 01 à 09 (national) ou +33 (international), et nécessite 9 chiffres supplémentaires après l'indicatif
  const frenchPhoneRegex =
    /^(0[1-9](?:\s?\d{2}){4})|(\+33\s?[1-9](?:\s?\d{2}){4})$/;

  // Utilisation de la méthode matches de validator avec notre expression régulière
  return validator.matches(number, frenchPhoneRegex);
}
