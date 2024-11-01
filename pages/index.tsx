// pages/index.tsx
import React from "react";
import Header from "../components/_ui/header";
import Title from "../components/_ui/title";
import Image from "next/image";
import Carousel from "../components/_ui/carousel";
import ProvidersList from "../components/home/providersList";

const Home = () => {
  return (
    <>
      <Header />
      <div className="flex flex-col px-40 w-full mt-14">
        <div className="flex items-center mb-4">
          <Image
            src="/icons/popular.png"
            alt="Icon"
            className="mr-2 w-8 h-8"
            width={32}
            height={32}
          />
          <Title title="Filmes Populares" className="ml-2" />
        </div>
        <Carousel>
          <ProvidersList />
        </Carousel>
      </div>
    </>
  );
};

export default Home;
