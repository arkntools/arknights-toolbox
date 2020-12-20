import { snackbar } from 'mdui';

const getRandID = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

class Snackbar {
  constructor() {
    this.sb = null;
    this.next = null;
  }
  open(message, params) {
    switch (typeof message) {
      case 'string':
        params = { message };
        break;
      case 'object':
        params = { ...message };
        break;
      default:
        return;
    }

    const { onOpened, onClosed } = params;
    params.iid = getRandID();
    params.onOpened = () => {
      onOpened?.();
      if (this.next && !params.noSkip) {
        setTimeout(this.sb.close);
      }
    };
    params.onClosed = () => {
      onClosed?.();
      if (this.next) {
        this.sb = snackbar(this.next);
        this.next = null;
      } else {
        this.sb = null;
      }
    };

    if (this.sb && this.sb.state !== 'closed') {
      this.next = params;
      if (this.sb.state === 'opened' && !params.noSkip) this.sb.close();
    } else {
      this.sb = snackbar(params);
    }

    return {
      close: () => this.close(params.iid),
    };
  }
  close(id) {
    if (this.next?.iid === id) this.next = null;
    if (this.sb?.options?.iid === id) setTimeout(this.sb.close.bind(this.sb));
  }
}

const globalSnackbar = new Snackbar();

export default globalSnackbar.open.bind(globalSnackbar);
