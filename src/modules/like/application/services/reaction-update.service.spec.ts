import { LikeStatus } from '../../types/like-status';
import { ReactionUpdateService } from './reaction-update.service';

describe('ReactionUpdateService', () => {
  const service = new ReactionUpdateService();

  it('returns noop when None is set without existing reaction', () => {
    expect(
      service.planReactionUpdate({
        reactions: [],
        userId: 'user-1',
        likeStatus: LikeStatus.None,
      }),
    ).toEqual({ action: 'noop' });
  });

  it('returns pull when None is set with existing reaction', () => {
    expect(
      service.planReactionUpdate({
        reactions: [{ userId: 'user-1', likeStatus: LikeStatus.Dislike, createdAt: '2020-01-01' }],
        userId: 'user-1',
        likeStatus: LikeStatus.None,
      }),
    ).toEqual({ action: 'pull', userId: 'user-1' });
  });

  it('returns push for Like when reaction does not exist', () => {
    const plan = service.planReactionUpdate({
      reactions: [],
      userId: 'user-1',
      likeStatus: LikeStatus.Like,
      userLogin: 'login',
    });

    expect(plan.action).toBe('push');
    if (plan.action === 'push') {
      expect(plan.reaction).toMatchObject({
        userId: 'user-1',
        likeStatus: LikeStatus.Like,
        userLogin: 'login',
      });
    }
  });

  it('returns noop when same status is set twice', () => {
    expect(
      service.planReactionUpdate({
        reactions: [{ userId: 'user-1', likeStatus: LikeStatus.Like, createdAt: '2020-01-01' }],
        userId: 'user-1',
        likeStatus: LikeStatus.Like,
      }),
    ).toEqual({ action: 'noop' });
  });
});
