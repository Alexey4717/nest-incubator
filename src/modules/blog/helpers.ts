import { GetBlogOutputModelFromMongoDB } from './models/GetBlogOutputModel';
import { BlogViewModel } from './types/view-models';

export const getMappedBlogViewModel = ({
  id,
  name,
  description,
  websiteUrl,
  isMembership,
  createdAt,
}: GetBlogOutputModelFromMongoDB): BlogViewModel => ({
  id,
  name,
  description,
  websiteUrl,
  isMembership: isMembership ?? false,
  createdAt,
});
