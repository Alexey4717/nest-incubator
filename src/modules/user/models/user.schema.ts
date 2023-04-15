import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false, id: false, versionKey: false })
class AccountData {
  @Prop({ required: true, unique: true, type: String })
  login: string;

  @Prop({ required: true, unique: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  passwordHash: string;

  @Prop({
    required: true,
    type: String,
    default: new Date().toISOString(),
  })
  createdAt: string;
}

const AccountDataSchema = SchemaFactory.createForClass(AccountData);

@Schema({ _id: false, id: false, versionKey: false })
class EmailConfirmation {
  @Prop({ type: String, required: true, unique: true })
  confirmationCode: string;

  @Prop({ type: Date, required: true })
  expirationDate: Date;

  @Prop({ type: Boolean, required: true })
  isConfirmed: boolean;
}

const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation);

@Schema({ _id: false, id: false, versionKey: false })
class RecoveryData {
  @Prop({ type: String, required: true, unique: true })
  recoveryCode: string;

  @Prop({ type: Date, required: true })
  expirationDate: Date;
}

const RecoveryDataSchema = SchemaFactory.createForClass(RecoveryData);

@Schema()
export class User {
  @Prop({
    type: Types.ObjectId,
  })
  _id: Types.ObjectId;

  @Prop(AccountDataSchema)
  accountData: AccountData;

  // @ts-ignore
  @Prop(EmailConfirmationSchema)
  emailConfirmation: EmailConfirmation;

  @Prop(RecoveryDataSchema)
  recoveryData: RecoveryData;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;
