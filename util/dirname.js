import { URL } from 'url';

// https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-when-using-the-experimental-modules-flag
export const getDirname = () => {
  return decodeURI(new URL('.', import.meta.url).pathname);
};

export default getDirname;

