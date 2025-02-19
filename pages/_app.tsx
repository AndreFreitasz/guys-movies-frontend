import "../styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "react-circular-progressbar/dist/styles.css";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "../hooks/authContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import LoadingSpinner from "../components/_ui/loadingSpinner";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return (
    <div className="bg-defaultBackground min-h-screen">
      <AuthProvider>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <Component {...pageProps} />
            <ToastContainer position="bottom-right" />
          </>
        )}
      </AuthProvider>
    </div>
  );
}

export default MyApp;
