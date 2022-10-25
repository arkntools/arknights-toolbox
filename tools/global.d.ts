import { AxiosStatic } from 'axios';

declare module 'axios' {
  declare const axios: AxiosStatic;
  export = axios;
}
