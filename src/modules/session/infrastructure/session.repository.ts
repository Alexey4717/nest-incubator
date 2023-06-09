import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../models/session.schema';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
  ) {}

  async createNewSession(newSessionInfo: Session) {
    return this.sessionModel.create({ ...newSessionInfo });
  }

  async updateSessionAfterRefreshToken(
    userId: string,
    deviceId: string,
    newLastActiveDate: string,
  ) {
    return this.sessionModel.updateOne(
      { userId, deviceId },
      { $set: { lastActiveDate: newLastActiveDate } },
    );
  }

  // async deleteOneSessionByUserAndDeviceIdAndDate(
  //     userId: string,
  //     deviceId: string,
  //     lastActiveDate: string,
  // ) {
  //   return this.sessionModel.findOneAndDelete({
  //     userId,
  //     deviceId,
  //     lastActiveDate,
  //   });
  // }

  async deleteOneSessionByUserAndDeviceIdAndDate(
    userId: string,
    deviceId: string,
    lastActiveDate: string,
  ) {
    return this.sessionModel.findOneAndDelete({
      userId,
      deviceId,
      lastActiveDate,
    });
  }

  async deleteOneSessionByUserAndDeviceId(userId: string, deviceId: string) {
    return this.sessionModel.findOneAndDelete({
      userId,
      deviceId,
    });
  }

  async deleteAllSessionExceptCurrent(userId, deviceId) {
    return this.sessionModel.deleteOne({ userId, deviceId: { $ne: deviceId } });
  }

  //For Cron Job
  async deleteAllExpiredSessions(expiresISOString: string) {
    return this.sessionModel.deleteMany({
      lastActiveDate: { $lt: expiresISOString },
    });
  }

  async deleteAllUserSession(userId: string) {
    return this.sessionModel.deleteMany({ userId });
  }
}
