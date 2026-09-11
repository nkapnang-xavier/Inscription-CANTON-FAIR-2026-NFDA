"use client";

import { useActionState, useRef, useState } from "react";
import {
  DECISION_OPTIONS,
  PAIEMENT_OPTIONS,
  RECHERCHE_OPTIONS,
  initialFormState,
} from "@/lib/inscription";
import { submitInscription } from "./actions";

const STEPS = [
  { key: "A", label: "Identification", title: "Identification de la candidate" },
  { key: "B", label: "Vos besoins", title: "Vos attentes à Canton" },
  { key: "C", label: "Règlement", title: "Pack et mode de règlement" },
  { key: "D", label: "Confirmation", title: "Votre décision" },
] as const;

const FIELD_STEP: Record<string, number> = {
  nom: 0,
  whatsapp: 0,
  villePays: 0,
  activite: 0,
  recherche: 1,
  rechercheAutre: 1,
  paiement: 2,
  paiementAutre: 2,
  decision: 3,
};

const inputClass =
  "w-full rounded-lg border border-brand-soft bg-white px-3 py-2 text-sm text-black outline-none transition-colors placeholder:text-black/40 focus:border-brand focus:ring-2 focus:ring-brand/20";

const labelClass = "block text-[13px] font-semibold text-black";

