import { memo } from 'react';
import FilterCustomer from './component/filter-customer';
import FilterEmail from './component/filter-email';
import FilterId from './component/filter-id';
import FilterPhone from './component/filter-phone';
import FilterStatus from './component/filter-status';
import FilterType from './component/filter-type';

const TableFilter = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-x-10 mb-10 gap-y-5">
      <FilterId label="Mã đơn hàng" placeholder="Nhập mã đơn hàng" />
      <FilterCustomer label="Tên khách hàng" placeholder="Nhập tên khách hàng" />
      <FilterPhone label="Số điện thoại " placeholder="Nhập số điệnt thoại" />
      <FilterEmail label="Email" placeholder="Nhập email" />
      <FilterType />
      <FilterStatus />
    </div>
  );
};

export default memo(TableFilter);
