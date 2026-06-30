import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SessionDocument = HydratedDocument<Session>;

@Schema({ id: false, versionKey: false })
export class Session {
  @Prop({ required: true, type: String }) // unique: true,
  userId: string;
  @Prop({ required: true, type: String })
  deviceId: string;
  @Prop({ required: true, type: String })
  ip: string;
  @Prop({ required: true, type: String })
  title: string;
  @Prop({ required: true, type: String })
  lastActiveDate: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
