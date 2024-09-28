// https://github.com/oott123/sklanding/blob/master/src/utils/sign.ts
import md5 from 'js-md5';
import { once } from 'lodash';
import { v4 as uuid } from 'uuid';
import { PROXY_SERVER } from './env';

const apiDid = uuid().toUpperCase();

function buf2hex(buffer) {
  return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join('');
}

async function sign(path, token) {
  const timestamp = `${Math.floor(Date.now() / 1000)}`;
  const platform = '3';
  const dId = apiDid;
  const vName = '1.0.0';

  const headers = {
    dId,
    platform,
    timestamp,
    vName,
  };
  if (!token) {
    return headers;
  }

  const signPayload = `${path.replace(
    /\?/,
    '',
  )}${timestamp}{"platform":"${platform}","timestamp":"${timestamp}","dId":${JSON.stringify(
    dId,
  )},"vName":"${vName}"}`;

  const utf8encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    utf8encoder.encode(token),
    { name: 'HMAC', hash: 'SHA-256' },
    true,
    ['sign'],
  );
  const intPayload = await crypto.subtle.sign(
    { name: 'HMAC', hash: 'SHA-256' },
    key,
    utf8encoder.encode(signPayload),
  );

  const res = md5(buf2hex(intPayload));

  return {
    ...headers,
    Sign: res,
  };
}

class SklandError extends Error {
  /**
   * @param {string} message
   * @param {number} code
   */
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

export async function fetchSkland(path, cred, token, body) {
  const res = await fetch(`https://zonai.skland.com${path}`, {
    ...(body
      ? {
          body: JSON.stringify(body),
          method: 'POST',
        }
      : {}),
    headers: {
      ...(cred ? { Cred: cred } : {}),
      ...(await sign(path, token)),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
  });

  const data = await res.json();

  if (data.code === 0) {
    return data.data;
  } else {
    throw new SklandError(data.message, data.code);
  }
}

/**
 * @param {string} token
 * @returns {{ cred: string, token: string }}
 */
export async function sklandOAuthLogin(token) {
  const res = await fetch(`${PROXY_SERVER}/skland/oauth_combine`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Did: await getDeviceId(),
    },
    body: JSON.stringify({ token }),
  });

  const data = await res.json();

  if (data.code === 0) {
    return data.data;
  } else {
    throw new SklandError(data.message, data.code);
  }
}

/**
 * @param {SklandError} err
 */
export function isNotLoginError(err) {
  return err.code === 10002;
}

const loadSmSdk = once(() => {
  const { promise, resolve, reject } = Promise.withResolvers();
  window._smReadyFuncs = [resolve];
  window._smConf = {
    organization: 'UWXspnCCJN4sfYlNfqps',
    appId: 'default',
    publicKey:
      'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmxMNr7n8ZeT0tE1R9j/mPixoinPkeM+k4VGIn/s0k7N5rJAfnZ0eMER+QhwFvshzo0LNmeUkpR8uIlU/GEVr8mN28sKmwd2gpygqj0ePnBmOW4v0ZVwbSYK+izkhVFk2V/doLoMbWy6b+UnA8mkjvg0iYWRByfRsK2gdl7llqCwIDAQAB',
    protocol: 'https',
  };
  import(/* webpackIgnore: true */ 'https://static.portal101.cn/dist/web/v3.0.0/fp.min.js').catch(
    reject,
  );
  return promise;
});

const getDeviceId = once(async () => {
  await loadSmSdk();
  return window.SMSdk.getDeviceId();
});
