<template>
  <div id="theme-select" class="mdui-m-b-2">
    <table class="thin-table mdui-m-b-0">
      <tbody>
        <tr>
          <td class="no-wrap"
            ><span class="inline-block mdui-m-r-2">{{ $t('home.setting.appearance') }}</span></td
          >
          <td>
            <label class="mdui-radio mdui-p-l-3 mdui-m-r-3" v-for="(value, key) in $root.themeEnum" :key="key">
              <input type="radio" name="theme-select" :value="value" v-model="$root.themeSetting" />
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
};
</script>
