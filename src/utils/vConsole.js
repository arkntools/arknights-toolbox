export const VConsoleLoaded = () => !!window.VConsole;

export const loadVConsole = async () => {
  if (VConsoleLoaded()) return;
  await import(
    /* webpackIgnore: true */ 'https://fastly.jsdelivr.net/npm/vconsole@3.14.6/dist/vconsole.min.js'
  );
  new window.VConsole();
};
