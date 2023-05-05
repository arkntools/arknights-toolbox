const langMigration = {
  zh: 'cn',
  en: 'us',
  ja: 'jp',
  ko: 'kr',
};
Object.freeze(langMigration);

const langList = {
  cn: 'zh_CN',
  tw: 'zh_TW',
  us: 'en_US',
  jp: 'ja_JP',
  kr: 'ko_KR',
};
Object.freeze(langList);

const locales = [
  {
    short: 'cn',
    long: '简体中文',
  },
  {
    short: 'us',
    long: 'English',
  },
  {
    short: 'jp',
    long: '日本語',
  },
  {
    short: 'kr',
    long: '한국어',
  },
  {
    short: 'tw',
    long: '繁體中文',
  },
];
Object.freeze(locales);

const servers = ['cn', 'us', 'jp', 'kr'];

module.exports = {
  langMigration,
  langList,
  locales,
  servers,
};
