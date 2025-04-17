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
  <div className="h-full w-0.25 bg-intense rounded-full" />
);

export default function Footer() {
  return (
    <div className="flex justify-center">
      <footer
        className={clsx(
          footerStyle.outerBg,
          "rounded-[1.5rem_1.5rem_0_0] z-10 backdrop-blur-2xl border-reflect w-[min(85svw,75rem)]",
          footerStyle.borderAdjust,
          "p-2 pb-0 shadow-2xl/15"
        )}
      >
        <div
          className={clsx(
            "border-reflect bg-contrast/75 w-full rounded-[1rem_1rem_0_0]",
            footerStyle.inner,
            "shadow-lg/5 pt-8 pb-18 px-4 space-y-16"
          )}
        >
          <div className="flex items-center justify-center h-6 uppercase gap-4 text-dark text-lg">
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

          <div className="flex items-center justify-center h-4 gap-4 text-sm text-primary/75 text-center">
            {infoLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="hover:underline underline-offset-2 w-28"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="px-16 mt-18 mb-18">
            <hr className="w-full h-0.25 border-0 bg-intense rounded-full" />
          </div>

          <div className="text-xl text-center uppercase tracking-widest relative transition-colors text-dark duration-300 ease-out leading-0">
            The William Blake Archive
          </div>
        </div>
      </footer>
    </div>
  );
}
