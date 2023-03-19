const handler = require('serve-handler');
const { createServer } = require('http');
const { resolve } = require('path');
const { existsSync } = require('fs');

module.exports = {
  start: () => {
    const dataDir =
      process.env.ARKN_DATA_DIR || resolve(__dirname, '../../arknights-toolbox-data/dist');

    if (!existsSync(dataDir)) throw new Error(`Data dir not exist: ${dataDir}`);

    const server = createServer((request, response) =>
      handler(request, response, {
        public: resolve(__dirname, '../../arknights-toolbox-data/dist'),
      }),
    );

    server.listen(0, () => {
      const { port } = server.address();
      console.log(`Data server running at http://localhost:${port}`);
      module.exports.port = port;
    });
  },
};
