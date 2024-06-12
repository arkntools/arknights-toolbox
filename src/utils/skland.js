// https://github.com/oott123/sklanding/blob/master/src/utils/sign.ts
import md5 from 'js-md5';

function buf2hex(buffer) {
  return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join('');
}

async function sign(path, token) {
  const timestamp = `${Math.floor(Date.now() / 1000)}`;
  const platform = '3';
  const dId = navigator.userAgent;
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

export async function fetchSkland(path, cred, token, body) {
  const res = await fetch(`https://zonai.skland.com${path}`, {
    ...(body
      ? {
          body: JSON.stringify(body),
          method: 'POST',
        }
      : {}),
    headers: {
      Cred: cred,
      ...(await sign(path, token)),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
  });

  const data = await res.json();

  if (data.code === 0) {
    return data.data;
  } else {
    throw new Error(data.message);
  }
}
