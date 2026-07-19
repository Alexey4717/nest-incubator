import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TYPEORM_ENTITIES } from './typeorm-entities';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(TYPEORM_ENTITIES)],
  exports: [TypeOrmModule],
})
export class TypeOrmEntitiesModule {}
