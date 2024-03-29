import Immutable from 'immutable';

const DEFAULT_PAGINATION = {
  isLoading: false,
  totalPage: 0,
  pageSize: 20,
  pageNo: 1,
  hasMore: true,
};

// 对于闪购或者搜索结果都是用products
export default Immutable.fromJS({
  // 要改成其他名字，比如sesstion
  user: {},
  common: {
    toasts: {},
    modal: {},
    confirm: {},
  },
  pagination: {
    records: DEFAULT_PAGINATION,
    orders: DEFAULT_PAGINATION,
  },
  extra: {
    cities: [],
    zones: [],
    grade: '',
    carports: {
      data: [],
      isLoading: false,
    },
  },
  order: {
    isLoading: false,
    data: {},
  },
  mine: {
    cards: [],
    records: [],
    orders: [],
    summries: {
      isLoading: false,
      data: [],
    },
    levelups: {
      isLoading: false,
      data: [],
    },
    relations: {
      isLoading: false,
      data: {},
    },
    card: 0,
  },
});
