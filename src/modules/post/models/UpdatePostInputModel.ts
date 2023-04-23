import {GetPostOutputModel} from "./GetPostOutputModel";

export type UpdatePostInputModel = {
    /**
     * Update title of post. Required. Max length: 30.
     */
    title: GetPostOutputModel["title"],

    /**
     * Update description of post. Required. Max length: 100.
     */
    shortDescription: GetPostOutputModel["shortDescription"],

    /**
     * Update content for post. Required. Max length: 1000.
     */
    content: GetPostOutputModel["content"],

    /**
     * Update blogId to post. Required.
     */
    blogId: GetPostOutputModel["blogId"]
}
