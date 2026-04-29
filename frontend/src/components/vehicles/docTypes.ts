import type { DocType } from '../../types/vehicles.types';

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  tech_passport_truck: 'Техпаспорт тягача',
  tech_passport_trailer: 'Техпаспорт прицепа',
  passport: 'Паспорт',
  permit_kat: 'Дозвол КАТ',
  chip: 'Чип',
  other: 'Прочее',
};

export const DOC_TYPE_OPTIONS = (Object.keys(DOC_TYPE_LABELS) as DocType[]).map(
  (k) => ({ value: k, label: DOC_TYPE_LABELS[k] }),
);
