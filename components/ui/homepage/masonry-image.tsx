import Image, { StaticImageData } from "next/image";
import imageStyle from "./image.module.css";

interface Props {
  src: StaticImageData;
}

export default function MasonryImage({ src }: Props) {
  return (
    <div className="bg-highlight/80 shadow-lg/15 rounded-2xl backdrop-blur-2xl group relative">
      <Image
        src={src}
        alt="Placeholder image"
        className="object-cover object-center w-full h-full absolute rounded-2xl"
      />
      <div
        className={`w-full h-full bg-transparent pointer-events-none select-none border-reflect rounded-2xl relative ${imageStyle.borderAdjust}`}
      />
      <div className="absolute bottom-6 w-full space-y-2">
        <div
          className={`w-[min(85%,10rem)] px-2.5 py-1.5 text-sm text-intense bg-highlight/65 shadow-md backdrop-blur-md rounded-full border-reflect ${imageStyle.transition} opacity-0 group-hover:opacity-100 duration-300 ease-out translate-x-4 scale-[0.87] group-hover:scale-100 translate-y-7 group-hover:translate-y-0 delay-[310ms] group-hover:delay-[50ms] ${imageStyle.positiveBorder}`}
        >
          Description 1
        </div>
        <div
          className={`w-[min(85%,10rem)] px-2.5 py-1.5 text-sm text-highlight bg-accent/65 shadow-md backdrop-blur-md rounded-full border-reflect ${imageStyle.transition} opacity-0 group-hover:opacity-100 duration-300 ease-out translate-x-4 scale-[0.93] group-hover:scale-100 translate-y-5 group-hover:translate-y-0 delay-[250ms] group-hover:delay-[110ms] ${imageStyle.negativeBorder}`}
        >
          Description 2
        </div>
      </div>
    </div>
  );
}
