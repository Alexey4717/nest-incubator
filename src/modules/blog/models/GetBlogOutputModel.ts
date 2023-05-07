export type GetBlogOutputModel = {
  /**
   * Name of blog from db, required.
   */
  name: string;

  /**
   * Description of blog from db, required.
   */
  description: string;

  /**
   * WebsiteUrl to blog from db, required.
   */
  websiteUrl: string;

  /**
   * True if user has not expired membership subscription to blog.
   */
  isMembership: boolean;

  /**
   * Date of blog creation in db.
   */
  createdAt: string;
};

export type GetBlogOutputModelFromMongoDB = GetBlogOutputModel & {
  /**
   * Id of blog from mongo db.
   */
  id: string;
};

export type GetMappedBlogOutputModel = GetBlogOutputModel & {
  /**
   * Id of blog from db, required.
   */
  id: string;
};
