import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';

import { PostRepository } from '../../infrastructure/post.repository';

@Injectable()
export class DeletePostUseCase implements IUseCase<string, Notification<null>> {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(id: string): Promise<Notification<null>> {
    const deleted = await this.postRepository.deletePostById(id);
    if (!deleted) {
      return Notification.fail(DomainExceptionCode.NotFound);
    }

    return Notification.ok(null);
  }
}
