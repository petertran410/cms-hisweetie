import { API } from '@/utils/API';
import { showToast } from '@/utils/helper';
import { useMutation } from '@tanstack/react-query';
import { Form, Select } from 'antd';
import { debounce, get, isEmpty, uniqBy } from 'lodash';
import { memo, useCallback, useMemo, useState } from 'react';

const useMutationGetData = (url) => {
  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url,
        params: {
          pageSize: 100,
          pageNumber: 0,
          ...params
        }
      });
    }
  });
};

const FormSelectQuery = (props) => {
  const {
    request,
    placeholder,
    mode,
    labelInValue = true,
    label,
    name,
    initialValue,
    loading,
    className,
    rules,
    allowClear,
    labelKey = 'title',
    valueKey = 'id',
    disabled,
    fixedOptions,
    ...rest
  } = props;
  const { url, params = {} } = request;
  const { mutateAsync: getData } = useMutationGetData(url);
  const [page, setPage] = useState(0);
  const [options, setOptions] = useState([]);
  const [keyword, setKeyword] = useState();
  const [isLastPage, setIsLastPage] = useState(false);

  const finalOptions = useMemo(() => {
    const newOptions = options?.map((item) => ({
      label: get(item, labelKey),
      value: get(item, valueKey)
    }));
    return fixedOptions ? uniqBy([...fixedOptions, ...newOptions], 'value') : uniqBy(newOptions, 'value');
  }, [labelKey, options, valueKey, fixedOptions]);

  const handleCatch = useCallback((e) => {
    setOptions([]);
    showToast({ type: 'error', message: e?.message });
  }, []);

  const loadFirstPage = useCallback(() => {
    if (!isEmpty(options)) {
      return;
    }
    getData({ ...params, pageNumber: 1 })
      .then((res) => {
        setOptions(res);
        setIsLastPage(true);
      })
      .catch((e) => handleCatch(e));
  }, [getData, handleCatch, options, params]);

  const onLoadMore = useCallback(
    ({ target }) => {
      if (isLastPage) {
        return;
      }
      if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
        setPage((prev) => prev + 1);
        getData({ ...params, page: page + 1, keyword })
          .then((res) => {
            setOptions([...options, ...res]);
            setIsLastPage(true);
          })
          .catch((e) => handleCatch(e));
      }
    },
    [isLastPage, getData, params, page, keyword, options, handleCatch]
  );

  const onSearch = debounce((value) => {
    setPage(0);
    setKeyword(value);
    getData({ page: 0, keyword: value })
      .then((res) => {
        setOptions(res);
        setIsLastPage(true);
      })
      .catch((e) => handleCatch(e));
  }, 500);

  const onBlur = useCallback(() => {
    setKeyword(undefined);
    setPage(0);
    setOptions([]);
    setIsLastPage(false);
  }, []);

  return (
    <Form.Item
      name={name}
      label={label ? <p className="font-bold text-md">{label}</p> : undefined}
      rules={rules}
      labelCol={{ span: 24 }}
      initialValue={initialValue}
      className={className}
      {...rest}
    >
      <Select
        disabled={disabled}
        options={finalOptions}
        style={{ width: '100%', height: 37 }}
        mode={mode}
        labelInValue={labelInValue}
        placeholder={placeholder || 'Chọn...'}
        loading={loading}
        onFocus={loadFirstPage}
        onPopupScroll={onLoadMore}
        showSearch
        onSearch={onSearch}
        onBlur={onBlur}
        filterOption={false}
        allowClear={allowClear}
      />
    </Form.Item>
  );
};

export default memo(FormSelectQuery);
