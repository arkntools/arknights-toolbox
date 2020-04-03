<template>
  <div id="theme-select" class="mdui-m-b-2">
    <table class="thin-table mdui-m-b-0">
      <tbody>
        <tr>
          <td class="no-wrap"><span class="inline-block mdui-m-r-2">{{ $t('home.setting.appearance') }}</span></td>
          <td>
            <label class="mdui-radio mdui-p-l-3 mdui-m-r-3" v-for="(value, key) in themeEnum" :key="key">
              <input type="radio" name="theme-select" :value="value" v-model="setting" />
              <i class="mdui-radio-icon"></i>
              {{ $t(`home.setting.appearanceList.${key}`) }}
            </label>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'theme-select',
  data: () => ({
    themeEnum: {
      light: 0,
      dark: 1,
      followSystem: 2,
    },
  }),
  computed: {
    setting: {
      get() {
        const { light, dark, followSystem } = this.themeEnum;
        const { darkTheme, darkThemeFollowSystem } = this.$root.setting;
        if (darkTheme) {
          if (darkThemeFollowSystem) return followSystem;
          return dark;
        }
        return light;
      },
      set(val) {
        const { light, dark, followSystem } = this.themeEnum;
        const setting = this.$root.setting;
        switch (val) {
          case light:
            setting.darkTheme = false;
            break;
          case dark:
            setting.darkTheme = true;
            setting.darkThemeFollowSystem = false;
            break;
          case followSystem:
            setting.darkTheme = true;
            setting.darkThemeFollowSystem = true;
            break;
        }
      },
    },
  },
};
</script>

<style>
</style>
