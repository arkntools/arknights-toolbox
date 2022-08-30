import Vue from 'vue';
import * as formatter from '@/utils/formatter';

declare module 'vue/types/vue' {
  interface Vue {
    $formatter: typeof formatter;
  }
}
