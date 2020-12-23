import _ from 'lodash';
import { snackbar } from 'mdui';

const getRandID = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

class Snackbar {
  constructor() {
    this.cur = null;
    this.queue = [];
  }

  get hasNext() {
    return this.queue.length;
  }

  get next() {
    return this.queue.shift();
  }

  open(message) {
    let params;
    switch (typeof message) {
      case 'string':
        params = { message };
        break;
      case 'object':
        params = { ...message };
        break;
      default:
        return { close: () => {} };
    }

    const { onOpened, onClosed } = params;
    params.iid = getRandID();
    params.onOpened = () => {
      onOpened?.();
      if (this.hasNext && !params.noSkip) {
        setTimeout(this.cur.close.bind(this.cur));
      }
    };
    params.onClosed = () => {
      onClosed?.();
      if (this.hasNext) {
        this.cur = snackbar(this.next);
      } else {
        this.cur = null;
      }
    };

    if (this.cur && this.cur.state !== 'closed') {
      this.queue.push(params);
      if (this.cur.state === 'opened' && !this.cur.options.noSkip) this.cur.close();
    } else {
      this.cur = snackbar(params);
    }

    return {
      close: () => this.close(params.iid),
    };
  }

  close(id) {
    _.remove(this.queue, ({ iid }) => iid === id);
    if (this.cur?.options?.iid === id) setTimeout(this.cur.close.bind(this.cur));
  }
}

const globalSnackbar = new Snackbar();

export default globalSnackbar.open.bind(globalSnackbar);
