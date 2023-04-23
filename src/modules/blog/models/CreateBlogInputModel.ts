import {GetBlogOutputModel} from "./GetBlogOutputModel";

export type CreateBlogInputModel = {
    /**
     * Set name of blog. Required. Max length: 15.
     */
    name: GetBlogOutputModel["name"],

    /**
     * Set description of blog. Required. Max length: 500.
     */
    description: GetBlogOutputModel["description"],

    /**
     * Set websiteUrl to blog. Required. Max length: 100. Pattern: ^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$
     */
    websiteUrl: GetBlogOutputModel["websiteUrl"]
}
