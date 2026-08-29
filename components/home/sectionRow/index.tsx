import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Carousel from "../../_ui/carousel";

interface SectionRowProps<T> {
  iconSrc: string;
  iconAlt: string;
  title: string;
  eyebrow?: string;
  data: Array<T & { id?: number | string }>;
  renderItem: (item: T, index: number) => React.ReactNode;
  slidesToShow?: number;
  slidesToScroll?: number;
  infinite?: boolean;
  responsive?: React.ComponentProps<typeof Carousel>["responsive"];
  skeletonVariant?: "poster" | "panel";
}

const posterResponsive = [
  { breakpoint: 1536, settings: { slidesToShow: 6, slidesToScroll: 4 } },
  { breakpoint: 1280, settings: { slidesToShow: 5, slidesToScroll: 4 } },
  { breakpoint: 1024, settings: { slidesToShow: 4, slidesToScroll: 3 } },
  { breakpoint: 768, settings: { slidesToShow: 3, slidesToScroll: 2 } },
  { breakpoint: 540, settings: { slidesToShow: 2, slidesToScroll: 2 } },
];

const SectionRow = <T,>({
  iconSrc,
  iconAlt,
  title,
  eyebrow,
  data,
  renderItem,
  slidesToShow = 7,
  slidesToScroll,
  infinite = true,
  responsive,
  skeletonVariant = "poster",
}: SectionRowProps<T>) => {
  const header = (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] p-1.5">
        <Image
          src={iconSrc}
          alt={iconAlt}
          width={48}
          height={48}
          className="h-full w-full object-contain"
        />
      </span>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-indigo-300">
            {eyebrow}
          </p>
        )}
        <h2 className="truncate text-lg font-black tracking-tight text-white sm:text-xl lg:text-2xl">
          {title}
        </h2>
      </div>
    </div>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, ease: [0.32, 0.72, 0, 1] }}
      className="mt-14 lg:mt-20"
    >
      <Carousel
        header={header}
        data={data}
        renderItem={renderItem}
        slidesToShow={slidesToShow}
        slidesToScroll={slidesToScroll}
        infinite={infinite}
        responsive={responsive || posterResponsive}
        skeletonVariant={skeletonVariant}
      />
    </motion.section>
  );
};

export default SectionRow;
