import { InscriptionForm } from "./inscription-form";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <header className="bg-gradient-to-br from-plum via-brand-dark to-brand px-6 py-10 text-center text-white sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
          NFDA · Nouvelles Femmes Dynamiques Africaines
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          Canton Fair 2026 — Accompagnement NFDA
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/90">
          Remplissez le formulaire en 4 étapes, notre équipe vous contacte sur
          WhatsApp.
        </p>
        <p className="mx-auto mt-4 inline-block rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-black">
          Pack d&apos;accompagnement : 200 000 FCFA
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <InscriptionForm />
      </main>

      <footer className="px-6 pb-8 text-center text-xs text-black/60">
        © {new Date().getFullYear()} NFDA — Pour une Afrique solidaire et
        convergente
      </footer>
    </div>
  );
}
