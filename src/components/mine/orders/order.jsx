import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Immutable from 'immutable';
import products from 'constants/products.json';
import { ORDER_STATUS_MAPPING, ORDER_INIT, ORDER_UNPAID, ORDER_CANCEL, PRODUCT_NAME } from 'constants/constants.json';
import { dealNumber } from 'helpers/string';
import find from 'lodash-es/find';
import includes from 'lodash-es/includes';
import format from 'date-fns/format';
import Button from 'ui/button';

const Container = styled.div`
  background-color: white;
  margin-bottom: 0.1rem;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const Header = styled.p`
  line-height: 0.4rem;
  padding: 0 0.25rem;
  border-bottom: 1px solid #dbdcdd;
`;
const DateTime = styled.span`
  font-size: 0.14rem;
  color: #9b9b9b;
`;

const Status = styled.span`
  float: right;
  font-size: 0.14rem;
  color: ${props => (props.isRed ? '#e01053' : '#0889FF')};
`;

const InfoBox = styled.div`
  padding-left: 0.2rem;
`;

const Block = styled.div`
  padding: 0.05rem 0;
  border-bottom: 1px solid #dbdcdd;

  &:last-of-type {
    border: none;
  }
`;

const Intro = styled.p`
  padding-left: 0.05rem;
  line-height: 0.2rem;
  font-size: 0.14rem;
  color: ${props => (props.isBold ? '#4a4a4a' : '#9b9b9b')};
  margin-bottom: 0.05rem;

  span {
    float: right;
    margin-right: 0.2rem;
    color: #9b9b9b;
  }
`;

const BtnGroups = styled.div`
  padding: 0.1rem 0.2rem 0.1rem 0;
  display: flex;
  justify-content: space-around;
  button {
    margin: 0 0.1rem;
  }
`;

const CancelButton = styled(Button)`
  color: #e01053;
  background-color: white;
  border-color: #e01053;
`;

const OrderItem = ({ order, triggerWechatPay, cancel }) => {
  const product = Immutable.fromJS(find(products, { id: order.get('productId') }));
  return (
    <Container>
      <Header>
        <DateTime>{format(new Date(order.get('createdAt')), 'YYYY-MM-DD HH:mm:ss')}</DateTime>
        <Status isRed={includes([ORDER_INIT, ORDER_UNPAID, ORDER_CANCEL], order.get('status'))}>
          {ORDER_STATUS_MAPPING[order.get('status')]}
        </Status>
      </Header>
      <InfoBox>
        <Block>
          <Intro isBold>
            {PRODUCT_NAME}
            <span>{product.get('right')}</span>
          </Intro>
          <Intro isBold>{order.getIn(['city', 'name'])}</Intro>
        </Block>
        <Block>
          <Intro>
            订单号
            <span>{order.get('id')}</span>
          </Intro>
          <Intro>
            商品总价
            <span>￥{dealNumber(product.get('cents'))}</span>
          </Intro>
          <Intro>
            累计支付
            <span>￥{dealNumber(order.get('paid'))}</span>
          </Intro>
        </Block>
        <BtnGroups>
          {/* {includes([ORDER_INIT, ORDER_UNPAID], order.get('status')) && (
            <Button
              onClick={() =>
                triggerWechatPay({
                  orderId: order.get('id'),
                  amount: order.get('price') - order.get('paid'),
                })}>
              微信支付尾款
            </Button>
          )} */}
          {order.get('status') === ORDER_INIT && (
            <CancelButton
              onClick={() =>
                cancel({
                  orderId: order.get('id'),
                })
              }>
              取消订单
            </CancelButton>
          )}
        </BtnGroups>
      </InfoBox>
    </Container>
  );
};

OrderItem.propTypes = {
  order: PropTypes.object.isRequired,
  triggerWechatPay: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
};

export default OrderItem;
