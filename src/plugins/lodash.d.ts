import Vue from 'vue';
import { LoDashStatic } from 'lodash';

declare module 'vue/types/vue' {
  interface Vue {
    $_: LoDashStatic;
  }
}
