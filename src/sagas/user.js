import { take, put, call, select, takeEvery } from 'redux-saga/effects';
import history from 'helpers/history';

import * as actions from 'actions/user';
import * as apis from 'helpers/api';
import { showToastItem } from '../actions/common';
import { formRequest, fetchEntity } from './utils';
import { isEmail, isIDCard } from '../helpers/validators';

const requestCards = fetchEntity.bind(null, actions.cards, apis.getCards);
const requestDailySummaries = fetchEntity.bind(null, actions.dailySummaries, apis.getDailySummaries, {}, true);
const requestRemoveCard = fetchEntity.bind(null, actions.cardRemove, apis.removeCard);
const requestRelations = fetchEntity.bind(null, actions.relations, apis.getDescendants);

const requestLevelups = fetchEntity.bind(null, actions.levelups, apis.getLevelups, {}, true);

// 获取用户信息
function* loadCards({ payload }) {
  yield call(requestCards, payload || {}, true);
}

export function* watchLoadCards() {
  yield takeEvery(actions.loadCards, loadCards);
}

// 获取用户信息
function* loadRelations({ payload }) {
  yield call(requestRelations, payload || {}, true);
}

export function* watchLoadRelations() {
  yield takeEvery(actions.loadRelations, loadRelations);
}

export function* watchLoadDailySummaries() {
  yield takeEvery(actions.loadDailySummaries, requestDailySummaries);
}

export function* watchLoadLevelups() {
  yield takeEvery(actions.loadLevelups, requestLevelups);
}

function* withdraw({ payload }) {
  const { resolve, reject } = payload;
  const cardId = yield select(state => state.getIn(['mine', 'card']));
  if (!cardId) {
    yield put(showToastItem('请选择提现银行卡'));
  }
  const values = {
    cardId,
    amount: payload.values.amount * 100,
    // openid,
  };
  yield call(
    formRequest,
    {
      api: apis.withdraw,
      actions: {
        success: actions.withdrawSuccess,
      },
      needToken: true,
    },
    {
      payload: { values, resolve, reject },
    }
  );
}

export function* watchWithdraw() {
  yield takeEvery(actions.withdraw, withdraw);
}

export function* watchWithdrawSuccess() {
  for (;;) {
    yield take(actions.withdrawSuccess);
    yield put(
      showToastItem({
        type: 'success',
        msg: '提现申请已提交',
      })
    );
    history.push('/mine/records?type=withdraw');
  }
}

function* addNewCard({ payload }) {
  const { resolve, reject } = payload;
  // const openid = yield select(state => state.getIn(['user', 'openid']));
  // yield put(actions.setBindInfo({ bindType }));
  const values = {
    ...payload.values,
    // openid,
  };
  yield call(
    formRequest,
    {
      api: apis.addNewCard,
      actions: {
        success: actions.addNewCardSuccess,
      },
      needToken: true,
    },
    {
      payload: { values, resolve, reject },
    }
  );
}

export function* watchAddNewCard() {
  yield takeEvery(actions.addNewCard, addNewCard);
}

export function* watchAddNewCardSuccess() {
  for (;;) {
    yield take(actions.addNewCardSuccess);
    yield put(
      showToastItem({
        type: 'success',
        msg: '银行卡添加成功',
      })
    );
    history.push({
      pathname: '/mine/cards',
      search: history.location.search,
    });
  }
}

export function* watchRemoveCard() {
  for (;;) {
    const { payload } = yield take(actions.removeCard);
    yield call(requestRemoveCard, { id: payload }, true);
  }
}

const fieldMappings = {
  name: '姓名',
  IDCardNo: '身份证号',
  email: '邮箱',
  address: '快递地址',
};

export function* watchUpdateProfile() {
  for (;;) {
    const {
      payload: { values, resolve, reject },
    } = yield take(actions.updateProfile);
    const { field, value } = values;
    if (!value) {
      yield put(showToastItem({ type: 'error', msg: `${fieldMappings[field]}不能为空` }));
      reject();
      continue;
    }

    let tip = '';
    if (field === 'IDCardNo') {
      tip = isIDCard()(value);
    }
    // check email
    if (field === 'email') {
      tip = isEmail()(value);
    }
    if (tip) {
      yield put(showToastItem(tip));
      reject();
      continue;
    }
    // check IDCardNo

    yield call(
      formRequest,
      {
        api: apis.updateProfile,
        actions: {
          success: actions.updateProfileSuccess,
          failure: actions.updateProfileFailure,
        },
        needToken: true,
      },
      {
        payload: {
          values: {
            [field]: value,
          },
          resolve,
          reject,
        },
      }
    );
  }
}

export function* watchUpdateProfileSuccess() {
  for (;;) {
    yield take(actions.updateProfileSuccess);
    yield put(showToastItem({ type: 'success', msg: '修改成功' }));
  }
}

export function* watchUpdateProfileFailure() {
  for (;;) {
    const { payload } = yield take(actions.updateProfileFailure);
    yield put(showToastItem({ type: 'error', msg: `${payload.msg}` }));
  }
}

function* loadGrade({ payload }) {
  const { resolve, reject } = payload;
  const values = {
    ...payload.values,
  };
  yield call(
    formRequest,
    {
      api: apis.getGrade,
      actions: {
        success: actions.loadGradeSuccess,
      },
    },
    {
      payload: { values, resolve, reject },
    }
  );
}

export function* watchLoadGrade() {
  yield takeEvery(actions.loadGrade, loadGrade);
}
