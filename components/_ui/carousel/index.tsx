import React from "react";
import Slider from "react-slick";
import styles from "./styles.module.css";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";

interface CarouselProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  settings?: any;
  slidesToShow: number;
  infinite?: boolean;
}

interface ArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const SamplePrevArrow: React.FC<ArrowProps> = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      onClick={onClick}
      className={`${styles["slick-prev"]} ${className}`}
      style={style}
    >
      <AiOutlineArrowLeft className={`${styles.arrows}`} />
    </div>
  );
};

const SampleNextArrow: React.FC<ArrowProps> = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      onClick={onClick}
      className={`${styles["slick-next"]} ${className}`}
      style={style}
    >
      <AiOutlineArrowRight className={`${styles.arrows} ${styles.arrowNext}`} />
    </div>
  );
};

const Carousel = <T,>({
  data = [],
  renderItem,
  settings,
  slidesToShow,
  infinite,
}: CarouselProps<T>) => {
  const defaultSettings = {
    dots: false,
    infinite: infinite || false,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: slidesToShow,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(slidesToShow, 2),
          slidesToScroll: Math.min(slidesToShow, 2),
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const mergedSettings = { ...defaultSettings, ...settings };

  return (
    <Slider {...mergedSettings}>
      {data.length > 0 ? (
        data.map((item, index) => (
          <div key={index} className="mx-4">
            {renderItem(item, index)}
          </div>
        ))
      ) : (
        <div>No items to display</div>
      )}
    </Slider>
  );
};

export default Carousel;
