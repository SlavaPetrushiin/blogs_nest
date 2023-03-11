import { Injectable } from '@nestjs/common';
import { BlogsRepository } from './../../blogs/blogs.repository';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'blogId', async: true })
@Injectable()
export class CheckBlogId implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async validate(blogId: string): Promise<boolean> {
    const blog = await this.blogsRepository.findBlog(blogId);

    if (blog) {
      return true;
    } else {
      return false;
    }
  }
}
