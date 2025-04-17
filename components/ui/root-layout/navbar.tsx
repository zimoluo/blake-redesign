import Image from "next/image";
import signatureSrc from "@/public/ui/signature.svg";
import navbarStyle from "./navbar.module.css";
import Link from "next/link";
import NavbarToggleButton from "./navbar-toggle-button";
import NavbarSecondaryMenuWrapper from "./navbar-secondary-menu-wrapper";
import NavbarSubmenuCategorySelector from "./navbar-submenu-category-selector";
import NavbarSearchBar from "./navbar-search-bar";
import InfoIcon from "../asset/info-icon";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-10">
      <div
        className={`flex items-center h-15 bg-contrast/80 backdrop-blur-2xl shadow-xl/5 border-reflect ${navbarStyle.borderAdjust}`}
      >
        <Link className="px-6 h-full grid items-center relative group" href="/">
          <Image
            className="h-12 w-auto absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 opacity-60 mix-blend-multiply"
            src={signatureSrc}
            alt="The William Blake Archive Signature"
          />
          <div className="text-xl font-logo uppercase tracking-widest relative transition-colors group-hover:text-intense duration-300 ease-out">
            The William Blake Archive
          </div>
        </Link>
        <div className="flex-grow invisible pointer-events-none select-none h-0" />
        <div className="flex items-center gap-6 mr-6">
          <InfoIcon className="h-6 w-6 hover:scale-110 transition-transform duration-300 ease-out" />
          <NavbarSearchBar />
          <NavbarToggleButton />
        </div>
      </div>

      <NavbarSecondaryMenuWrapper>
        <div className="h-full w-full bg-pastel/85 backdrop-blur-2xl text-dark shadow-xl/5">
          <NavbarSubmenuCategorySelector />
          <div className="w-full px-8 py-2">
            <hr className="w-full h-0.25 border-0 bg-accent/50" />
          </div>
        </div>
      </NavbarSecondaryMenuWrapper>

      <div
        className={`h-9 bg-accent/70 backdrop-blur-2xl shadow-xl/5 md:rounded-b-2xl w-full border-reflect ${navbarStyle.news} flex items-center justify-center`}
      >
        <div className="text-center text-highlight text-sm font-semibold">
          Latest Publication (02/28/25): Ghost of Abel and Homer
        </div>
      </div>
    </nav>
  );
}
