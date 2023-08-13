type PromisedFunction<T> = T extends Function
  ? (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>
  : T;

type ComlinkObject<T> = {
  [K in keyof T]: PromisedFunction<T[K]>;
};
