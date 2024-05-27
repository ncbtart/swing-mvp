import { Fonction, RendezVousType, Surgery } from "@prisma/client";

export const RoleNameLabels = {
  ADMIN: "Admin",
  CHEF: "Chef de Secteurs",
  COMMERCIAL: "Commercial",
};

export const ServiceLabels = {
  CHIR_DIGESTIF: "Digestif",
  CHIR_UROLOGIE: "Urologie",
  CHIR_GINECO: "Gynécologie",
  PHARMACIE: "Pharmacie",
  X_BLOC: "Bloc",
};

export const CiviliteLabels = {
  M: "M.",
  MME: "Mme",
  AUTRES: "Autres",
};

export const FonctionLabels = {
  CHIR: "CHIR",
  PROFESSEUR: "PR",
  PRACTICIEN: "PH",
  CHEF_DE_SERVICE: "CS",
  IBODE: "IBODE",
  PHARM_ADJOINT: "PH-ADJ",
  PHARM_GERANT: "PH-GER",
};

export const FonctionChirs = [
  Fonction.CHIR,
  Fonction.PROFESSEUR,
  Fonction.PRACTICIEN,
  Fonction.CHEF_DE_SERVICE,
];

export const SurgeriesByService = {
  CHIR_DIGESTIF: [
    Surgery.HIC,
    Surgery.HIL,
    Surgery.HOC,
    Surgery.HOL,
    Surgery.EIPL,
    Surgery.EIPC,
    Surgery.ERM,
    Surgery.PROLAPSUS,
  ],
  CHIR_UROLOGIE: [Surgery.PROLAPSUS, Surgery.BSU],
  CHIR_GINECO: [Surgery.PROLAPSUS, Surgery.BSU],
  PHARMACIE: [],
  X_BLOC: [],
};

export const RDVByService = {
  CHIR_DIGESTIF: [
    RendezVousType.RDV1_CONSULT_CHIR,
    RendezVousType.RDV2_CONSULT_CHIR,
    RendezVousType.RDV1_BLOC_CHIR,
    RendezVousType.RDV2_BLOC_CHIR,
    RendezVousType.RDV_STAFF_CHIR,
  ],
  CHIR_UROLOGIE: [
    RendezVousType.RDV1_CONSULT_CHIR,
    RendezVousType.RDV2_CONSULT_CHIR,
    RendezVousType.RDV1_BLOC_CHIR,
    RendezVousType.RDV2_BLOC_CHIR,
    RendezVousType.RDV_STAFF_CHIR,
  ],
  CHIR_GINECO: [
    RendezVousType.RDV1_CONSULT_CHIR,
    RendezVousType.RDV2_CONSULT_CHIR,
    RendezVousType.RDV1_BLOC_CHIR,
    RendezVousType.RDV2_BLOC_CHIR,
    RendezVousType.RDV_STAFF_CHIR,
  ],
  PHARMACIE: [
    RendezVousType.RDV1,
    RendezVousType.RDV2,
    RendezVousType.RDV_VALIDATION,
    RendezVousType.RDV_FORMATION,
  ],
  X_BLOC: [
    RendezVousType.RDV1_SBO,
    RendezVousType.RDV2_SBO,
    RendezVousType.RDV1_IMPLANTATION,
    RendezVousType.RDV2_IMPLANTATION,
  ],
};

