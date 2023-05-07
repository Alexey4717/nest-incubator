import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LikeStatus } from '../../../types/common';

@Schema({ _id: false, id: false })
class CommentatorInfo {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  userLogin: string;
}

const CommentatorInfoSchema = SchemaFactory.createForClass(CommentatorInfo);

@Schema({ _id: false, id: false })
class Reaction {
  @Prop({ type: String, required: true })
  userId: string;

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
export class Comment {
  @Prop({ type: String, unique: true, required: true })
  id: string;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: String, required: true, min: 20, max: 300 })
  content: string;

  @Prop({ type: CommentatorInfoSchema })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: String, default: new Date().toISOString() })
  createdAt: string;

  @Prop({ type: [ReactionSchema], default: [] })
  reactions: Reaction[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
export type CommentDocument = HydratedDocument<Comment>;
