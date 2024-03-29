import { SubmissionError } from 'redux-form/immutable';
import { showToastItem } from 'actions/common';
import _values from 'lodash-es/values';
import head from 'lodash-es/head';
import noop from 'lodash-es/noop';
// import flatMap from 'lodash-es/flatMap';

export function onSubmitFail(errors, dispatch) {
  // const detail = flatMap(errors.error.detail, _values);
  const errorMsgs = _values(errors);
  if (errorMsgs.length) {
    // 只展示第一个错误
    dispatch(showToastItem(head(errorMsgs)));
  }
}

function throwSubmissionError(error) {
  throw new SubmissionError(error);
}

export function submit(submitFunc, success = noop, failure = throwSubmissionError) {
  return values =>
    new Promise((resolve, reject) => {
      submitFunc({ values: values.toJS(), resolve, reject });
    })
      .then(success)
      .catch(failure);
}
