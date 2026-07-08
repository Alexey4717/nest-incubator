import { BlogModel } from './blog.model';

export type UpdateBlogInputModel = Pick<BlogModel, 'name' | 'description' | 'websiteUrl'>;
