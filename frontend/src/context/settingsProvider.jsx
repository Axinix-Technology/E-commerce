import React, { createContext, useContext, useState, useEffect } from "react";
import populateApi from "../api/populate.api";
import { setCurrencyConfig, getCurrencyConfig } from "../utils/formatters";

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem("general_settings");
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await populateApi.read("general_setting", {
        limit: 100,
        filter: { status: 1 }
      });

      if (res?.data && Array.isArray(res.data)) {
        const settingsMap = {};
        res.data.forEach((item) => {
          settingsMap[item.key] = item.value;
        });

        setSettings(settingsMap);
        localStorage.setItem("general_settings", JSON.stringify(settingsMap));

        // Update currency configuration dynamically
        setCurrencyConfig({
          code: settingsMap.currency_code || "INR",
          symbol: settingsMap.currency_symbol || "₹",
          format: settingsMap.currency_format || "INR",
          position: settingsMap.currency_position || "prefix",
          decimals: settingsMap.decimal_places ? Number(settingsMap.decimal_places) : 2,
        });
      }
    } catch (err) {
      console.warn("Failed to load general settings from backend:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings, currency: getCurrencyConfig() }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    return {
      settings: {},
      loading: false,
      currency: getCurrencyConfig(),
      refreshSettings: () => {},
    };
  }
  return ctx;
};
