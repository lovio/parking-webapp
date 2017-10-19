import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import history from 'helpers/history';
import { reduxForm, propTypes, Form, Field } from 'redux-form/immutable';
import Helmet from 'react-helmet';
import addDays from 'date-fns/add_days';
import format from 'date-fns/format';

import { onSubmitFail, submit } from 'helpers/form';
import Input from 'ui/input/input';
import Button from 'ui/button';
import { required, checkWithdrawAmount } from 'helpers/validators';
import { dealNumber } from 'helpers/string';

import imgArror from './arrow.png';

const BANK_IMG_PREFIX = 'https://apimg.alipay.com/combo.png?d=cashier&t=';

const FieldContainer = styled.div`
  background-color: white;
  padding-left: 0.2rem;
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

const Tip = styled.p`
  padding-left: 0.25rem;
  line-height: 0.36rem;
  font-size: 0.12rem;
  color: #9b9b9b;
`;

const WithdrawView = (props) => {
  const { handleSubmit, submitting, pristine, withdraw, card, user } = props;
  const cardNo = card.get('cardNo');
  // 有车位最小取现金额为1千元
  return (
    <div>
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
      <Tip>
        {user.get('asset') ? '最小取现金额1000元，取现上限5万。' : '取现上限5万。'}您的可取现金额为{dealNumber(user.get('cash'))}元
      </Tip>
      <Form onSubmit={handleSubmit(submit(withdraw))}>
        <FieldContainer>
          <Field
            name="amount"
            validate={[required('请输入取现金额'), checkWithdrawAmount(user.get('cash'))]}
            label="取现金额"
            id="amount"
            component={Input}
            placeholder="请输入取现金额"
            type="number"
          />
        </FieldContainer>
        <Tip>手续费：0.6%</Tip>
        <SubmitContainer>
          <Button type="submit" disabled={pristine || submitting}>
            确认取现
          </Button>
        </SubmitContainer>
        <Tip>预计到账时间：{format(addDays(new Date(), 7), 'YYYY年MM月DD')}</Tip>
      </Form>
    </div>
  );
};

WithdrawView.propTypes = {
  ...propTypes,
  withdraw: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  card: PropTypes.object.isRequired,
};

export default reduxForm({
  form: 'resetPwd',
  onSubmitFail,
})(WithdrawView);