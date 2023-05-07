import {
  GetBlogOutputModelFromMongoDB,
  GetMappedBlogOutputModel,
} from './models/GetBlogOutputModel';

export const getMappedBlogViewModel = ({
  id,
  name,
  description,
  websiteUrl,
  isMembership,
  createdAt,
}: GetBlogOutputModelFromMongoDB): GetMappedBlogOutputModel => ({
  id,
  name,
  description,
  websiteUrl,
  isMembership,
  createdAt,
});
