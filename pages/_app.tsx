import "../styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "react-circular-progressbar/dist/styles.css";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "../hooks/authContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-defaultBackground min-h-screen">
      <AuthProvider>
        <Component {...pageProps} />
        <ToastContainer position="bottom-right" />
      </AuthProvider>
    </div>
  );
}

export default MyApp;
