import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type BlogDocument = HydratedDocument<Blog>;

@Schema({
  timestamps: true,
  toJSON: {
    transform: function (doc: any, ret: any) {
      delete ret.__v;
      delete ret._id;
      delete ret.updatedAt;
      return ret;
    },
  },
})
export class Blog {
  createdAt: string;

  @Prop({
    type: String,
    default: function genUUID() {
      return uuidv4();
    },
  })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop({ required: true })
  description: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
