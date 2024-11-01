import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-defaultBackground min-h-screen">
      <Component {...pageProps} />
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default MyApp;
