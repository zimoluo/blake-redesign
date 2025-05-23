"use client";

import {
  createContext,
  ReactNode,
  SetStateAction,
  useState,
  Dispatch,
  use,
  useMemo,
} from "react";

type Props = {
  children?: ReactNode;
};

export const NavbarControlContext = createContext<
  | {
      isNavbarMenuOpen: boolean;
      setIsNavbarMenuOpen: Dispatch<SetStateAction<boolean>>;
      toggleNavbarMenu: () => void;
      selectedNavbarMenuIndex: number;
      setSelectedNavbarMenuIndex: Dispatch<SetStateAction<number>>;
    }
  | undefined
>(undefined);

export function NavbarControlProvider({ children }: Props) {
  const [isNavbarMenuOpen, setIsNavbarMenuOpen] = useState(false);
  const [selectedNavbarMenuIndex, setSelectedNavbarMenuIndex] = useState(0);

  const toggleNavbarMenu = () => {
    setIsNavbarMenuOpen((prev) => !prev);
  };

  const contextValue = useMemo(
    () => ({
      isNavbarMenuOpen,
      setIsNavbarMenuOpen,
      toggleNavbarMenu,
      selectedNavbarMenuIndex,
      setSelectedNavbarMenuIndex,
    }),
    [isNavbarMenuOpen, selectedNavbarMenuIndex]
  );

  return (
    <NavbarControlContext value={contextValue}>{children}</NavbarControlContext>
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
