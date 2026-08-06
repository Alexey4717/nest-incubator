import { SortDirections } from '@/core/types/common';

import {
  DEFAULT_TOP_USERS_SORT,
  parseTopUsersSort,
  TOP_USERS_SORT_ITEM_PATTERN,
} from './parse-top-users-sort';

describe('parseTopUsersSort', () => {
  it('parses default sort items', () => {
    expect(parseTopUsersSort([...DEFAULT_TOP_USERS_SORT])).toEqual([
      { field: 'avgScores', direction: SortDirections.desc },
      { field: 'sumScore', direction: SortDirections.desc },
    ]);
  });

  it('parses multi-sort items', () => {
    expect(parseTopUsersSort(['winsCount desc', 'lossesCount asc'])).toEqual([
      { field: 'winsCount', direction: SortDirections.desc },
      { field: 'lossesCount', direction: SortDirections.asc },
    ]);
  });

  it('matches allowed sort item pattern', () => {
    expect(TOP_USERS_SORT_ITEM_PATTERN.test('avgScores desc')).toBe(true);
    expect(TOP_USERS_SORT_ITEM_PATTERN.test('sumScore asc')).toBe(true);
    expect(TOP_USERS_SORT_ITEM_PATTERN.test('gamesCount desc')).toBe(false);
    expect(TOP_USERS_SORT_ITEM_PATTERN.test('avgScores')).toBe(false);
  });

  it('throws on unsupported field', () => {
    expect(() => parseTopUsersSort(['gamesCount desc'])).toThrow(
      /Unsupported top users sort field/,
    );
  });
});
