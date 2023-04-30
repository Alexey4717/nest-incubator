import {
  GetBlogOutputModelFromMongoDB,
  GetMappedBlogOutputModel,
} from './models/GetBlogOutputModel';

export const getMappedBlogViewModel = ({
  _id,
  name,
  description,
  websiteUrl,
  isMembership,
  createdAt,
}: GetBlogOutputModelFromMongoDB): GetMappedBlogOutputModel => ({
  id: _id?.toString(),
  name,
  description,
  websiteUrl,
  isMembership,
  createdAt,
});
