import { Module } from '@nestjs/common';

import { ReactionUpdateService } from './application/services/reaction-update.service';
import { ReactionsMapperService } from './application/services/reactions-mapper.service';

const likeServices = [ReactionsMapperService, ReactionUpdateService];

@Module({
  providers: [...likeServices],
  exports: [...likeServices],
})
export class LikeModule {}
