import { BlogsService } from './../../blogs/blogs.service';
import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'BlogIsExist', async: false })
@Injectable()
export class CheckBlogId implements ValidatorConstraintInterface {
  constructor(private readonly blogsService: BlogsService) {}

  async validate(blogId: string): Promise<boolean> {
    try {
      const blog = await this.blogsService.getBlog(blogId);

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
