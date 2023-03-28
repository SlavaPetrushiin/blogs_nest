import { BlogQueryRepositoryMongodb } from './../../blogs/infrastructure/blog-query.repository';
import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'BlogIsExist', async: false })
@Injectable()
export class CheckBlogId implements ValidatorConstraintInterface {
  constructor(private blogQueryRepository: BlogQueryRepositoryMongodb) {}

  async validate(blogId: string): Promise<boolean> {
    try {
      const blog = await this.blogQueryRepository.findBlog(blogId);

      if (blog) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}
