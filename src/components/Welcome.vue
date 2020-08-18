<template>
  <div>
    <template v-if="$root.localeCN">
      <p
        >目前支持国服、台服、国际服、日服、韩服，可在下方设置中切换<br />若有意愿帮助本项目翻译或改进翻译，请前往 GitHub
        阅读 README，谢谢</p
      >
      <p
        >如果有好的想法、建议、希望增加的功能，或者发现了 bug，欢迎提
        <a href="https://github.com/arkntools/arknights-toolbox/issues" target="_blank">issue</a> 或 pr</p
      >
      <p>觉得好用的话记得向朋友推荐一下呀~</p>
    </template>
    <template v-else-if="$root.localeTW">
      <p
        >現支持國服、台服、國際服、日服、韓服，可在下方設定中切換<br />若有意願幫助本項目翻譯或改進翻譯，請前往 GitHub
        閱讀 README，謝謝</p
      >
      <p
        >如果有好的想法、建議、希望新增的功能，或者發現了 bug，歡迎發起
        <a href="https://github.com/arkntools/arknights-toolbox/issues" target="_blank">issue</a> 或 pr</p
      >
      <p>覺得好用的話記得跟朋友推薦一下呀~</p>
    </template>
    <template v-else>
      <p
        >Support all servers, you can change it in the settings below.<br />If you are willing to help us to translate
        or improve translation, please read the README on GitHub, thanks.</p
      >
      <p
        >Welcome to submit <a href="https://github.com/arkntools/arknights-toolbox/issues" target="_blank">issue</a> or
        pull request if you have good ideas, suggestions, or find some bugs.</p
      >
      <p>If you think this toolbox helps you well, just recommend to your friends!</p>
    </template>
  </div>
</template>
