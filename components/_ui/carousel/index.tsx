import React from "react";

interface CarouselProps {
  children: React.ReactNode;
}

const Carousel: React.FC<CarouselProps> = ({ children }) => {
  return <div className="flex overflow-x-auto space-x-4 p-4">{children}</div>;
};

export default Carousel;
