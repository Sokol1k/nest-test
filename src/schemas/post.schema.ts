import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'

@Schema({
  timestamps: true
})
export class Post {
  @Prop({
    type: String,
    required: true
  })
  title: string

  @Prop({
    type: String,
    required: true
  })
  description: string

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  })
  userId
}

export type PostDocument = Post & Document

export const PostSchema = SchemaFactory.createForClass(Post)