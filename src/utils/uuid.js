import { v4 } from 'uuid';
export default () => v4().replace(/-/g, '');
