import React from "react";
import { ProviderDetail } from "../../../interfaces/movie/types";

interface ProvidersMovieProps {
  title: string;
  providers: ProviderDetail[];
}

const ProvidersMovie: React.FC<ProvidersMovieProps> = ({
  title,
  providers,
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-200 mb-2">{title}</h2>
      <div className="flex gap-4">
        {providers.map((provider) => (
          <div className="flex flex-col items-center">
            <img
              src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
              alt={provider.provider_name}
              className="w-12"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProvidersMovie;
