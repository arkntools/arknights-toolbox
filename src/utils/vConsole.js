export const VConsoleLoaded = () => !!window.VConsole;

export const loadVConsole = async () => {
  if (VConsoleLoaded()) return;
  await import(
    /* webpackIgnore: true */ 'https://unpkg.com/@arkntools/vconsole@3.9.5/dist/vconsole.min.js'
  );
  new window.VConsole();
};
