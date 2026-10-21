import "../styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "react-circular-progressbar/dist/styles.css";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import Head from "next/head";
import { Figtree } from "next/font/google";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AuthProvider } from "../hooks/authContext";
import Header from "../components/_ui/header";
import Footer from "../components/_ui/footer";

const ToastContainer = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  { ssr: false },
);

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
});

const ROUTE_CHANGE_DELAY = 80;

function RouteProgressBar() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleStart = (_url: string, options?: { shallow?: boolean }) => {
      clearTimeout(timeoutId);
      if (options?.shallow) return;
      timeoutId = setTimeout(() => setIsNavigating(true), ROUTE_CHANGE_DELAY);
    };

    const handleDone = () => {
      clearTimeout(timeoutId);
      setIsNavigating(false);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleDone);
    router.events.on("routeChangeError", handleDone);

    return () => {
      clearTimeout(timeoutId);
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleDone);
      router.events.off("routeChangeError", handleDone);
    };
  }, [router.events]);

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="progressbar"
          aria-label="Carregando página"
          className="fixed inset-x-0 top-0 z-100 h-1 overflow-hidden bg-white/10"
        >
          <div className="h-full w-1/3 animate-[routeProgress_1s_ease-in-out_infinite] bg-white shadow-[0_0_18px_rgba(255,255,255,0.75)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type ShellAwareComponent = AppProps["Component"] & { hideShell?: boolean };

function MyApp({ Component, pageProps, router }: AppProps) {
  const routeKey = router.asPath.split("?")[0];
  const { hideShell } = Component as ShellAwareComponent;

  const page = (
    <div key={routeKey}>
      <Component {...pageProps} />
    </div>
  );

  return (
    <div
      className={`${figtree.variable} min-h-screen bg-defaultBackground font-sans`}
    >
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#05050c" />
      </Head>
      <style jsx global>{`
        :root {
          --font-figtree: ${figtree.style.fontFamily};
        }
      `}</style>
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <RouteProgressBar />
          {hideShell ? (
            page
          ) : (
            <>
              <Header />
              {page}
              <Footer />
            </>
          )}
          <ToastContainer
            position="bottom-right"
            theme="dark"
            autoClose={3500}
            hideProgressBar={false}
            newestOnTop
          />
        </AuthProvider>
      </MotionConfig>
    </div>
  );
}

export default MyApp;
