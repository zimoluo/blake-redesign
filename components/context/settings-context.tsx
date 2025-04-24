"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { defaultSettings } from "@/lib/constants";

const localStorageKey = "website-settings-blake";

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
      obj[key] = rawSettings[key] as any;
      return obj;
    }, {} as Partial<SettingsState>);
};

const SettingsContext = createContext<
  | {
      settings: SettingsState;
      updateSettings: (newSettings: Partial<SettingsState>) => void;
      toggleSettings: (key: keyof SettingsState) => void;
    }
  | undefined
>(undefined);

export const SettingsProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  useEffect(() => {
    const raw = localStorage.getItem(localStorageKey);
    const loadedSettings = parseStoredSettings(raw || "") || {};

    updateSettings(loadedSettings);
  }, []);

  useEffect(() => {
    const toStore = JSON.stringify(purgeInvalidEntries(settings));
    localStorage.setItem(localStorageKey, toStore);
  }, [settings]);

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
    () => ({ settings, updateSettings, toggleSettings }),
    [settings]
  );

  return <SettingsContext value={contextValue}>{children}</SettingsContext>;
};

export const useSettings = () => {
  const context = use(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
