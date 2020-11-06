import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema()
export class User {
  @Prop({
    type: String,
    required: true
  })
  firstName: string

  @Prop({
    type: String,
    required: true
  })
  secondName: string

  @Prop({
    type: String,
    required: true,
    unique: true
  })
  email: string

  @Prop({
    type: String,
    required: true
  })
  password: string

  @Prop({
    type: String,
  })
  resetLink: string
}

export type UserDocument = User & Document

export const UserSchema = SchemaFactory.createForClass(User)