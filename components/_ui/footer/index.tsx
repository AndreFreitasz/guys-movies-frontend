import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/[0.07] pb-28 lg:pb-0">
      <div className="pointer-events-none absolute inset-x-0 -top-32 h-64 bg-[radial-gradient(50%_60%_at_50%_100%,rgba(124,77,255,0.18),transparent_75%)]" />

      <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10 xl:px-14">
        <div>
          <Link href="/" className="flex items-center gap-0.5">
            <span className="brand-text text-2xl font-black tracking-tight">
              GUY&apos;S
            </span>
            <span className="text-2xl font-black tracking-tight text-white">
              Filmes
            </span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/40">
            Descubra o que assistir, marque o que já viu e guarde suas notas.
            Dados de catálogo fornecidos pelo TMDB.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          <Link
            href="/"
            className="text-sm font-semibold text-white/50 transition-colors duration-300 hover:text-white"
          >
            Filmes
          </Link>
          <Link
            href="/series"
            className="text-sm font-semibold text-white/50 transition-colors duration-300 hover:text-white"
          >
            Séries
          </Link>
          <Link
            href="/assistidos"
            className="text-sm font-semibold text-white/50 transition-colors duration-300 hover:text-white"
          >
            Assistidos
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/50 transition-all duration-300 ease-ios hover:border-white/25 hover:text-white active:scale-90"
          >
            <FaGithub size={16} />
          </a>
          <a
            href="https://www.linkedin.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/50 transition-all duration-300 ease-ios hover:border-white/25 hover:text-white active:scale-90"
          >
            <FaLinkedin size={16} />
          </a>
        </div>
      </div>

      <div className="relative border-t border-white/[0.05] px-4 py-5 sm:px-6 lg:px-10 xl:px-14">
        <p className="text-center text-xs font-medium text-white/30">
          Desenvolvido por{" "}
          <span className="font-bold text-white/60">André Freitas</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
