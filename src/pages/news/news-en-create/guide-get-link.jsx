import { Button, Divider, Modal } from 'antd';
import { useState } from 'react';

const GuideGetLink = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button type="link" onClick={showModal} className="p-0 -mt-4">
        * Hướng dẫn lấy link nhúng từ Youtube
      </Button>
      <Modal
        title="Hướng dẫn"
        width={1000}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Xong"
        cancelText="Đóng"
      >
        <Divider />
        <p className="font-bold">Bước 1:</p>
        <p className="pl-4 mt-3">
          Mở video Youtube đó lên {`->`} Chọn nút <span className="text-red-500">Chia sẻ</span> {`->`} Chọn nút{' '}
          <span className="text-red-500">Nhúng</span>
        </p>
        <p className="font-bold mt-8">Bước 2:</p>
        <p className="pl-4 mt-3">Youtube sẽ hiển thị 1 đoạn code nhúng dạng như bên dưới:</p>
        <p className="mx-4 mt-5 border p-4 rounded-md border-[#ccc]">
          {`<iframe width="560" height="315" src="`}
          <span className="text-red-500">https://www.youtube.com/embed/4letvWcz-ic?si=QBXeFhT1a3AWexHl</span>
          {`" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`}
        </p>
        <p className="pl-4 mt-5 text-[15px] font-semibold">
          Vui lòng sao chép lấy đường link ở vị trí{' '}
          <span className="text-red-500 text-[15px] font-semibold">màu đỏ</span>, rồi dán vào ô input Link nhúng
        </p>
        <p className="pl-4 mt-2 text-[#828282] italic">(Mỗi video sẽ có một đường link khác nhau)</p>
      </Modal>
    </>
  );
};

export default GuideGetLink;
