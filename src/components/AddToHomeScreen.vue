<template>
  <div>
    <template v-if="$root.localeCN">
      <h2>添加到主屏幕</h2>
      <p>可将本工具箱添加到主屏幕作为 APP 在离线环境下使用，图片资源需要实际加载过一次后方可在离线状态下显示</p>
      <p>若您是首次打开该工具箱，可能需要等待所有资源缓存完毕后才能添加</p>
      <div class="mdui-panel mdui-panel-gapless" mdui-panel>
        <div class="mdui-panel-item">
          <div class="mdui-panel-item-header">
            <div class="mdui-panel-item-title" style="width: auto;">各平台添加方法</div>
            <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
          </div>
          <div class="mdui-panel-item-body">
            <h4 class="mdui-m-t-1 h-ul">Chrome</h4>
            <button
              class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink-accent mdui-m-b-2"
              @click="$root.installPWA"
              :disabled="$root.deferredPrompt === false"
              >添加到主屏幕</button
            >
            <p>请尝试点击（如果可点击的话）</p>
            <h4 class="h-ul">Windows - Chrome</h4>
            <p
              >点击浏览器右上方的<i class="mdui-icon material-icons">more_vert</i>按钮，选择<code
                >安装“明日方舟工具箱”</code
              ></p
            >
            <h4 class="h-ul">Android - Chrome</h4>
            <p
              >点击浏览器右上方的<i class="mdui-icon material-icons">more_vert</i>按钮，选择<code>添加到主屏幕</code></p
            >
            <h4 class="h-ul">iOS ≥ 11.3</h4>
            <p
              >使用 Safari 浏览器打开本页面，点击浏览器底部的分享按钮<i class="mdui-icon material-icons">crop_5_4</i
              ><i class="mdui-icon material-icons" style="margin-left: -24px; margin-top: -20px;">arrow_upward</i
              >，选择<code>添加到主屏幕</code>，接着点击右上角的“添加”即可</p
            >
          </div>
        </div>
      </div>
    </template>
    <template v-else-if="$root.localeTW">
      <h2>加到主畫面</h2>
      <p>可將本工具箱加到主畫面作為 APP 在離線環境下使用，圖片資源需要實際加載過一次後方可在離線狀態下顯示</p>
      <p>若您是首次打開該工具箱，可能需要等待所有資源緩存完畢後才能添加</p>
      <div class="mdui-panel mdui-panel-gapless" mdui-panel>
        <div class="mdui-panel-item">
          <div class="mdui-panel-item-header">
            <div class="mdui-panel-item-title" style="width: auto;">添加方法</div>
            <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
          </div>
          <div class="mdui-panel-item-body">
            <h4 class="mdui-m-t-1 h-ul">Chrome</h4>
            <button
              class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink-accent mdui-m-b-2"
              @click="$root.installPWA"
              :disabled="$root.deferredPrompt === false"
              >加到主畫面</button
            >
            <p>請嘗試點擊（如果可點擊的話）</p>
            <h4 class="h-ul">Windows - Chrome</h4>
            <p
              >點擊瀏覽器右上方的<i class="mdui-icon material-icons">more_vert</i>按鈕，選擇<code
                >安裝「明日方舟工具箱」</code
              ></p
            >
            <h4 class="h-ul">Android - Chrome</h4>
            <p>點擊瀏覽器右上方的<i class="mdui-icon material-icons">more_vert</i>按鈕，選擇<code>加到主畫面</code></p>
            <h4 class="h-ul">iOS ≥ 11.3</h4>
            <p
              >使用 Safari 瀏覽器打開本頁面，點擊瀏覽器底部的分享按鈕<i class="mdui-icon material-icons">crop_5_4</i
              ><i class="mdui-icon material-icons" style="margin-left: -24px; margin-top: -20px;">arrow_upward</i
              >，選擇<code>加入主畫面</code>，然後點擊右上角的「新增」即可</p
            >
          </div>
        </div>
      </div>
    </template>
    <template v-else-if="$root.localeIs('jp')">
      <h2>ホーム画面に追加</h2>
      <p>ホーム画面に追加して、インタネットに接続されてなくてもご利用できますが、画像一回読み込むことが必要です。</p>
      <p>初めての方は一回全てのデータを読み込んだ後でご利用できます。</p>
      <div class="mdui-panel mdui-panel-gapless" mdui-panel>
        <div class="mdui-panel-item">
          <div class="mdui-panel-item-header">
            <div class="mdui-panel-item-title" style="width: auto;">各端末追加の方法</div>
            <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
          </div>
          <div class="mdui-panel-item-body">
            <h4 class="mdui-m-t-1 h-ul">Chrome</h4>
            <button
              class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink-accent mdui-m-b-2"
              @click="$root.installPWA"
              :disabled="$root.deferredPrompt === false"
              >ホーム画面に追加</button
            >
            <p>お試しください（もし使えたら）</p>
            <h4 class="h-ul">Windows - Chrome</h4>
            <p
              >ブラウザの右上にある<i class="mdui-icon material-icons">more_vert</i
              >ボタンをクリックして、<code>“明日方舟工具箱”をインストール</code>をクリックしてください</p
            >
            <h4 class="h-ul">Android - Chrome</h4>
            <p
              >ブラウザの右上にある<i class="mdui-icon material-icons">more_vert</i
              >ボタンをクリックして、<code>ホーム画面に追加</code>をクリックしてください</p
            >
            <h4 class="h-ul">iOS ≥ 11.3</h4>
            <p
              >「Safari」でこのページを開いて，ブラウザの下にある<i class="mdui-icon material-icons">crop_5_4</i
              ><i class="mdui-icon material-icons" style="margin-left: -24px; margin-top: -20px;">arrow_upward</i
              >ボタンをクリックして，<code>ホーム画面に追加</code>をクリックして，右上の「追加」をクリックしてください</p
            >
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <h2>Add to Home Screen</h2>
      <p
        >You can add this toolbox to home screen and use it as an APP even when offline, but images can only be
        displayed offline after being loaded once.</p
      >
      <p
        >If you are launching for the first time, you may need to wait for all resources to be cached before adding to
        home page.</p
      >
      <div class="mdui-panel mdui-panel-gapless" mdui-panel>
        <div class="mdui-panel-item">
          <div class="mdui-panel-item-header">
            <div class="mdui-panel-item-title" style="width: auto;">Guides</div>
            <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
          </div>
          <div class="mdui-panel-item-body">
            <h4 class="mdui-m-t-1 h-ul">Chrome</h4>
            <button
              class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink-accent mdui-m-b-2"
              @click="$root.installPWA"
              :disabled="$root.deferredPrompt === false"
              >Add to Home Screen</button
            >
            <p>Click that button if avaliable.</p>
            <h4 class="h-ul">Windows - Chrome</h4>
            <p
              >Click the <i class="mdui-icon material-icons">more_vert</i> button on the top right of browser, then
              click <code>Install "明日方舟工具箱"</code>.</p
            >
            <h4 class="h-ul">Android - Chrome</h4>
            <p
              >Click the <i class="mdui-icon material-icons">more_vert</i> button on the top right of browser, then
              click <code>Add to home screen</code>.</p
            >
            <h4 class="h-ul">iOS ≥ 11.3</h4>
            <p
              >Visit this site with Safari, then click the share button <i class="mdui-icon material-icons">crop_5_4</i
              ><i class="mdui-icon material-icons" style="margin-left: -24px; margin-top: -20px;">arrow_upward</i> at
              the bottom of the browser and click <code>Add to home screen</code>.</p
            >
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'add-to-home-screen',
};
</script>
