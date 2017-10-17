import { createAction } from 'redux-actions';
import { createFetchActions } from './utils';

export const createNewOrder = createAction('CREATE_NEW_ORDER');
export const newOrder = createFetchActions('NEW_ORDER');

export const triggerWechatPay = createAction('TRIGGER_WECHATPAY');
export const payment = createFetchActions('PAYMENT');

export const loadRecords = createAction('LOAD_RECORDS');
export const loadMoreRecords = createAction('LOAD_MORE_RECORDS');
export const records = createFetchActions('RECORDS');
