import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ProvidersList = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          "https://guys-movies-3146ae755de.herokuapp.com/movies/popularByProviders",
        );
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error: any) {
        const errorMessage = "Ocorreu um erro ao buscar os filmes populares";
        toast.error(errorMessage);
      }
    }

    fetchData();
  }, []);
  console.log("data =>", data);

  return (
    <div className="min-w-64 mr-4">
      <div className="flex items-center mb-4">
        <p className="text-white">Teste</p>
        <h2 className="text-xl font-bold text-white">Disney+</h2>
      </div>
      <ul>
        <li className="text-white mb-2">Filme 1</li>
        <li className="text-white mb-2">Filme 2</li>
        <li className="text-white mb-2">Filme 3</li>
        <li className="text-white mb-2">Filme 4</li>
      </ul>
    </div>
  );
};

export default ProvidersList;
