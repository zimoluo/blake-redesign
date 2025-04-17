"use client";

import {
  createContext,
  ReactNode,
  SetStateAction,
  useState,
  Dispatch,
  use,
} from "react";

type Props = {
  children?: ReactNode;
};

export const NavbarControlContext = createContext<
  | {
      isNavbarMenuOpen: boolean;
      setIsNavbarMenuOpen: Dispatch<SetStateAction<boolean>>;
      toggleNavbarMenu: () => void;
    }
  | undefined
>(undefined);

export function NavbarControlProvider({ children }: Props) {
  const [isNavbarMenuOpen, setIsNavbarMenuOpen] = useState(false);

  const toggleNavbarMenu = () => {
    setIsNavbarMenuOpen((prev) => !prev);
  };

  return (
    <NavbarControlContext
      value={{
        isNavbarMenuOpen,
        setIsNavbarMenuOpen,
        toggleNavbarMenu,
      }}
    >
      {children}
    </NavbarControlContext>
  );
}

export const useNavbarControl = () => {
  const context = use(NavbarControlContext);
  if (context === undefined) {
    throw new Error(
      "useNavbarControl must be used within a NavbarControlProvider"
    );
  }
  return context;
};
