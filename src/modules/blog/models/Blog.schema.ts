import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ObjectId } from 'mongodb';

@Schema()
export class Blog {
  @Prop({
    type: ObjectId,
  })
  _id: ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  websiteUrl: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Boolean, default: false })
  isMembership: boolean;

  @Prop({ type: String, default: new Date().toISOString() })
  createdAt: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
export type BlogDocument = HydratedDocument<Blog>;
