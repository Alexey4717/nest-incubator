import { LikeStatus } from '../../types/like-status';
import { ReactionsMapperService } from './reactions-mapper.service';

describe('ReactionsMapperService', () => {
  const service = new ReactionsMapperService();

  it('returns empty likes info when reactions are missing', () => {
    expect(service.mapReactionsToBaseLikesInfo(undefined)).toEqual({
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
    });
  });

  it('aggregates likes and dislikes for base likes info', () => {
    expect(
      service.mapReactionsToBaseLikesInfo(
        [
          { userId: 'user-1', likeStatus: LikeStatus.Like, createdAt: '2020-01-01' },
          { userId: 'user-2', likeStatus: LikeStatus.Dislike, createdAt: '2020-01-02' },
        ],
        'user-1',
      ),
    ).toEqual({
      likesCount: 1,
      dislikesCount: 1,
      myStatus: LikeStatus.Like,
    });
  });

  it('returns empty extended likes info when reactions are missing', () => {
    expect(service.mapReactionsToExtendedLikesInfo(undefined)).toEqual({
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
      newestLikes: [],
    });
  });

  it('keeps only three newest likes in extended likes info', () => {
    const result = service.mapReactionsToExtendedLikesInfo([
      {
        userId: 'user-1',
        likeStatus: LikeStatus.Like,
        createdAt: '2020-01-01',
        userLogin: 'one',
      },
      {
        userId: 'user-2',
        likeStatus: LikeStatus.Like,
        createdAt: '2020-01-04',
        userLogin: 'two',
      },
      {
        userId: 'user-3',
        likeStatus: LikeStatus.Like,
        createdAt: '2020-01-03',
        userLogin: 'three',
      },
      {
        userId: 'user-4',
        likeStatus: LikeStatus.Like,
        createdAt: '2020-01-02',
        userLogin: 'four',
      },
    ]);

    expect(result.newestLikes).toEqual([
      { userId: 'user-2', login: 'two', addedAt: '2020-01-04' },
      { userId: 'user-3', login: 'three', addedAt: '2020-01-03' },
      { userId: 'user-4', login: 'four', addedAt: '2020-01-02' },
    ]);
  });
});
