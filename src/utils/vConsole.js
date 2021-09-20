export const VConsoleLoaded = () => !!window.VConsole;

export const loadVConsole = async () => {
  if (VConsoleLoaded()) return;
  await import(
    /* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/@arkntools/vconsole@3.9.1/dist/vconsole.min.js'
  );
  new window.VConsole();
};
