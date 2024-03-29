import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type BlogDocument = HydratedDocument<Blog>;

export interface IBlogOwnerInfo {
  userId: string;
  userLogin: string;
}

@Schema({
  timestamps: true,
  toJSON: {
    transform: function (doc: any, ret: any) {
      delete ret.__v;
      delete ret._id;
      delete ret.updatedAt;
      delete ret.createdAt;
      return ret;
    },
  },
})
export class BlogOwnerInfo {
  @Prop({ required: true })
  userId: string;

  @Prop()
  userLogin: string;
}
export const BlogOwnerInfoSchema = SchemaFactory.createForClass(BlogOwnerInfo);

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

  @Prop({
    type: Boolean,
    default: false,
  })
  isMembership: boolean;

  @Prop({ type: BlogOwnerInfo, required: true })
  blogOwnerInfo: IBlogOwnerInfo;

  @Prop({ default: false })
  isBanned: boolean;

  @Prop({ default: null })
  banDate: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

//Ban blog schema
export type BanBlogDocument = HydratedDocument<BanBlog>;
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
export class BanBlog {
  createdAt: string;

  @Prop({
    type: String,
    default: function genUUID() {
      return uuidv4();
    },
  })
  id: string;

  @Prop({ required: true })
  isBanned: boolean;

  @Prop({ required: true })
  banReason: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  login: string;
}
export const BanBlogSchema = SchemaFactory.createForClass(BanBlog);
