import "../styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "react-circular-progressbar/dist/styles.css";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { Figtree } from "next/font/google";
import { MotionConfig } from "framer-motion";
import { AuthProvider } from "../hooks/authContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ToastContainer = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  { ssr: false },
);

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
});

const ROUTE_CHANGE_DELAY = 250;

function RouteProgressBar() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleStart = () => {
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

  if (!isNavigating) return null;

  return (
    <div
      role="progressbar"
      aria-label="Carregando página"
      className="fixed top-0 left-0 z-50 h-1 w-full overflow-hidden bg-transparent"
    >
      <div className="h-full w-1/3 animate-[routeProgress_1s_ease-in-out_infinite] bg-indigo-500" />
    </div>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div
      className={`${figtree.variable} bg-defaultBackground min-h-screen font-sans`}
    >
      <style jsx global>{`
        :root {
          --font-figtree: ${figtree.style.fontFamily};
        }
      `}</style>
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <RouteProgressBar />
          <Component {...pageProps} />
          <ToastContainer position="bottom-right" />
        </AuthProvider>
      </MotionConfig>
    </div>
  );
}

export default MyApp;
