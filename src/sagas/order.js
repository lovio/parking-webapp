import { take, call, select, put, fork } from 'redux-saga/effects';
// import history, { redirect } from 'helpers/history';

// import { HOME_PATH } from 'constants/constants.json';
import * as actions from 'actions/order';
import * as apis from 'helpers/api';
import { showConfirm, clearPagination } from '../actions/common';
import { fetchEntity } from './utils';

const requestNewOrder = fetchEntity.bind(null, actions.newOrder, apis.postNewOrders);
const requestPayment = fetchEntity.bind(null, actions.payment, apis.getPaymentPkg);
const requestRecords = fetchEntity.bind(null, actions.records, apis.getRecords);

function* loadRecords({ type }) {
  const pagination = yield select(state => state.getIn(['pagination', 'records']));
  if (pagination.get('isLoading')) {
    return;
  }
  const param = { pageNo: pagination.get('pageNo'), pageSize: pagination.get('pageSize') };
  if (type) {
    param.type = type;
  }
  yield call(requestRecords, param, true);
}

export function* watchLoadRecords() {
  for (;;) {
    const { payload } = yield take(actions.loadRecords);
    yield put(clearPagination('records'));
    yield fork(loadRecords, payload);
  }
}

export function* watchLoadMorePhotos() {
  for (;;) {
    const { payload } = yield take(actions.loadMoreRecords);
    yield fork(loadRecords, payload);
  }
}

export function* watchCreateNewOrder() {
  for (;;) {
    const { payload: { cityId, product } } = yield take(actions.createNewOrder);
    const user = yield select(state => state.get('user'));
    if (user.get('name') && user.get('IDCardNo')) {
      const openid = user.get('openid') || 'oDCCVuIQeIug7Gx4OHIOsjrUWFFY';
      const order = yield call(
        requestNewOrder,
        {
          openid,
          cityId,
          productId: product.get('id'),
        },
        true,
      );
      console.log(order);
      // here now we should trigger payment
    } else {
      yield put(
        showConfirm({
          type: 'profileIncomplete',
          desc: ['实名信息未完善，请先完善实名信息'],
        }),
      );
    }
  }
}

export function* watchTriggerWechatPay() {
  for (;;) {
    const { payload: { orderId } } = yield take(actions.triggerWechatPay);
    const openid =
      (yield select(state => state.getIn(['user', 'openid']))) || 'oDCCVuIQeIug7Gx4OHIOsjrUWFFY';
    const payment = yield call(
      requestPayment,
      {
        orderId,
        openid,
      },
      true,
    );
    console.log(payment);
  }
}
