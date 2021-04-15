const _ = require('lodash');
const css = require('css');

const getCssObj = className2color => ({
  type: 'stylesheet',
  stylesheet: {
    rules: [
      {
        type: 'rule',
        selectors: [':root'],
        declarations: _.map(className2color, (value, className) => ({
          type: 'declaration',
          property: `--color-${className}`,
          value,
        })),
      },
      ..._.flatMap(Object.keys(className2color), className => [
        {
          type: 'rule',
          selectors: [`.${className}`],
          declarations: [
            {
              type: 'declaration',
              property: 'color',
              value: `var(--color-${className})`,
            },
          ],
        },
        {
          type: 'rule',
          selectors: [`.riic-term .${className}:before`],
          declarations: [
            {
              type: 'declaration',
              property: 'background-color',
              value: `var(--color-${className})`,
            },
          ],
        },
      ]),
    ],
  },
});

module.exports = className2color => css.stringify(getCssObj(className2color));
