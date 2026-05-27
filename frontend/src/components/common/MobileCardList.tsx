import { ReactNode } from 'react';
import { Empty, Pagination, Space, Spin } from 'antd';

interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
}

interface Props<T> {
  items: T[];
  renderCard: (item: T) => ReactNode;
  rowKey: (item: T) => string | number;
  loading?: boolean;
  pagination?: PaginationProps | false;
  emptyText?: ReactNode;
}

export default function MobileCardList<T>({
  items,
  renderCard,
  rowKey,
  loading,
  pagination,
  emptyText,
}: Props<T>) {
  return (
    <Spin spinning={!!loading}>
      {items.length === 0 && !loading ? (
        <Empty description={emptyText ?? 'Ничего не найдено'} style={{ padding: '32px 0' }} />
      ) : (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {items.map((item) => (
            <div key={rowKey(item)}>{renderCard(item)}</div>
          ))}
        </Space>
      )}
      {pagination && pagination.total > pagination.pageSize && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <Pagination
            simple
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={pagination.onChange}
          />
        </div>
      )}
    </Spin>
  );
}
