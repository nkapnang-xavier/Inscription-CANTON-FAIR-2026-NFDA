import { z } from "zod";

export const RECHERCHE_OPTIONS = [
  "Fournisseurs",
  "Produits / opportunités commerciales",
  "Partenaires",
  "Développement de mon activité",
  "Autre",
] as const;

export const PAIEMENT_OPTIONS = [
  "Mobile Money",
  "Virement bancaire en présentiel",
  "Autre",
] as const;

export const DECISION_OPTIONS = [
  "Oui, je souhaite m'inscrire",
  "Je souhaite d'abord être contacté(e) pour plus d'informations",
] as const;

export const inscriptionSchema = z.object({
  nom: z.string().trim().min(2, "Indiquez votre nom et prénom."),
  whatsapp: z
    .string()
    .trim()
    .min(8, "Indiquez un numéro WhatsApp valide.")
    .regex(/^[+()\d][\d\s().-]{6,}$/, "Indiquez un numéro WhatsApp valide."),
  villePays: z.string().trim().min(2, "Indiquez votre ville et votre pays."),
  activite: z.string().trim().min(2, "Décrivez votre activité."),
  recherche: z
    .array(z.enum(RECHERCHE_OPTIONS))
    .min(1, "Sélectionnez au moins une réponse."),
  rechercheAutre: z.string().trim().max(500).optional(),
  paiement: z.enum(PAIEMENT_OPTIONS, {
    error: "Choisissez un mode de règlement.",
  }),
  paiementAutre: z.string().trim().max(500).optional(),
  decision: z.enum(DECISION_OPTIONS, { error: "Choisissez une option." }),
});

export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
  errors: Record<string, string>;
};

export const initialFormState: FormState = {
  status: "idle",
  message: "",
  errors: {},
};
