import React from "react";
import Slider, { Settings } from "react-slick";
import styles from "./styles.module.css";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";

interface CarouselProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  settings?: any;
  slidesToShow: number;
  slidesToScroll?: number;
  infinite?: boolean;
  className?: string;
  responsive?: Array<{ breakpoint: number; settings: Partial<Settings> }>;
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
  className,
  responsive,
  slidesToScroll,
}: CarouselProps<T>) => {
  const defaultSettings = {
    dots: false,
    infinite: infinite || false,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: slidesToScroll || 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    swipeToSlide: true,
    touchThreshold: 5,
    responsive: responsive || [
      {
        breakpoint: 1700,
        settings: {
          slidesToShow: Math.min(slidesToShow, 5),
          slidesToScroll: Math.min(slidesToShow > 1 ? slidesToShow - 1 : 1, 4),
        },
      },
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: Math.min(slidesToShow, 4),
          slidesToScroll: Math.min(slidesToShow > 1 ? slidesToShow - 1 : 1, 3),
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(slidesToShow, 3),
          slidesToScroll: 1,
          arrows: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          arrows: false,
        },
      },
    ],
  };

  const mergedSettings = { ...defaultSettings, ...settings };

  return (
    <Slider {...mergedSettings}>
      {data.length > 0 ? (
        data.map((item, index) => (
          <div key={index} className={`mx-1 ${className}`}>
            {renderItem(item, index)}
          </div>
        ))
      ) : (
        <p className="text-white font-bold text-xl">
          Nenhum dado encontrado, tente novamente mais tarde
        </p>
      )}
    </Slider>
  );
};

export default Carousel;
