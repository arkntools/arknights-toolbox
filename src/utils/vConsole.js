export const vConsoleLoaded = () => !!window.VConsole;

export const loadVConsole = async () => {
  if (vConsoleLoaded()) return;
  await import(
    /* webpackIgnore: true */ 'https://fastly.jsdelivr.net/npm/vconsole@3.15.1/dist/vconsole.min.js'
  );
  new window.VConsole();
};
