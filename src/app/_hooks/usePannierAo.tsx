"use client";

import { api } from "@/trpc/react";
import {
  Attribution,
  Fabricant,
  RoleName,
  SourceAO,
  TypeMarche,
  type Etablissement,
} from "@prisma/client";

import {
  type ReactNode,
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";
import { useSessionContext } from "./useSession";

interface Form {
  id?: string;
  source: SourceAO;
  name: string;
  numero: string;
  consultation: string;
  dateDebut: string | null;
  dateFin: string | null;
  objet: string;
}

export interface Lot {
  id?: string;
  type: TypeMarche;
  attribution: Attribution;
  numero: string;
  name: string;
  produits: ProduitLot[];
  fabricant?: Fabricant;
}

export interface ProduitLot {
  produitId?: string | null;
  produitName?: string | null;
  modeleId?: string | null;
  modeleName?: string | null;
  prix?: number | null;
}

interface PannierContextType {
  etablissements: Etablissement[];
  lot: Lot;
  form: Form;
  lotRecap: Lot[];

  aoIsPending: boolean;

  addEtablissement: (etablissement: Etablissement) => void;
  removeEtablissement: (etablissement: Etablissement) => void;

  addProduitLot: (produit: ProduitLot) => void;
  removeProduitLot: (produitId: string) => void;

  setForm: (form: Form) => void;
  setLot: (lot: Lot) => void;
  editLot: (idLot: string) => void;
  clearLot: () => void;

  createAo: () => void;
  updateAo: () => void;

  createLot: () => void;
  updateLot: () => void;

  initForm: () => void;
  findById: (id: string) => void;

  removeLot: (idLot: string) => void;
}

const PannierContext = createContext<PannierContextType | undefined>(undefined);

interface PannierProviderProps {
  children: ReactNode;
}

export const PannierProvider: React.FC<PannierProviderProps> = ({
  children,
}) => {
  const { session } = useSessionContext();

  const { data: aoEdit, isPending: aoIsPending } =
    api.source.findLastEditedByMe.useQuery(undefined, {
      enabled: session?.user?.role.name === RoleName.ADMIN,
    });

  const createAOMutation = api.source.create.useMutation({
    onSuccess: (data) => {
      setForm((prev) => ({ ...prev, id: data.id }));
    },
  });

  const [aoId, setAoId] = useState<string | null>(null);

  const { data: ao } = api.source.findById.useQuery(
    {
      id: aoId!,
    },
    {
      enabled: !!aoId,
    },
  );

  const updateAOMutation = api.source.update.useMutation();

  const createLotMutation = api.source.createLot.useMutation({
    onSuccess: (data) => {
      setLotRecap((prev) => [
        ...prev,
        {
          id: data.id,
          type: data.marche.type,
          attribution: data.attribution,
          numero: data.numero,
          name: data.name,
          produits: data.productLot.map((pl) => ({
            produitId: pl?.productId,
            produitName: pl.product?.reference,
            modeleId: pl.modelId,
            modeleName: pl.model?.name,
            prix: pl.prix,
          })),
        },
      ]);
      clearLot();
    },
  });

  const updateLotMutation = api.source.editLot.useMutation({
    onSuccess: (data) => {
      setLotRecap((prev) => [
        ...prev.filter((l) => l.id !== data.id),
        {
          id: data.id,
          type: data.marche.type,
          attribution: data.attribution,
          numero: data.numero,
          name: data.name,
          produits: data.productLot.map((pl) => ({
            produitId: pl?.productId,
            produitName: pl.product?.reference,
            modeleId: pl.modelId,
            modeleName: pl.model?.name,
            prix: pl.prix,
          })),
        },
      ]);
      clearLot();
    },
  });

  const [form, setForm] = useState<Form>({
    source: SourceAO.CH,
    name: "",
    numero: "",
    consultation: "",
    dateDebut: "",
    dateFin: "",
    objet: "",
  });

  const [lot, setLot] = useState<Lot>({
    type: TypeMarche.CHIR_DIGESTIF,
    attribution: Attribution.EN_COURS,
    numero: "",
    name: "",
    produits: [],
    fabricant: Fabricant.SWING,
  });

  const [lotRecap, setLotRecap] = useState<Lot[]>([]);

  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);

  useEffect(() => {
    if (aoEdit) {
      setAoId(aoEdit.id);
    }
  }, [aoEdit]);

  useEffect(() => {
    if (ao) {
      setForm({
        id: ao.id,
        source: ao.source,
        name: ao.name,
        numero: ao.numero,
        consultation: ao.consultation,
        dateDebut: ao.dateDebut.toISOString(),
        dateFin: ao.dateFin.toISOString(),
        objet: ao.objet,
      });

      setEtablissements(ao.etablissementAO.map((e) => e.etablissement));

      setLotRecap(
        ao.marche.flatMap((m) =>
          m.lot.map((l) => ({
            id: l.id,
            type: m.type,
            attribution: l.attribution,
            numero: l.numero,
            name: l.name,
            fabricant: l.fabricant!,
            produits: l.productLot.map((pl) => ({
              produitId: pl?.productId,
              produitName: pl.product?.reference,
              modeleId: pl.modelId,
              modeleName: pl.model?.name,
              prix: pl.prix,
            })),
          })),
        ),
      );
    }
  }, [ao]);

  const initForm = () => {
    setForm({
      source: SourceAO.CH,
      name: "",
      numero: "",
      consultation: "",
      dateDebut: "",
      dateFin: "",
      objet: "",
    });

    setEtablissements([]);
    clearLot();
    setLotRecap([]);
  };

  const findById = (id: string) => {
    setAoId(id);
  };

  const addEtablissement = (etablissement: Etablissement) => {
    if (etablissements.some((e) => e.id === etablissement.id)) {
      return;
    }

    setEtablissements([...etablissements, etablissement]);
  };

  const removeEtablissement = (etablissement: Etablissement) => {
    setEtablissements(etablissements.filter((e) => e.id !== etablissement.id));
  };

  const addProduitLot = (produit: ProduitLot) => {
    if (produit.produitId) {
      if (lot.produits.some((l) => l.produitId === produit.produitId)) {
        return;
      }
    }

    if (produit.modeleId) {
      if (lot.produits.some((l) => l.modeleId === produit.modeleId)) {
        return;
      }
    }

    setLot({
      ...lot,
      produits: [...lot.produits, produit],
    });
  };

  const removeProduitLot = (produitId: string) => {
    setLot({
      ...lot,
      produits: lot.produits.filter(
        (l) => l.produitId !== produitId && l.modeleId !== produitId,
      ),
    });
  };

  const editLot = (idLot: string) => {
    const lot = lotRecap.find((l) => l.id === idLot);

    if (!lot) {
      return;
    }

    setLot({
      id: lot?.id,
      type: lot?.type,
      attribution: lot?.attribution,
      numero: lot?.numero,
      name: lot?.name,
      produits: lot?.produits,
      fabricant: lot?.fabricant,
    });
  };

  const clearLot = () => {
    setLot({
      type: TypeMarche.CHIR_DIGESTIF,
      attribution: Attribution.EN_COURS,
      numero: "",
      name: "",
      produits: [],
      fabricant: Fabricant.SWING,
    });
  };

  const createAo = () => {
    return createAOMutation.mutate({
      source: form.source,
      name: form.name,
      numero: form.numero,
      consultation: form.consultation,
      dateDebut: form.dateDebut!,
      dateFin: form.dateFin!,
      objet: form.objet,
      etablissements: etablissements.map((e) => e.id),
    });
  };

  const updateAo = () => {
    return updateAOMutation.mutate({
      id: form.id!,
      source: form.source,
      name: form.name,
      numero: form.numero,
      consultation: form.consultation,
      dateDebut: form.dateDebut!,
      dateFin: form.dateFin!,
      objet: form.objet,
      etablissements: etablissements.map((e) => e.id),
    });
  };

  const createLot = () => {
    return createLotMutation.mutate({
      aoId: form.id!,
      type: lot.type,
      attribution: lot.attribution,
      numero: lot.numero,
      name: lot.name,
      produits: lot.produits,
      fabricant: lot.fabricant,
    });
  };

  const updateLot = () => {
    return updateLotMutation.mutate({
      id: lot.id!,
      type: lot.type,
      attribution: lot.attribution,
      numero: lot.numero,
      name: lot.name,
      produits: lot.produits,
      fabricant: lot.fabricant,
    });
  };

  const removeLot = (idLot: string) => {
    setLotRecap(lotRecap.filter((l) => l.id !== idLot));
  };

  return (
    <PannierContext.Provider
      value={{
        etablissements,
        addEtablissement,
        removeEtablissement,
        lot,
        setLot,
        addProduitLot,
        removeProduitLot,
        editLot,
        removeLot,
        form,
        setForm,
        aoIsPending,
        createAo,
        updateAo,
        createLot,
        updateLot,
        clearLot,
        lotRecap,
        initForm,
        findById,
      }}
    >
      {children}
    </PannierContext.Provider>
  );
};

export const usePannierAo = (): PannierContextType => {
  const context = useContext(PannierContext);
  if (context === undefined) {
    throw new Error("usePannierAo must be used within a PannierProvider");
  }
  return context;
};
