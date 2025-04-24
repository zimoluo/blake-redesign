"use client";

import React, { memo } from "react";
import { usePathname } from "next/navigation";

// so the news bar only shows on the landing page. because it's nested in the navbar i can't simply put this on the page.tsx or anything like that
// the viable solution for now is to just use usePathname and check if it's the home page but this is not the most elegant solution as it uses rerender and client component
// there is a more complicated solution that avoids this. create a custom layout under root layout that injects the news bar using props, which will require custom props and stuff and i'm not sure if it works at all.
// so for now we'll stick to this solution. it hurts performance minimally.

interface Props {
  children?: React.ReactNode;
}

function NewsBarWrapper({ children }: Props) {
  const pathname = usePathname();
  return pathname === "/" ? <>{children}</> : null;
}

export default memo(NewsBarWrapper);
