import { ReactNode, useState } from 'react';
import { Badge, Button, Drawer, Space } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { useIsMobile } from '../../hooks/useIsMobile';

interface Props {
  children: ReactNode;
  activeCount?: number;
  onReset?: () => void;
}

export default function FilterBar({ children, activeCount = 0, onReset }: Props) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (!isMobile) {
    return (
      <Space wrap style={{ marginBottom: 16 }}>
        {children}
      </Space>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <Badge count={activeCount} offset={[-4, 4]} size="small">
          <Button icon={<FilterOutlined />} onClick={() => setOpen(true)}>
            Фильтры
          </Button>
        </Badge>
        {onReset && activeCount > 0 && (
          <Button type="link" onClick={onReset} style={{ paddingLeft: 8 }}>
            Сбросить
          </Button>
        )}
      </div>
      <Drawer
        title="Фильтры"
        placement="bottom"
        height="auto"
        open={open}
        onClose={() => setOpen(false)}
        closable
        rootClassName="floating-filter-drawer"
        styles={{
          content: { overflow: 'hidden' },
          header: { padding: '14px 16px', borderBottom: '1px solid #f0f0f0' },
          body: { padding: 16 },
        }}
        extra={
          onReset && (
            <Button
              type="link"
              onClick={() => {
                onReset();
                setOpen(false);
              }}
              style={{ padding: 0 }}
            >
              Сбросить
            </Button>
          )
        }
      >
        <div
          aria-hidden
          style={{
            width: 40,
            height: 4,
            background: '#d9d9d9',
            borderRadius: 2,
            margin: '-4px auto 14px',
          }}
        />
        <Space direction="vertical" size={12} style={{ width: '100%' }} className="mobile-filters">
          {children}
        </Space>
        <Button
          block
          type="primary"
          onClick={() => setOpen(false)}
          style={{ marginTop: 16 }}
        >
          Готово
        </Button>
      </Drawer>
    </>
  );
}
