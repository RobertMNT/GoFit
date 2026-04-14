// Instrumentation hook de Next.js 15 — se ejecuta al arrancar el servidor
// Parcha el localStorage roto que Node.js 22+ crea cuando --localstorage-file recibe un path inválido
export async function register() {
  if (typeof globalThis.localStorage !== "undefined") {
    try {
      globalThis.localStorage.getItem("__probe__");
    } catch {
      // localStorage existe pero lanza en cualquier operación — reemplazar por implementación en memoria
      const _store: Record<string, string> = {};
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        writable: true,
        value: {
          getItem: (key: string) => _store[key] ?? null,
          setItem: (key: string, value: string) => {
            _store[key] = String(value);
          },
          removeItem: (key: string) => {
            delete _store[key];
          },
          clear: () => {
            Object.keys(_store).forEach((k) => delete _store[k]);
          },
          key: (index: number) => Object.keys(_store)[index] ?? null,
          get length() {
            return Object.keys(_store).length;
          },
        } as Storage,
      });
    }
  }
}
