import { SortDirections } from '@/core/types/common';

export const DEFAULT_TOP_USERS_SORT = ['avgScores desc', 'sumScore desc'] as const;

export const TOP_USERS_SORT_FIELDS = ['avgScores', 'sumScore', 'winsCount', 'lossesCount'] as const;

export type TopUsersSortField = (typeof TOP_USERS_SORT_FIELDS)[number];

export type TopUsersSortItem = {
  field: TopUsersSortField;
  direction: SortDirections;
};

const TOP_USERS_SORT_FIELD_SET = new Set<string>(TOP_USERS_SORT_FIELDS);

export const TOP_USERS_SORT_ITEM_PATTERN =
  /^(avgScores|sumScore|winsCount|lossesCount) (asc|desc)$/;

export function parseTopUsersSort(sort: string[]): TopUsersSortItem[] {
  return sort.map((item) => {
    const [fieldRaw, directionRaw] = item.trim().split(/\s+/);
    const field = fieldRaw as TopUsersSortField;
    const direction = directionRaw as SortDirections;

    if (!TOP_USERS_SORT_FIELD_SET.has(field)) {
      throw new Error(`Unsupported top users sort field: ${fieldRaw}`);
    }

    if (direction !== SortDirections.asc && direction !== SortDirections.desc) {
      throw new Error(`Unsupported top users sort direction: ${directionRaw}`);
    }

    return { field, direction };
  });
}
