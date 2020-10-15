# 明日方舟工具箱

支持国服、台服、国际服、日服、韩服，选语言即可切换，工具箱数据在解包更新时会自动同步更新

宗旨是简洁美观且对移动设备友好，以及 Material Design 天下第一（。）

该工具箱已 PWA 化，可在各平台下添加到主屏幕作为 APP 在离线环境下使用

如果有好的想法、建议、希望增加的功能，或者发现了 bug，欢迎到项目中提 issue 或 pr

觉得好用的话记得向朋友推荐一下呀~

## 使用

目前成品部署在 [arkn.lolicon.app](https://arkn.lolicon.app)

## 主要功能

- 公开招募计算 + 词条截图识别
- 精英材料计算 + 导入干员材料预设 + 素材获取最优策略规划
- 干员升级计算
- 基建技能筛选

※ 如果公招词条识别出现遗漏现象且您愿意帮助我改进结果，请提交 issue，附上词条截图和浏览器 console 中的 OCR 输出

## 数据源及鸣谢

- [Kengxxiao/ArknightsGameData](https://github.com/Kengxxiao/ArknightsGameData)（数据）
- [灰格猫](https://github.com/graueneko)（基础数据）
- [PRTS Wiki](http://prts.wiki/)（干员头像、材料图片）
- [ark-nights.com](https://github.com/Houdou/arkgraph)（材料图片）
- [企鹅物流数据统计](https://penguin-stats.io/)（掉落数据）
- [素材获取最优策略规划](https://bbs.nga.cn/read.php?tid=17507710)（思路）
- 跳转到 wiki
  - CN & TW - [PRTS Wiki](http://prts.wiki/)（很棒的 wiki，大家有条件可以打钱支持一下）
  - US - [GamePress](https://gamepress.gg/arknights/)
  - JP - [GamerClub](https://wiki.gamerclub.jp/anwiki/)
  - KR - [Namu Wiki](https://namu.wiki/)

[组织](https://github.com/arkntools)头像及本项目[应用图标](public/assets/icons)由[冬夏](https://www.pixiv.net/users/8745555)绘制并授权使用

本项目所使用的游戏资源（包括但不限于：游戏图片、文本原文或其转译版本等）仅用于更好地表现游戏资料、增强用户体验，其版权属于上海鹰角网络科技有限公司和其关联公司

## Help Us Translate

| Language | Progress |
| -------- | :------: |
| English  |   100%   |
| Japanese |   100%   |
| Korean   |   15%    |

----------

If you know about English / Japanese / Korean, and are willing to help us to translate some interface text, or improving translation, you can fork this project and then create a pull request after your translation is complete. I will show all contributors in the home page of this toolbox.

All locale files are in `src\locales\{lang}\_.json`. You can refer to the translated file (please refer to English mainly) for translating.

In addition, there are some components, which also has translation requirements. Their locations are listed below. You can open an issue to tell me the translation if you don't know Vue.js.

- `src\components\AddToHomeScreen.vue`
- `src\components\MaterialReadme.vue`

----------

如果您对繁中/英语/日语/韩语有所了解，有意向帮助本项目翻译界面文字，或者改进原有翻译（英语是我一手渣翻……），可 fork 本项目进行翻译，完成后向本项目发起 pull request，我会将所有贡献者展示在工具箱首页中

语言文件位于`src\locales\{lang}\_.json`，可参照已有的语言文件（请主要参照英语）来翻译

另外有一些小部件也有翻译需求，它们的位置会在下面列出，如果您不了解 Vue.js，可以直接开一个 issue 来告知我译文

- `src\components\AddToHomeScreen.vue`
- `src\components\MaterialReadme.vue`

## Contributors

[![contributors](https://contributors-img.web.app/image?repo=arkntools/arknights-toolbox)](https://github.com/arkntools/arknights-toolbox/graphs/contributors)

## Development

Importent! Please see [wiki](../../wiki).
