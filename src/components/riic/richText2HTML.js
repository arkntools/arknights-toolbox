import '@/data/richText.css';

const getClassName = str => str.replace(/^[^0-9a-zA-Z]/, '').replace(/[^0-9a-zA-Z]/g, '-');
const getTermId = str => str.replace(/^\W/, '').replace(/\W/g, '_');

export const richText2HTML = text => {
  const result = text
    .replace(/<([^<>]+)>([^<>]+)<\/>/g, (str, key, value) => {
      if (key.startsWith('@cc.')) {
        return `{{span class="riic-rt ${getClassName(key)}"}}${value}{{/span}}`;
      }
      if (key.startsWith('$cc.')) {
        return `{{span class="riic-term" data-id="${getTermId(key)}"}}${value}{{/span}}`;
      }
    })
    .replace(/\n/g, '<br />');
  return /<[^<>]+>[^<>]+<\/>/.test(result)
    ? richText2HTML(result)
    : result.replace(/{{/g, '<').replace(/}}/g, '>');
};

export const removeRichTextTag = str => {
  const result = str.replace(/<(?:[^>]+)>([^<>]+)<\/>/g, '$1');
  return /<[^>]+>[^<>]+<\/>/.test(result) ? removeRichTextTag(result) : result;
};

export const findTerm = (e, stopFn = () => false) => {
  for (const el of e.composedPath?.() || []) {
    if (stopFn(el)) return;
    if (el.classList?.contains('riic-term')) return el;
  }
};