const optionClass =
  "flex cursor-pointer items-start gap-2.5 rounded-lg border border-brand-soft/60 bg-white px-3 py-2 text-sm leading-snug text-black transition-colors hover:border-brand hover:bg-brand-mist";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-brand-dark" aria-live="polite">
      {message}
    </p>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="mb-5">
      <ol className="flex items-center">
        {STEPS.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li
              key={step.key}
              className="flex flex-1 items-center last:flex-none"
            >
              <span
                aria-current={active ? "step" : undefined}
                className={[
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  active || done
                    ? "bg-plum text-white"
                    : "bg-brand-mist text-black/40",
                ].join(" ")}
              >
                {step.key}
              </span>
              {index < STEPS.length - 1 && (
                <span
                  className={[
                    "mx-2 h-px flex-1 transition-colors",
                    done ? "bg-plum" : "bg-brand-soft/50",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs font-semibold text-black">
        Étape {current + 1} sur {STEPS.length} — {STEPS[current].label}
      </p>
    </div>
  );
}

export function InscriptionForm() {
  const [state, formAction, pending] = useActionState(
    submitInscription,
    initialFormState,
  );
  const [step, setStep] = useState(0);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [recherche, setRecherche] = useState<string[]>([]);
  const [paiement, setPaiement] = useState("");
  const [decision, setDecision] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const errors = { ...localErrors, ...state.errors };

  // Après une soumission refusée par le serveur, revenir à l'étape fautive.
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "error") {
      const first = Object.keys(state.errors)[0];
      if (first && FIELD_STEP[first] !== undefined) setStep(FIELD_STEP[first]);
    }
  }

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-teal bg-teal-soft p-8 text-center">
        <p className="text-2xl font-bold text-black">Merci !</p>
        <p className="mt-3 text-base leading-7 text-black">{state.message}</p>
      </div>
    );
  }

  function validateStep(index: number) {
    const form = formRef.current;
    if (!form) return true;
    const data = new FormData(form);
    const next: Record<string, string> = {};
    const text = (name: string) => String(data.get(name) ?? "").trim();

    if (index === 0) {
      if (text("nom").length < 2) next.nom = "Indiquez votre nom et prénom.";
      if (text("whatsapp").length < 8)
        next.whatsapp = "Indiquez un numéro WhatsApp valide.";
      if (text("villePays").length < 2)
        next.villePays = "Indiquez votre ville et votre pays.";
      if (text("activite").length < 2)
        next.activite = "Décrivez votre activité.";
    }
    if (index === 1 && recherche.length === 0)
      next.recherche = "Sélectionnez au moins une réponse.";
    if (index === 2 && !paiement)
      next.paiement = "Choisissez un mode de règlement.";
    if (index === 3 && !decision) next.decision = "Choisissez une option.";

    setLocalErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setLocalErrors({});
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function goBack() {
    setLocalErrors({});
    setStep((current) => Math.max(current - 1, 0));
  }

  return (
    <div>
      <Stepper current={step} />

      <form
        ref={formRef}
        action={formAction}
        onSubmit={(event) => {
          if (!validateStep(3)) event.preventDefault();
        }}
        className="rounded-2xl border border-brand-soft/50 bg-white p-5 shadow-sm shadow-plum/5 sm:p-7"
        noValidate
      >
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Ne pas remplir</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-plum text-sm font-bold text-white">
            {STEPS[step].key}
          </span>
          <h2 className="text-lg font-bold text-black">{STEPS[step].title}</h2>
        </div>

        {/* Étape A — identification */}
        <div className={step === 0 ? "grid gap-4 sm:grid-cols-2" : "hidden"}>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="nom">
              Nom &amp; prénom <span className="text-brand">*</span>
            </label>
            <input
              id="nom"
              name="nom"
              type="text"
              autoComplete="name"
              className={`${inputClass} mt-1`}
              placeholder="Votre nom et prénom"
            />
            <FieldError message={errors.nom} />
          </div>

          <div>
            <label className={labelClass} htmlFor="whatsapp">
              Numéro WhatsApp <span className="text-brand">*</span>
            </label>
            <input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className={`${inputClass} mt-1`}
              placeholder="+237 6 XX XX XX XX"
            />
            <FieldError message={errors.whatsapp} />
          </div>

          <div>
            <label className={labelClass} htmlFor="villePays">
              Ville / Pays <span className="text-brand">*</span>
            </label>
            <input
              id="villePays"
              name="villePays"
              type="text"
              className={`${inputClass} mt-1`}
              placeholder="Douala, Cameroun"
            />
            <FieldError message={errors.villePays} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="activite">
              Votre activité <span className="text-brand">*</span>
            </label>
            <input
              id="activite"
              name="activite"
              type="text"
              className={`${inputClass} mt-1`}
              placeholder="Import-export, prêt-à-porter, électronique…"
            />
            <FieldError message={errors.activite} />
          </div>
        </div>

        {/* Étape B — besoins */}
        <div className={step === 1 ? "block" : "hidden"}>
          <fieldset>
            <legend className={labelClass}>
              Que recherchez-vous à Canton ?{" "}
              <span className="text-brand">*</span>
            </legend>
            <p className="mt-1 text-xs text-black/60">
              Plusieurs réponses possibles.
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {RECHERCHE_OPTIONS.map((option) => (
                <label key={option} className={optionClass}>
                  <input
                    type="checkbox"
                    name="recherche"
                    value={option}
                    checked={recherche.includes(option)}
                    onChange={(event) =>
                      setRecherche((current) =>
                        event.target.checked
                          ? [...current, option]
                          : current.filter((item) => item !== option),
                      )
                    }
                    className="mt-0.5 size-4 accent-brand"
                  />
                  {option}
                </label>
              ))}
            </div>
            {recherche.includes("Autre") && (
              <input
                name="rechercheAutre"
                type="text"
                className={`${inputClass} mt-2`}
                placeholder="Précisez"
              />
            )}
            <FieldError message={errors.recherche} />
          </fieldset>
        </div>

        {/* Étape C — pack et règlement */}
        <div className={step === 2 ? "flex flex-col gap-4" : "hidden"}>
          <div className="rounded-xl border border-gold bg-gold-soft p-4">
            <p className="text-base font-bold text-black">
              Pack d&apos;accompagnement : 200 000 FCFA
            </p>
            <p className="mt-1.5 text-xs leading-5 text-black">
              Comprend : accueil à l&apos;aéroport, orientation, informations
              pratiques, conseils, mise en relation avec des fournisseurs et
              accompagnement organisationnel.
            </p>
            <p className="mt-1.5 text-xs leading-5 text-black">
              <strong>Non inclus :</strong> billet d&apos;avion, visa,
              hébergement et dépenses personnelles. La NFDA ne garantit pas
              l&apos;obtention du visa.
            </p>
          </div>

          <fieldset>
            <legend className={labelClass}>
              Mode de règlement des frais d&apos;accompagnement{" "}
              <span className="text-brand">*</span>
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {PAIEMENT_OPTIONS.map((option) => (
                <label key={option} className={optionClass}>
                  <input
                    type="radio"
                    name="paiement"
                    value={option}
                    checked={paiement === option}
                    onChange={() => setPaiement(option)}
                    className="mt-0.5 size-4 accent-brand"
                  />
                  {option}
                </label>
              ))}
            </div>
            {paiement === "Autre" && (
              <input
                name="paiementAutre"
                type="text"
                className={`${inputClass} mt-2`}
                placeholder="Précisez"
              />
            )}
            <FieldError message={errors.paiement} />
          </fieldset>
        </div>

        {/* Étape D — décision */}
        <div className={step === 3 ? "block" : "hidden"}>
          <fieldset>
            <legend className={labelClass}>
              Êtes-vous prêt(e) à vous inscrire au pack d&apos;accompagnement de
              200 000 FCFA ? <span className="text-brand">*</span>
            </legend>
            <div className="mt-2 flex flex-col gap-2">
              {DECISION_OPTIONS.map((option) => (
                <label key={option} className={optionClass}>
                  <input
                    type="radio"
                    name="decision"
                    value={option}
                    checked={decision === option}
                    onChange={() => setDecision(option)}
                    className="mt-0.5 size-4 accent-brand"
                  />
                  {option}
                </label>
              ))}
            </div>
            <FieldError message={errors.decision} />
          </fieldset>
        </div>

        {state.status === "error" && state.message && (
          <p
            className="mt-4 rounded-lg bg-brand-mist px-3 py-2 text-xs text-brand-dark"
            aria-live="polite"
          >
            {state.message}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-brand-soft/40 pt-4">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="rounded-full px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-brand-mist disabled:invisible"
          >
            ← Retour
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand/25 transition-colors hover:bg-brand-dark"
            >
              Continuer →
            </button>
          ) : (
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-sm shadow-brand/25 transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Envoi en cours…" : "Je m'inscris"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