export const RDVByServiceWithEssai = {
  CHIR_DIGESTIF: [
    RendezVousType.RDV1_CONSULT_CHIR,
    RendezVousType.RDV2_CONSULT_CHIR,
    RendezVousType.RDV1_BLOC_CHIR,
    RendezVousType.RDV2_BLOC_CHIR,
    RendezVousType.RDV_STAFF_CHIR,
    RendezVousType.ESSAI1,
    RendezVousType.ESSAI2,
  ],
  CHIR_UROLOGIE: [
    RendezVousType.RDV1_CONSULT_CHIR,
    RendezVousType.RDV2_CONSULT_CHIR,
    RendezVousType.RDV1_BLOC_CHIR,
    RendezVousType.RDV2_BLOC_CHIR,
    RendezVousType.RDV_STAFF_CHIR,
    RendezVousType.ESSAI1,
    RendezVousType.ESSAI2,
  ],
  CHIR_GINECO: [
    RendezVousType.RDV1_CONSULT_CHIR,
    RendezVousType.RDV2_CONSULT_CHIR,
    RendezVousType.RDV1_BLOC_CHIR,
    RendezVousType.RDV2_BLOC_CHIR,
    RendezVousType.RDV_STAFF_CHIR,
    RendezVousType.ESSAI1,
    RendezVousType.ESSAI2,
  ],
  PHARMACIE: [
    RendezVousType.RDV1,
    RendezVousType.RDV2,
    RendezVousType.RDV_VALIDATION,
    RendezVousType.RDV_FORMATION,
  ],
  X_BLOC: [
    RendezVousType.RDV1_SBO,
    RendezVousType.RDV2_SBO,
    RendezVousType.RDV1_IMPLANTATION,
    RendezVousType.RDV2_IMPLANTATION,
  ],
};

export const RendezVousTypeLabels = {
  RDV1_CONSULT_CHIR: "RDV1 Consult Chir",
  RDV2_CONSULT_CHIR: "RDV2 Consult Chir",
  RDV1_BLOC_CHIR: "RDV1 Bloc Chir",
  RDV2_BLOC_CHIR: "RDV2 Bloc Chir",
  RDV_STAFF_CHIR: "RDV Staff Chir",
  ESSAI1: "Essai 1",
  ESSAI2: "Essai 2",
  RDV1: "RDV1",
  RDV2: "RDV2",
  RDV_VALIDATION: "RDV Validation",
  RDV_FORMATION: "RDV Formation",
  RDV1_SBO: "RDV1 SBO",
  RDV2_SBO: "RDV2 SBO",
  RDV1_IMPLANTATION: "RDV1 Implantation",
  RDV2_IMPLANTATION: "RDV2 Implantation",
};

export const GroupRDVTypes = {
  RDV: [
    RendezVousType.RDV1_CONSULT_CHIR,
    RendezVousType.RDV2_CONSULT_CHIR,
    RendezVousType.RDV1_BLOC_CHIR,
    RendezVousType.RDV2_BLOC_CHIR,
    RendezVousType.RDV_STAFF_CHIR,
  ],
  PHARM: [
    RendezVousType.RDV1,
    RendezVousType.RDV2,
    RendezVousType.RDV_VALIDATION,
    RendezVousType.RDV_FORMATION,
    RendezVousType.RDV1_SBO,
    RendezVousType.RDV2_SBO,
    RendezVousType.RDV1_IMPLANTATION,
    RendezVousType.RDV2_IMPLANTATION,
  ],
  ESSAI: [RendezVousType.ESSAI1, RendezVousType.ESSAI2],
};

export const SurgeriesByTypeMarche = {
  CHIR_DIGESTIF: [
    Surgery.HIC,
    Surgery.HIL,
    Surgery.HOC,
    Surgery.HOL,
    Surgery.EIPL,
    Surgery.EIPC,
    Surgery.ERM,
    Surgery.PROLAPSUS,
  ],
  CHIR_UROLOGIE: [Surgery.PROLAPSUS, Surgery.BSU],
  CHIR_GINECO: [Surgery.PROLAPSUS, Surgery.BSU],
};

export const SourceLabel = {
  GHT: "GHT",
  GROUPE: "GA",
  CH: "CH",
  OFFRE: "OP",
};

export const TypeMarcheLabels = {
  CHIR_DIGESTIF: "Digestif",
  CHIR_UROLOGIE: "Urologie",
  CHIR_GINECO: "Gynécologie",
};

export const AttributionLabels = {
  EN_COURS: "En cours",
  INFRUCTUEUX: "Infructueux",
  SANS_SUITE: "Sans suite",
};
