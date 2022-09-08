/* eslint-disable */

// avatar
(async () => {
  const getThumbAvatar = url => {
    if (url.indexOf('/thumb/') !== -1) {
      const paths = url.split('/');
      paths[paths.length - 1] = '80px-';
      return paths.join('/');
    }
    return `${url.replace('/images/', '/images/thumb/').replace(/^\/\//, 'http://')}/80px-`;
  };
  const avatarImgMap = _.transform(
    await get(PRTS_URL.HOME).then(html => {
      const $ = Cheerio.load(html, { decodeEntities: false });
      return Array.from($('.mp-operators-content:contains(近期新增) a')).map(a => $(a));
    }),
    (obj, $a) => {
      const name = $a.attr('title');
      const avatar = $a.find('#charicon').attr('data-src');
      if (name && avatar) obj[name] = getThumbAvatar(avatar);
    },
    {},
  );
  if (missList.some(id => !(nameId2Name[id] in avatarImgMap))) {
    await get(PRTS_URL.CHAR_LIST)
      .then(html => {
        const $ = Cheerio.load(html, { decodeEntities: false });
        const newOperators = Array.from($('.smwdata'));
        newOperators.forEach(data => {
          const $data = $(data);
          const name = $data.attr('data-cn');
          const avatar = $data.attr('data-icon');
          if (name && avatar) avatarImgMap[name] = getThumbAvatar(avatar);
        });
      })
      .catch(console.error);
  }
  const name2Id = _.invert(nameId2Name);
  for (const name in name2Id) {
    if (name in avatarImgMap) {
      const id = name2Id[name];
      // Use download() instead of downloadTinied() if quota of TinyPng exceeded
      // A method has been taken to bypass the quota limit
      await downloadTinied(
        avatarImgMap[name],
        Path.join(AVATAR_IMG_DIR, `${id}.png`),
        `Download ${avatarImgMap[name]} as ${id}.png`,
      ).catch(console.error);
    }
  }
})();

// item
(async () => {
  const itemName2Id = _.invert(itemId2Name);
  const getOriginItemImg = url => url.replace('/thumb/', '/').replace(/\/\d+px.*$/, '');
  const itemImgMap = _.transform(
    await get(PRTS_URL.ITEM_LIST).then(html => {
      const $ = Cheerio.load(html, { decodeEntities: false });
      return Array.from($('.smwdata')).map(el => $(el));
    }),
    (obj, $el) => {
      const name = $el.attr('data-name');
      const url = $el.attr('data-file');
      if (name in itemName2Id && url) obj[itemName2Id[name]] = getOriginItemImg(url);
    },
    {},
  );
  for (const [id, url] of Object.entries(_.pick(itemImgMap, missIdList))) {
    // Use download() instead of downloadTinied() if quota of TinyPng exceeded
    // A method has been taken to bypass the quota limit
    await downloadTinied(
      url,
      Path.join(ITEM_IMG_DIR, `${id}.png`),
      `Download ${url} as ${id}.png`,
    ).catch(console.error);
  }
  // 二次检查
  missIdList = itemIdList.filter(id => !Fse.existsSync(Path.join(ITEM_IMG_DIR, `${id}.png`)));
  if (missIdList.length) {
    ac.setOutput('need_retry', true);
    console.warn('Some item images have not been downloaded.');
  }
})();
