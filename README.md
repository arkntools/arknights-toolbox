# 明日方舟工具箱

目前支持国服、国际服、日服、韩服，选语言即可切换

目前依靠 GitHub Actions 自动部署在以下两个 Pages 服务，并且工具箱数据在解包更新时会自动同步更新

- **Coding Pages** - [arkn.lolicon.app](https://arkn.lolicon.app)
- **GitHub Pages** - [arkn-gh.lolicon.app](https://arkn-gh.lolicon.app)

宗旨是简洁美观且对移动设备友好，以及 Material Design 天下第一（。）

如果有好的想法、建议、希望增加的功能，或者发现了 BUG，欢迎到项目中提 issue 或提交 PR

该工具箱已 PWA 化，可在各平台下添加到主屏幕作为 APP 在离线环境下使用

## 主要功能

- 公开招募计算 + 词条截图识别
- 精英材料计算 + 导入干员材料预设 + 素材获取最优策略规划
- 干员升级计算
- 基建技能筛选

## 数据素材来源及鸣谢

- [Kengxxiao/ArknightsGameData](https://github.com/Kengxxiao/ArknightsGameData)（数据）
- [PRTS Wiki](http://ak.mooncell.wiki)（干员头像、跳转至干员详情）（很棒的 Wiki，大家可以多支持一下）
- [一只灰猫](https://github.com/graueneko/graueneko.github.io)（干员升级数据）
- [ark-nights.com](https://github.com/Houdou/arkgraph)（材料图片）
- [企鹅物流数据统计](https://penguin-stats.io/)（掉落数据）
- [素材获取最优策略规划](https://bbs.nga.cn/read.php?tid=17507710)（思路）

## 帮助翻译 Help Us Translate

如果您对英语/日语/韩语有所了解，有意向帮助本项目将一些界面文字翻译成日语/韩语，或者改进英语翻译（我的英语实在是太工地了555），可 fork 本项目进行翻译，完成后向本项目发起 pull request，届时我会将所有贡献者的 ID 和头像展示在 readme 以及工具箱首页中

语言文件位于`src\locales\{lang}\_.json`，可参照汉语(zh)和英语(en)的语言文件来翻译日语(ja)和韩语(ko)

另外有一个材料计算页面的说明也有翻译需求，位于`src\components\MaterialReadme.vue`，可以直接开一个 issue 来告知我译文

If you know about English / Japanese / Korean, and are interested in helping this project to translate some interface text into Japanese / Korean, or improving English translation (my English is too bad), you can fork this project for translation, and then create a pull request to this project after completion. I will show the ID and avatar of all contributors in readme and the home page of this toolbox.

All locale files are in `src\locales\{lang}\_.json`. You can refer to the file of Chinese (zh) and English (en) to translate Japanese (ja) and Korean (ko).

In addition, there is a description of material calculation page, which also has translation requirements, in `src\components\MaterialReadme.vue`. You can open an issue to let me know the translation.

## 开发

IMPORTANT! See [wiki](../../wiki).
