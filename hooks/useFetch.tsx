import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface UseFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

const useFetch = <T,>(url: string, errorMessage: string): UseFetchResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Erro: ${response.status} ${response.statusText}`);
        }

        const jsonData: T = await response.json();
        setData(jsonData);
      } catch (err: any) {
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url, errorMessage]);

  return { data, isLoading, error };
};

export default useFetch;
