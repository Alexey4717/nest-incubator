import { Inject, Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { BlogQueryRepository } from '../infrastructure/blog-query.repository.mongodb';

// TODO вероятно удалить этот валидатор, т.к. он не используется
@ValidatorConstraint({ name: 'BlogExists', async: true })
@Injectable()
export class BlogExistsValidator implements ValidatorConstraintInterface {
  constructor(
    @Inject(BlogQueryRepository)
    private blogQueryRepository: BlogQueryRepository,
  ) {}

  async validate(id: string) {
    try {
      const blog = await this.blogQueryRepository.findBlogById(id);
      if (!blog) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return "Blog doesn't exist";
  }
}
