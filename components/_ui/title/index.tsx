import React from "react";

interface TitleProps {
  title: string;
  className?: string;
}

const Title: React.FC<TitleProps> = ({ title, className }) => {
  return (
    <h2
      className={`text-lg font-black tracking-tight text-white sm:text-xl lg:text-2xl ${className ?? ""}`}
    >
      {title}
    </h2>
  );
};

export default Title;
