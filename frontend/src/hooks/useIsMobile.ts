import { Grid } from 'antd';

export function useIsMobile(): boolean {
  const screens = Grid.useBreakpoint();
  return !screens.md;
}

export function useResponsiveModalWidth(desktop: number | string = 520) {
  const isMobile = useIsMobile();
  return {
    width: isMobile ? 'calc(100vw - 24px)' : desktop,
    centered: isMobile,
  };
}
