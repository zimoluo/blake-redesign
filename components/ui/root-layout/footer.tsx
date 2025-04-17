import Link from "next/link";
import clsx from "clsx";
import footerStyle from "./footer.module.css";
import { Fragment } from "react";

const topNavLinks = [
  { href: "#", label: "Blog" },
  { href: "#", label: "Quarterly" },
  {
    href: "#",
    label: "The Complete Poetry and Prose of William Blake, Ed. Erdman",
  },
];

const infoLinks = [
  "What\u2019s New",
  "About Blake",
  "Resources for Further Research",
  "About the Archive",
  "Copyright and Permissions",
  "Contact the Archive",
  "Related Sites",
].map((label) => ({ href: "#", label }));

const Separator = () => (
  <div className="hidden md:block h-full w-0.25 bg-intense rounded-full" />
);

export default function Footer() {
  return (
    <div className="flex justify-center">
      <footer
        className={clsx(
          footerStyle.outerBg,
          "md:rounded-[1.5rem_1.5rem_0_0] z-10 backdrop-blur-2xl border-reflect w-full md:w-[min(85svw,75rem)]",
          footerStyle.borderAdjust,
          "pt-2 px-0 md:px-2 pb-0 shadow-2xl/15"
        )}
      >
        <div
          className={clsx(
            "border-reflect bg-contrast/75 w-full md:rounded-[1rem_1rem_0_0]",
            footerStyle.inner,
            "shadow-lg/5 pt-6 md:pt-8 pb-18 px-4 space-y-12"
          )}
        >
          <div className="flex flex-col md:flex-row items-center justify-center md:h-7 text-center px-8 md:px-0 uppercase gap-4 text-dark text-lg">
            <Separator />
            {topNavLinks.map(({ href, label }) => (
              <Fragment key={label}>
                <Link
                  href={href}
                  className="hover:underline underline-offset-2"
                >
                  {label}
                </Link>
                <Separator />
              </Fragment>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 items-center justify-center gap-4 px-2 md:px-4 text-sm text-primary/75 text-center">
            {infoLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="hover:underline underline-offset-2"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="px-16 py-4">
            <hr className="w-full h-0.25 border-0 bg-intense rounded-full" />
          </div>

          <div className="text-lg md:text-xl whitespace-nowrap font-logo text-center uppercase tracking-widest relative transition-colors text-dark duration-300 ease-out leading-0">
            The William Blake Archive
          </div>
        </div>
      </footer>
    </div>
  );
}
