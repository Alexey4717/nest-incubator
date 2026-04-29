import { Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { AuthController } from './api/auth.controller';
import { JwtService } from './application/jwt.service';
import { EmailModule } from '../email/email.module';
import { SessionModule } from '../session/session.module';
import { MongooseModelsModule } from '../database/mongoose-models.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [MongooseModelsModule, EmailModule, SessionModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
  exports: [AuthService, JwtService, UserModule],
})
export class AuthModule {}
