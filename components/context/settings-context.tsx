"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { defaultSettings } from "@/lib/constants";

const localStorageKey = "blake-website-settings";

const parseStoredSettings = (rawSettingsString: string): SettingsState => {
  if (!rawSettingsString) {
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(rawSettingsString) as Partial<SettingsState>;
    return { ...defaultSettings, ...purgeInvalidEntries(parsed) };
  } catch {
    console.warn("Could not parse stored settings, resetting to defaults");
    return defaultSettings;
  }
};

const purgeInvalidEntries = (
  rawSettings: Partial<SettingsState>
): Partial<SettingsState> => {
  return Object.keys(rawSettings)
    .filter((key): key is keyof SettingsState => key in defaultSettings)
    .reduce((obj, key) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      obj[key] = rawSettings[key] as any;
      return obj;
    }, {} as Partial<SettingsState>);
};

const SettingsContext = createContext<
  | {
      settings: SettingsState;
      updateSettings: (newSettings: Partial<SettingsState>) => void;
      toggleSettings: (key: keyof SettingsState) => void;
      mounted: boolean;
    }
  | undefined
>(undefined);

export const SettingsProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  const updateSettings = useCallback(
    (patch: Partial<SettingsState>) =>
      setSettings((prev) => ({ ...prev, ...patch })),
    []
  );

  // intended for boolean entries only
  const toggleSettings = useCallback(
    (key: keyof SettingsState) =>
      setSettings((prev) => ({
        ...prev,
        [key]: !prev[key],
      })),
    []
  );

  const contextValue = useMemo(
    () => ({ settings, updateSettings, toggleSettings, mounted }),
    [settings, updateSettings, toggleSettings, mounted]
  );

  useLayoutEffect(() => {
    const raw = localStorage.getItem(localStorageKey);
    const loadedSettings = parseStoredSettings(raw || "") || {};

    setMounted(true);
    updateSettings(loadedSettings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const toStore = JSON.stringify(purgeInvalidEntries(settings));
    localStorage.setItem(localStorageKey, toStore);
  }, [settings]);

  return <SettingsContext value={contextValue}>{children}</SettingsContext>;
};

export const useSettings = () => {
  const context = use(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
