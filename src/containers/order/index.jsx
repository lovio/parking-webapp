import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import includes from 'lodash-es/includes';
import Immutable from 'immutable';
// import { loadUserData, loadCapabilityTest, loadUserInfo } from 'actions/user';
// import { authorizedRedirect } from 'actions/common';
import { loadOrder } from 'actions/order';
import { getUserInfo } from 'actions/auth';
import find from 'lodash-es/find';
import products from 'constants/products.json';
import { DEFAULT_PRODUCT_ID } from 'constants/constants.json';

import OrderView from '../../components/order';

const orderSelector = state => state.getIn(['order', 'data']);
const isLoadingSelector = state => state.getIn(['order', 'isLoading']);

const productSelector = createSelector(orderSelector, order => {
  const productId = order.get('productId');
  const id = includes([1, 2, 3], productId) ? productId : DEFAULT_PRODUCT_ID;
  return Immutable.fromJS(find(products, { id }));
});

function mapStateToProps(state, props) {
  return {
    orderId: props.match.params.orderId,
    order: orderSelector(state),
    isLoading: isLoadingSelector(state),
    user: state.get('user'),
    product: productSelector(state, props),
  };
}

export default connect(mapStateToProps, {
  loadOrder,
  getUserInfo,
})(OrderView);
