import React from "react";
import Header from "../components/_ui/header";
import Title from "../components/_ui/title";
import Image from "next/image";

const Home = () => {
  return (
    <>
      <Header />
      <div className="flex px-40 w-full my-16">
        <div className="flex items-center">
          <Image
            src="/icons/popular.png"
            alt="Icon"
            className="mr-2 w-8 h-8"
            width={32}
            height={32}
          />
          <Title title="Filmes Populares" className="ml-2" />
        </div>
      </div>
    </>
  );
};

export default Home;
