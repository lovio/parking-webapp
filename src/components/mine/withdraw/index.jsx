import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import history from 'helpers/history';
import { reduxForm, propTypes, Form, Field } from 'redux-form/immutable';
import Helmet from 'react-helmet';

import { onSubmitFail, submit } from 'helpers/form';
import Input from 'ui/input/input';
import Button from 'ui/button';
import { required, checkWithdrawAmount } from 'helpers/validators';
import { dealNumber } from 'helpers/string';
import { Wrapper } from '../../common/wrapper';

import imgArror from './arrow.png';

const BANK_IMG_PREFIX = 'https://apimg.alipay.com/combo.png?d=cashier&t=';

const FieldContainer = styled.div`
  background-color: white;
  padding-left: 0.2rem;
  margin-bottom: 0.1rem;
`;

const SubmitContainer = styled.div`
  padding: 0 0.2rem;
  text-align: center;
  p {
    /* 未注册的手机号码将自动创建账户: */
    font-size: 0.12rem;
    color: #9b9b9b;
    line-height: 0.18rem;
    margin-bottom: 0.1rem;
  }
`;

const CardTip = styled.p`
  line-height: 0.5rem;
  font-size: 0.18rem;
  color: #4a4a4a;
`;

const Card = styled.div`
  padding: 0.1rem 0.2rem;

  background: #ffffff;
  height: 0.7rem;

  p {
    font-size: 0.15rem;
    line-height: 0.5rem;
    color: #4a4a4a;
  }
`;

const Arrow = styled.img`
  width: 0.12rem;
  padding-top: 0.13rem;
  float: right;
`;

const BankIcon = styled.img`
  float: left;
  margin-left: 0.1rem;
  width: 1.75rem;
  height: 0.5rem;
`;

const TipBox = styled.div`
  padding: 0.1rem 0 0.1rem 0.25rem;
`;

const Tip = styled.p`
  line-height: 0.2rem;
  font-size: 0.12rem;
  color: #9b9b9b;
`;

const TipBlock = styled.div`
  background-color: white;
  line-height: 0.4rem;
  margin-bottom: 0.1rem;
  padding: 0 0.25rem;

  span {
    font-size: 0.12rem;
    color: #666666;
    letter-spacing: 1px;
  }
  span:last-of-type {
    float: right;
  }
`;

class WithdrawView extends Component {
  static propTypes = {
    ...propTypes,
    withdraw: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    card: PropTypes.object.isRequired,
    restCash: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    props.getUserInfo();
  }

  // 考虑 1000车位情况
  render() {
    const { handleSubmit, submitting, pristine, withdraw, card, user, restCash } = this.props;
    const cardNo = card.get('cardNo');
    const availableCash = user.get('cash') - user.get('debt');
    // 有车位最小取现金额为1千元
    return (
      <Wrapper>
        <Helmet>
          <title>取现</title>
        </Helmet>
        <Card onClick={() => history.push('/mine/cards?action=withdraw')}>
          <Arrow src={imgArror} alt="" />
          {card.has('id') ? (
            <div>
              <BankIcon src={`${BANK_IMG_PREFIX}${card.get('bank')}`} alt="" />
              <p>
                {card.get('name')} | 尾号{cardNo.substr(cardNo.length - 4)}
              </p>
            </div>
          ) : (
            <CardTip>请选择取现银行卡</CardTip>
          )}
        </Card>
        <TipBox>
          <Tip>{user.get('asset') ? '最低取现金额1000元，当日最高5万元。' : '当日最高5万元。'}</Tip>
          <Tip>您的可取现金额为{dealNumber(availableCash < 0 ? 0 : availableCash)}元</Tip>
        </TipBox>
        <Form onSubmit={handleSubmit(submit(withdraw))}>
          <FieldContainer>
            <Field
              name="amount"
              validate={[
                required('请输入取现金额'),
                // 有车位的情况下最少取现1000元
                checkWithdrawAmount(availableCash < 0 ? 0 : availableCash, user.get('asset') ? 100000 : 0),
              ]}
              label="取现金额"
              id="amount"
              component={Input}
              placeholder="请输入取现金额"
              type="number"
              inputType="withdraw"
            />
          </FieldContainer>
          <TipBlock>
            <span>取现综合服务费率6%</span>
            <span>
              实际取现金额<strong style={{ color: '#0889FF' }}>{restCash}</strong>元
            </span>
          </TipBlock>
          <SubmitContainer>
            <Button type="submit" disabled={pristine || submitting}>
              确认取现
            </Button>
          </SubmitContainer>
          <TipBox>
            <Tip>预计到账时间：7个工作日</Tip>
          </TipBox>
        </Form>
      </Wrapper>
    );
  }
}

export default reduxForm({
  form: 'withdraw',
  onSubmitFail,
})(WithdrawView);
