import { ButtonBack } from '@/components/button';
import { FormSelectQuery } from '@/components/form';
import { useSortCategory } from '@/services/category.service';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, Form } from 'antd';
import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import DragCategory from './drag-category';
import { sortItemsAtom } from './recoil';

const CategorySort = () => {
  const [form] = Form.useForm();
  const resetSortItems = useResetRecoilState(sortItemsAtom);
  const sortItems = useRecoilValue(sortItemsAtom);
  const { mutate: sortMutate, isPending } = useSortCategory();

  const onFinish = () => {
    const data = sortItems?.map((i, idx) => ({ id: i.id, priority: idx }));
    sortMutate(data);
  };

  useEffect(() => {
    return () => {
      resetSortItems();
    };
  }, [resetSortItems]);

  return (
    <div className="w-full md:w-[60%] lg:w-[50%] 2xl:w-[45%] mx-auto">
      <Helmet>
        <title>Sắp xếp danh mục | {WEBSITE_NAME}</title>
      </Helmet>

      <Form
        form={form}
        name="categorySortForm"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
        className="mt-10"
      >
        <FormSelectQuery
          allowClear
          // initialValue={initCategory}
          rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          label="Chọn danh mục cha (để sắp xếp danh mục con)"
          labelKey="name"
          valueKey="id"
          name="categoryId"
          request={{
            url: '/api/category/v2/get-all'
          }}
          fixedOptions={[{ label: 'Danh mục gốc', value: 'HOME' }]}
          initialValue={[{ label: 'Danh mục gốc', value: 'HOME' }]}
        />

        <div className="mt-10">
          <p className="font-bold">Danh sách danh mục con:</p>
          <p className="text-[#828282] text-[13px] mb-6">(Kéo thả để sắp xếp)</p>
          <DragCategory form={form} />
        </div>

        <div className="flex items-center gap-8 mt-20 justify-center">
          <div className="hidden md:block">
            <ButtonBack route="/categories" />
          </div>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="px-10"
            disabled={isEmpty(sortItems)}
            loading={isPending}
          >
            <span className="font-semibold">Lưu lại</span>
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CategorySort;
