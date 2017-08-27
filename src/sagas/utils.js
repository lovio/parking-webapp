import { put, call, select } from 'redux-saga/effects';
import { Cookies } from 'react-cookie';
import isObject from 'lodash-es/isObject';
import assign from 'lodash-es/assign';
import get from 'lodash-es/get';
import { inApp } from 'helpers/ua';

import { setUserId } from 'helpers/logger';
import { COOKIE_DOMAIN } from 'constants/constants.json';

// resuable fetch Subroutine
// entity :  user | repo | starred | stargazers
// apiFn  : api.fetchUser | api.fetchRepo | ...
// id     : login | fullName
// url    : next page url. If not provided will use pass it to apiFn
// 用法，知道bind的用法，就懂了
export function* fetchEntity(entity, apiFn, params, needToken) {
  let token;
  const callback =
    (params && (params instanceof Object) && (params.callback instanceof Function))
      ? params.callback
      : function callback() {};

  // 是不是有更好的保存token的地方？
  if (needToken) {
    token = yield select(state => state.getIn(['user', 'info', 'token']));
  }
  yield put(entity.request(params));
  const { response, error } = yield call(apiFn, token ? assign({}, params, { token }) : params);
  // response可以是0， 但是error一定不是
  if (error) {
    yield put(entity.failure({ error, params }));
    callback(error);
  } else {
    yield put(entity.success({ response, params }));
    callback(null, response);
  }
}

// actions是callback actions
// params contains of api and actions
export function* formRequest(params, action) {
  const { payload: { values, resolve, reject } } = action;
  const { actions, api, needToken, tokenKey } = params;
  let token;
  // 是不是有更好的保存token的地方？
  if (needToken) {
    token = yield select(state => state.getIn(['user', 'info', 'token']));
  }
  const formData = token ? assign({}, values, { [tokenKey || 'token']: token }) : values;
  const { response, error } = yield call(api, formData);
  if (error) {
    // 返回空
    const { data } = error;
    const errorMsg = (isObject(data) && (data.message || data.msg)) || '出错了！';
    if (get(actions, 'failure')) {
      yield put(actions.failure({
        msg: errorMsg,
        data,
      }));
      return reject();
    }
    // 通用错误提示
    return reject({ _error: errorMsg, code: get(data, 'code') });
  }
  if (get(actions, 'success')) {
    // provide values
    yield put(actions.success(response));
  }
  return resolve(response);
}

export function* saveCookie(payload) {
  if (inApp || !payload) {
    return;
  }
  const { nickname, token, userId, unionId } = payload;
  const user = yield select(state => state.getIn(['user', 'info']));
  // id is for user sign in
  const data = {
    id: userId || user.get('userId'),
    name: nickname || user.get('nickname'),
    token: token || user.get('token'),
    unionId: unionId || user.get('unionId'),
  };
  // 这里需要调整一下，接口这边有些问题
  if (data.id) {
    setUserId(data.id);
  }
  const cookies = new Cookies();
  cookies.set('ss_user', JSON.stringify(data), { path: '/', domain: COOKIE_DOMAIN });
}

export function removeCookie() {
  if (inApp) {
    return;
  }
  const cookies = new Cookies();
  cookies.set('ss_user', '', { path: '/', domain: COOKIE_DOMAIN });
}
