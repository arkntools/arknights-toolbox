export const VConsoleLoaded = () => !!window.VConsole;

export const loadVConsole = async () => {
  if (VConsoleLoaded()) return;
  await import(
    /* webpackIgnore: true */ 'https://unpkg.com/@arkntools/vconsole/dist/vconsole.min.js'
  );
  new window.VConsole();
};
