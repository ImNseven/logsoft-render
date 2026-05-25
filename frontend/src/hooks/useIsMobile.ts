import { Grid } from 'antd';

export function useIsMobile(): boolean {
  const screens = Grid.useBreakpoint();
  return !screens.md;
}

export function useResponsiveModalWidth(desktop: number | string = 520) {
  const isMobile = useIsMobile();
  return {
    width: isMobile ? '100%' : desktop,
    style: isMobile ? { top: 0, maxWidth: '100vw', margin: 0, padding: 0 } : undefined,
  };
}
