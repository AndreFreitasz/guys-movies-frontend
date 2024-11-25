import React from "react";

interface TitleProps {
  title: string;
  className?: string;
}

const Title: React.FC<TitleProps> = ({ title, className }) => {
  return (
    <h2
      className={`text-2xl pl-2 my-2 border-l-8 font-bold border-indigo-600 rounded-sm dark:text-gray-200 md:text-3xl sm:text-lg ${className}`}
    >
      {title}
    </h2>
  );
};

export default Title;
