import pl1 from "@/public/placeholder/pl1.jpg";
import pl2 from "@/public/placeholder/pl2.jpg";
import pl3 from "@/public/placeholder/pl3.jpg";
import pl4 from "@/public/placeholder/pl4.jpg";
import pl5 from "@/public/placeholder/pl5.jpg";
import pl6 from "@/public/placeholder/pl6.jpg";
import pl7 from "@/public/placeholder/pl7.jpg";
import pl8 from "@/public/placeholder/pl8.jpg";
import pl9 from "@/public/placeholder/pl9.jpg";
import pl10 from "@/public/placeholder/pl10.jpg";
import pl11 from "@/public/placeholder/pl11.jpg";
import pl12 from "@/public/placeholder/pl12.jpg";
import { StaticImageData } from "next/image";

export const generateRandomPlaceholderImages: (
  n: number
) => StaticImageData[] = (n) => {
  const images = [
    pl1,
    pl2,
    pl3,
    pl4,
    pl5,
    pl6,
    pl7,
    pl8,
    pl9,
    pl10,
    pl11,
    pl12,
  ];

  const result: StaticImageData[] = [];

  while (result.length < n) {
    const shuffledImages = [...images].sort(() => Math.random() - 0.5);
    result.push(...shuffledImages);
  }

  return result.slice(0, n);
};
