import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface UseFetchOptions extends RequestInit {}

interface UseFetchProps<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

type ErrorCallback = (error: string) => void;

const useFetch = <T,>(
  url: string,
  options?: UseFetchOptions,
  onError?: ErrorCallback,
): UseFetchProps<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(url, options);
        const data: T = await response.json();
        setData(data);
      } catch (error: any) {
        const errorMessage =
          error.message || "Ocorreu um erro ao carregar os dados.";
        setError(errorMessage);
        setLoading(false);
        if (onError) {
          onError(errorMessage);
        } else {
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [url, options, onError]);

  return { data, error, loading };
};

export default useFetch;
