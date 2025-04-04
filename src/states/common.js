import Cookies from 'js-cookie';
import { DefaultValue, atom, selector } from 'recoil';

export const CK_JWT_TOKEN = 'token';

const tokenAtom = atom({
  key: 'TOKEN_ATOM',
  default: new Promise((resolve) => {
    const token = Cookies.get(CK_JWT_TOKEN);
    resolve(token);
  })
});

export const tokenState = selector({
  key: 'TOKEN_SELECTOR',
  get: ({ get }) => get(tokenAtom),
  set: ({ set }, newValue) => {
    set(tokenAtom, newValue);
    if (!newValue || newValue instanceof DefaultValue) {
      Cookies.remove(CK_JWT_TOKEN);
      return;
    }
    Cookies.set(CK_JWT_TOKEN, newValue, { expires: 60, secure: true });
  }
});

export const userInfoAtom = atom({
  key: 'USER_INFO_ATOM',
  default: undefined
});
