import React from "react";
import { Providers } from "../../../interfaces/movie/types";

const ProvidersMovie: React.FC<Providers> = ({ flatrate, buy, rent }) => {
  return (
    <div className="bg-defaultBackgroundSecond bg-opacity-30 rounded-2xl my-4 border-2 border-white border-opacity-30">
      <h2 className="text-sm font-bold bg-defaultBackgroundSecond bg-opacity-50 rounded-t-2xl text-gray-300 border-b-2 border-white border-opacity-30 py-2 px-4">
        Onde assistir?
      </h2>
      <div className="flex flex-col space-y-4">
        {flatrate && flatrate.length > 0 && (
          <div className="flex items-center justify-start w-full py-2">
            <div className="w-[90px] text-right pr-2">
              <span className="text-gray-200 text-xs font-bold bg-indigo-600 bg-opacity-50 p-2 rounded-xl">
                STREAM
              </span>
            </div>
            <div className="w-1/2 pl-2">
              <div className="flex gap-2">
                {flatrate.map((provider) => (
                  <img
                    key={`flatrate-${provider.provider_id}`}
                    src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                    alt={provider.provider_name}
                    className="w-12 rounded-xl"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        {buy && buy.length > 0 && (
          <div className="flex items-center py-4 border-b-2 border-t-2 border-white border-opacity-30">
            <div className="w-[90px] text-right pr-2">
              <span className="text-gray-200 text-xs font-bold bg-indigo-600 bg-opacity-50 p-2 rounded-xl">
                COMPRAR
              </span>
            </div>
            <div className="w-1/2 pl-2">
              <div className="flex gap-2">
                {buy.map((provider) => (
                  <img
                    key={`buy-${provider.provider_id}`}
                    src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                    alt={provider.provider_name}
                    className="w-12 rounded-xl"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        {rent && rent.length > 0 && (
          <div className="flex items-center py-2">
            <div className="w-[90px] text-right px-2">
              <span className="text-gray-200 text-xs font-bold bg-indigo-600 bg-opacity-50 p-2 rounded-xl">
                ALUGAR
              </span>
            </div>
            <div className="w-1/2 pl-2">
              <div className="flex gap-2">
                {rent.map((provider) => (
                  <img
                    key={`rent-${provider.provider_id}`}
                    src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                    alt={provider.provider_name}
                    className="w-12 rounded-xl"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProvidersMovie;
