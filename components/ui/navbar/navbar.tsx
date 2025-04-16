import Image from "next/image";
import signatureSrc from "@/public/ui/signature.svg";
import navbarStyle from "./navbar.module.css";

export default function Navbar() {
  return (
    <nav className="sticky top-0 flex items-center h-18 bg-contrast">
      <div className="px-8 h-full grid items-center relative group">
        <Image
          className="h-14 w-auto absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 opacity-50"
          src={signatureSrc}
          alt="The William Blake Archive Signature"
        />
        <div className="text-xl uppercase tracking-widest relative transition-colors group-hover:text-intense duration-300 ease-out">
          The William Blake Archive
        </div>
      </div>
      <div className="flex-grow invisible pointer-events-none select-none h-0" />
      <ul
        className={`flex gap-2 text-sm ${navbarStyle.navigation} h-full flex items-center`}
      >
        <li>Illuminated Books</li>
        <li>Commercial Book Illustrations</li>
        <li>Separate Prints and Prints in Series</li>
        <li>Paintings and Drawings</li>
      </ul>
    </nav>
  );
}
