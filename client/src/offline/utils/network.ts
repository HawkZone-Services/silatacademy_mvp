// src/shared/sync/network.ts
export const isOnline = () => {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
};

export const onNetworkChange = (cb: (online: boolean) => void) => {
  const on = () => cb(true);
  const off = () => cb(false);

  window.addEventListener("online", on);
  window.addEventListener("offline", off);

  return () => {
    window.removeEventListener("online", on);
    window.removeEventListener("offline", off);
  };
};
