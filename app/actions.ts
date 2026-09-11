"use server";

import { getSql } from "@/lib/db";
import { inscriptionSchema, type FormState } from "@/lib/inscription";

export async function submitInscription(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  // Honeypot: real users never fill this hidden field.
  if (formData.get("website")) {
    return {
      status: "success",
      message: "Inscription enregistrée.",
      errors: {},
    };
  }

  const parsed = inscriptionSchema.safeParse({
    nom: formData.get("nom") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    villePays: formData.get("villePays") ?? "",
    activite: formData.get("activite") ?? "",
    recherche: formData.getAll("recherche"),
    rechercheAutre: formData.get("rechercheAutre") ?? undefined,
    paiement: formData.get("paiement") ?? "",
    paiementAutre: formData.get("paiementAutre") ?? undefined,
    decision: formData.get("decision") ?? "",
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      errors[field] ??= issue.message;
    }
    return {
      status: "error",
      message: "Veuillez corriger les champs signalés.",
      errors,
    };
  }

  const data = parsed.data;

  try {
    const sql = getSql();
    await sql`
      insert into inscriptions_canton_2026
        (nom, whatsapp, ville_pays, activite, recherche, recherche_autre, paiement, paiement_autre, decision)
      values (
        ${data.nom},
        ${data.whatsapp},
        ${data.villePays},
        ${data.activite},
        ${JSON.stringify(data.recherche)}::jsonb,
        ${data.rechercheAutre || null},
        ${data.paiement},
        ${data.paiementAutre || null},
        ${data.decision}
      )
    `;
  } catch (error) {
    console.error("Inscription insert failed", error);
    return {
      status: "error",
      message:
        "Une erreur technique est survenue. Réessayez ou contactez-nous sur WhatsApp.",
      errors: {},
    };
  }

  return {
    status: "success",
    message:
      data.decision === "Oui, je souhaite m'inscrire"
        ? "Inscription enregistrée. Notre équipe vous contacte sur WhatsApp pour finaliser votre pack."
        : "Demande enregistrée. Notre équipe vous contacte sur WhatsApp avec toutes les informations.",
    errors: {},
  };
}
