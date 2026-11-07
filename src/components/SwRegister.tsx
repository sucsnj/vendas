"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

export function SwRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (Capacitor.getPlatform() !== "web") {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
        .catch(() => {});
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
