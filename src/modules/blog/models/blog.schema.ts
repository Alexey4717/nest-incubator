import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ id: false, versionKey: false })
export class Blog {
  @Prop({ required: true, unique: true, type: String })
  id: string;

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
