import Image from "next/image";
import signatureSrc from "@/public/ui/signature.svg";
import navbarStyle from "./navbar.module.css";
import Link from "next/link";
import NavbarToggleButton from "./navbar-toggle-button";
import NavbarSecondaryMenuWrapper from "./navbar-secondary-menu-wrapper";
import NavbarSubmenuCategorySelector from "./navbar-submenu-category-selector";
import NavbarSearchBar from "./navbar-search-bar";
import InfoIcon from "@/components/asset/info-icon";
import LightDarkModeToggle from "./light-dark-mode-toggle";
import NewsBarWrapper from "./news-bar-wrapper";

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-10">
      <div
        className={`flex items-center h-15 bg-contrast/80 backdrop-blur-2xl shadow-xl/5 border-reflect ${navbarStyle.borderAdjust} shrink-0`}
      >
        <Link
          className="px-4 md:px-6 h-full grid items-center relative group"
          href="/"
        >
          <Image
            className="h-9 md:h-12 w-auto absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 opacity-60 dark:opacity-30 mix-blend-multiply dark:mix-blend-lighten shrink-0"
            src={signatureSrc}
            alt="The William Blake Archive Signature"
          />
          <div className="text-lg md:text-xl whitespace-nowrap font-logo uppercase tracking-widest relative transition-colors group-hover:text-intense duration-300 ease-out">
            The William Blake Archive
          </div>
        </Link>
        <div className="flex-grow invisible pointer-events-none select-none h-0" />
        <div className="flex items-center gap-4 md:gap-6 mr-4 md:mr-6">
          <LightDarkModeToggle className="hidden md:block" />
          <button>
            <InfoIcon className="h-6 w-6 hidden md:block hover:scale-110 transition-transform duration-300 ease-out" />
          </button>
          <NavbarSearchBar className="hidden md:block" />
          <NavbarToggleButton />
        </div>
      </div>

      <NavbarSecondaryMenuWrapper>
        <div className="h-full w-full bg-pastel/85 backdrop-blur-2xl text-dark">
          <div className="md:hidden flex items-center justify-center pt-7 pb-5 gap-6">
            <LightDarkModeToggle strokeClassName="stroke-dark" />
            <NavbarSearchBar alwaysExpanded={true} />
            <button>
              <InfoIcon
                className="h-6 w-6 hover:scale-110 transition-transform duration-300 ease-out"
                strokeClassName="stroke-dark"
              />
            </button>
          </div>
          <NavbarSubmenuCategorySelector />
          <div className="w-full px-8 py-2">
            <hr className="w-full h-0.25 border-0 bg-accent/50" />
            <div className="w-full flex justify-center items-center">
              <p className="font-bold opacity-50 text-accent text-lg p-4">
                Specific navigation goes here...
              </p>
            </div>
          </div>
        </div>
      </NavbarSecondaryMenuWrapper>

      <NewsBarWrapper>
        <div
          className={`h-9 bg-accent/70 backdrop-blur-2xl shadow-xl/5 md:rounded-b-2xl w-full border-reflect ${navbarStyle.news} flex items-center justify-center`}
        >
          <div className="text-center text-highlight text-sm font-semibold">
            Latest Publication (02/28/25): Ghost of Abel and Homer
          </div>
        </div>
      </NewsBarWrapper>
    </nav>
  );
}
