import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, {
  HydratedDocument,
  Schema as MongooseSchema,
  Types,
} from 'mongoose';
import { LikeStatus } from '../../../types/common';

@Schema({ _id: false, id: false })
class Reaction {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true, unique: true })
  userLogin: string;

  @Prop({ type: String, enum: LikeStatus, required: true })
  likeStatus: LikeStatus;

  @Prop({
    type: String,
    required: true,
    default: new Date().toISOString(),
  })
  createdAt: string;
}

const ReactionSchema = SchemaFactory.createForClass(Reaction);

@Schema()
export class Post {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
  })
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  shortDescription: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true, unique: true })
  blogId: string;

  @Prop({ type: String, required: true })
  blogName: string;

  @Prop({ type: String, default: new Date().toISOString() })
  createdAt: string;

  @Prop({ type: [ReactionSchema], default: [] })
  reactions: Reaction[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
export type PostDocument = HydratedDocument<Post>;
