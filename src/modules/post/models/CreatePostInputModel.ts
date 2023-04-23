import {GetPostOutputModel} from "./GetPostOutputModel";

export type CreatePostInputModel = {
    /**
     * Set title of post. Required. Max length: 30.
     */
    title: GetPostOutputModel["title"],

    /**
     * Set description of post. Required. Max length: 100.
     */
    shortDescription: GetPostOutputModel["shortDescription"],

    /**
     * Set content for post. Required. Max length: 1000.
     */
    content: GetPostOutputModel["content"]

    /**
     * Set blogId to post. Required.
     */
    blogId: GetPostOutputModel["blogId"]
}
