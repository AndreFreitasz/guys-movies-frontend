import { ToastContainer } from "react-toastify";
import "../styles/globals.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-defaultBackground min-h-screen">
      <Component {...pageProps} />
      <ToastContainer />
    </div>
  );
}

export default MyApp;
