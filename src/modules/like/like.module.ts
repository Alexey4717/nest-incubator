import { Module } from '@nestjs/common';

import { ReactionUpdateService } from './application/services/reaction-update.service';
import { ReactionsMapperService } from './application/services/reactions-mapper.service';

@Module({
  providers: [ReactionsMapperService, ReactionUpdateService],
  exports: [ReactionsMapperService, ReactionUpdateService],
})
export class LikeModule {}
