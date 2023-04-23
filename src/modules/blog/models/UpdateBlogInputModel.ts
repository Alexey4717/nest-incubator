import {GetBlogOutputModel} from "./GetBlogOutputModel";

export type UpdateBlogInputModel = {
    /**
     * Update name of blog. Required. Max length: 15.
     */
    name: GetBlogOutputModel["name"],

    /**
     * Update description of blog. Required. Max length: 500.
     */
    description: GetBlogOutputModel["description"],

    /**
     * Update websiteUrl to blog. Required. Max length: 100. Pattern: ^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$
     */
    websiteUrl: GetBlogOutputModel["websiteUrl"]
}
