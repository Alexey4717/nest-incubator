
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/": {
        "get": {
          "operationId": "AppController_getHello",
          "summary": "Health check endpoint",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Returns hello message",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string",
                    "example": "Hello World!"
                  }
                }
              }
            }
          },
          "tags": [
            "App"
          ]
        }
      },
      "/testing/all-data": {
        "delete": {
          "operationId": "TestingController_deleteAllData",
          "summary": "Clear all data (for testing purposes only)",
          "parameters": [],
          "responses": {
            "204": {
              "description": "All data deleted"
            }
          },
          "tags": [
            "Testing"
          ]
        }
      },
      "/sa/users": {
        "get": {
          "operationId": "UserController_getUsers",
          "summary": "Returns users with pagination and sorting",
          "parameters": [
            {
              "name": "pageNumber",
              "required": true,
              "in": "query",
              "example": 1,
              "schema": {
                "minimum": 1,
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": true,
              "in": "query",
              "example": 10,
              "schema": {
                "minimum": 1,
                "maximum": 100,
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortDirection",
              "required": true,
              "in": "query",
              "example": "desc",
              "schema": {
                "default": "desc",
                "enum": [
                  "asc",
                  "desc"
                ],
                "type": "string"
              }
            },
            {
              "name": "sortBy",
              "required": true,
              "in": "query",
              "example": "createdAt",
              "schema": {
                "default": "createdAt",
                "enum": [
                  "login",
                  "email",
                  "createdAt"
                ],
                "type": "string"
              }
            },
            {
              "name": "searchLoginTerm",
              "required": false,
              "in": "query",
              "example": "user",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "searchEmailTerm",
              "required": false,
              "in": "query",
              "example": "example.com",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PaginatedUsersViewDto"
                  }
                }
              }
            },
            "401": {
              "description": "Invalid basic auth credentials"
            }
          },
          "tags": [
            "Users (Admin)"
          ],
          "security": [
            {
              "basic": []
            }
          ]
        },
        "post": {
          "operationId": "UserController_createUser",
          "summary": "Create new user",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUserDTO"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UserViewDto"
                  }
                }
              }
            },
            "400": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ValidationErrorResponseDto"
                  }
                }
              }
            },
            "401": {
              "description": "Invalid basic auth credentials"
            }
          },
          "tags": [
            "Users (Admin)"
          ],
          "security": [
            {
              "basic": []
            }
          ]
        }
      },
      "/sa/users/{id}": {
        "delete": {
          "operationId": "UserController_deleteUser",
          "summary": "Delete user by id",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "User id",
              "schema": {}
            }
          ],
          "responses": {
            "204": {
              "description": "User deleted"
            },
            "401": {
              "description": "Invalid basic auth credentials"
            },
            "404": {
              "description": "User not found"
            }
          },
          "tags": [
            "Users (Admin)"
          ],
          "security": [
            {
              "basic": []
            }
          ]
        }
      },
      "/auth/login": {
        "post": {
          "operationId": "AuthController_login",
          "summary": "Try login user into system",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LoginDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Returns JWT access token in body and refresh token in cookie",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/AccessTokenViewDto"
                  }
                }
              }
            },
            "400": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ValidationErrorResponseDto"
                  }
                }
              }
            },
            "401": {
              "description": "Invalid credentials"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/password-recovery": {
        "post": {
          "operationId": "AuthController_passwordRecovery",
          "summary": "Password recovery via email",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RecoveryPasswordDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Recovery email sent if user exists"
            },
            "400": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ValidationErrorResponseDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/new-password": {
        "post": {
          "operationId": "AuthController_newPassword",
          "summary": "Set new password using recovery code",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/NewPasswordDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Password updated successfully"
            },
            "400": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ValidationErrorResponseDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/refresh-token": {
        "post": {
          "operationId": "AuthController_refreshToken",
          "summary": "Generate new pair of access and refresh tokens",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Returns new JWT access token and updates refresh token cookie",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/AccessTokenViewDto"
                  }
                }
              }
            },
            "401": {
              "description": "Invalid or missing refresh token"
            }
          },
          "tags": [
            "Auth"
          ],
          "security": [
            {
              "refreshToken": []
            }
          ]
        }
      },
      "/auth/registration": {
        "post": {
          "operationId": "AuthController_registration",
          "summary": "Registration in the system",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RegistrationDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Confirmation email sent"
            },
            "400": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ValidationErrorResponseDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/registration-email-resending": {
        "post": {
          "operationId": "AuthController_registrationEmailResending",
          "summary": "Resend registration confirmation email",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RegistrationEmailResendingDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Confirmation email resent"
            },
            "400": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ValidationErrorResponseDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/registration-confirmation": {
        "post": {
          "operationId": "AuthController_registrationConfirmation",
          "summary": "Confirm registration using code from email",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RegistrationConfirmationDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Registration confirmed"
            },
            "400": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ValidationErrorResponseDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/logout": {
        "post": {
          "operationId": "AuthController_logout",
          "summary": "Terminate all sessions (logout)",
          "parameters": [],
          "responses": {
            "204": {
              "description": "Logged out successfully"
            },
            "401": {
              "description": "Invalid refresh token"
            }
          },
          "tags": [
            "Auth"
          ],
          "security": [
            {
              "refreshToken": []
            }
          ]
        }
      },
      "/auth/me": {
        "get": {
          "operationId": "AuthController_aboutMe",
          "summary": "Get information about current user",
          "parameters": [],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/MeViewDto"
                  }
                }
              }
            },
            "401": {
              "description": "Invalid access token"
            },
            "404": {
              "description": "User not found"
            }
          },
          "tags": [
            "Auth"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/comments/{id}": {
        "get": {
          "operationId": "CommentController_getComment",
          "summary": "Returns comment by id",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "Comment id",
              "schema": {}
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CommentViewDto"
                  }
                }
              }
            },
            "404": {
              "description": "Comment not found"
            }
          },
          "tags": [
            "Comments"
          ]
        }
      },
      "/comments/{commentId}/like-status": {
        "put": {
          "operationId": "CommentController_changeLikeStatus",
          "summary": "Like or dislike comment",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "description": "Comment id",
              "schema": {}
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LikeInputDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Like status updated"
            },
            "400": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ValidationErrorResponseDto"
                  }
                }
              }
            },
            "401": {
              "description": "Invalid access token"
            },
            "404": {
              "description": "Comment not found"
            }
          },
          "tags": [
            "Comments"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/comments/{commentId}": {
        "put": {
          "operationId": "CommentController_updateComment",
          "summary": "Update existing comment by id",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "description": "Comment id",
              "schema": {}
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateCommentDTO"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Comment updated"
            },
            "400": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ValidationErrorResponseDto"
                  }
                }
              }
            },
            "401": {
              "description": "Invalid access token"
            },
            "403": {
              "description": "Not comment owner"
            },
            "404": {
              "description": "Comment not found"
            }
          },
          "tags": [
            "Comments"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "delete": {
          "operationId": "CommentController_deleteComment",
          "summary": "Delete comment by id",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "description": "Comment id",
              "schema": {}
            }
          ],
          "responses": {
            "204": {
              "description": "Comment deleted"
            },
            "401": {
              "description": "Invalid access token"
            },
            "403": {
              "description": "Not comment owner"
            },
            "404": {
              "description": "Comment not found"
            }
          },
          "tags": [
            "Comments"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/posts": {
        "get": {
          "operationId": "PostController_getPosts",
          "summary": "Returns all posts with pagination and sorting",
          "parameters": [
            {
              "name": "pageNumber",
              "required": true,
              "in": "query",
              "example": 1,
              "schema": {
                "minimum": 1,
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": true,
              "in": "query",
              "example": 10,
              "schema": {
                "minimum": 1,
                "maximum": 100,
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortDirection",
              "required": true,
              "in": "query",
              "example": "desc",
              "schema": {
                "default": "desc",
                "enum": [
                  "asc",
                  "desc"
                ],
                "type": "string"
              }
            },
            {
              "name": "sortBy",
              "required": true,
              "in": "query",
              "example": "createdAt",
              "schema": {
                "default": "createdAt",
                "enum": [
                  "title",
                  "blogName",
                  "createdAt"
                ],
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PaginatedPostsViewDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Posts"
          ]
        },
        "post": {
          "operationId": "PostController_createPost",
          "summary": "Create new post",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreatePostDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PostViewDto"
                  }
                }
              }
            },
            "400": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ValidationErrorResponseDto"
                  }
                }
              }
            },
            "401": {
              "description": "Invalid basic auth credentials"
            },
            "404": {
              "description": "Blog not found"
            }
          },
          "tags": [
            "Posts"
          ],
          "security": [
            {
              "basic": []
            }
          ]
        }
      },
      "/posts/{id}": {
        "get": {
          "operationId": "PostController_getPost",
          "summary": "Returns post by id",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "Post id",
              "schema": {}
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PostViewDto"
                  }
                }
              }
            },
            "404": {
              "description": "Post not found"
            }
          },
          "tags": [
            "Posts"
          ]
        },
        "put": {
          "operationId": "PostController_updatePost",
          "summary": "Update existing post by id",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "Post id",
              "schema": {}
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdatePostDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Post updated"
            },
            "400": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ValidationErrorResponseDto"
                  }
                }
              }
            },
            "401": {
              "description": "Invalid basic auth credentials"
            },
            "404": {
              "description": "Post not found"
            }
          },
          "tags": [
            "Posts"
          ],
          "security": [
            {
              "basic": []
            }
          ]
        },
        "delete": {
          "operationId": "PostController_deletePost",
          "summary": "Delete post by id",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "Post id",
              "schema": {}
            }
          ],
          "responses": {
            "204": {
              "description": "Post deleted"
            },
            "401": {
              "description": "Invalid basic auth credentials"
            },
            "404": {
              "description": "Post not found"
            }
          },
          "tags": [
            "Posts"
          ],
          "security": [
            {
              "basic": []
            }
          ]
        }
      },
      "/posts/{postId}/comments": {
        "get": {
          "operationId": "PostController_getCommentsOfPost",
          "summary": "Returns comments for specified post",
          "parameters": [
            {
              "name": "pageNumber",
              "required": true,
              "in": "query",
              "example": 1,
              "schema": {
                "minimum": 1,
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": true,
              "in": "query",
              "example": 10,
              "schema": {
                "minimum": 1,
                "maximum": 100,
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortDirection",
              "required": true,
              "in": "query",
              "example": "desc",
              "schema": {
                "default": "desc",
                "enum": [
                  "asc",
                  "desc"
                ],
                "type": "string"
              }
            },
            {
              "name": "sortBy",
              "required": true,
              "in": "query",
              "example": "createdAt",
              "schema": {
                "default": "createdAt",
                "enum": [
                  "content",
                  "createdAt"
                ],
                "type": "string"
              }
            },
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "description": "Post id",
              "schema": {}
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PaginatedCommentsViewDto"
                  }
                }
              }
            },
            "404": {
              "description": "Post not found"
            }
          },
          "tags": [
            "Posts"
          ]
        },
        "post": {
          "operationId": "PostController_createCommentInPost",
          "summary": "Create new comment for post",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "description": "Post id",
              "schema": {}
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateCommentInPostDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CommentViewDto"
                  }
                }
              }
            },
            "400": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ValidationErrorResponseDto"
                  }
                }
              }
            },
            "401": {
              "description": "Invalid access token"
            },
            "404": {
              "description": "Post or user not found"
            }
          },
          "tags": [
            "Posts"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/posts/{postId}/like-status": {
        "put": {
          "operationId": "PostController_updatePostLikeStatus",
          "summary": "Like or dislike post",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "description": "Post id",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LikeInputDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Like status updated"
            },
            "400": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ValidationErrorResponseDto"
                  }
                }
              }
            },
            "401": {
              "description": "Invalid access token"
            },
            "404": {
              "description": "Post not found"
            }
          },
          "tags": [
            "Posts"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/blogs": {
        "get": {
          "operationId": "BlogController_getBlogs",
          "summary": "Returns blogs with pagination and sorting",
          "parameters": [
            {
              "name": "pageNumber",
              "required": true,
              "in": "query",
              "example": 1,
              "schema": {
                "minimum": 1,
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": true,
              "in": "query",
              "example": 10,
              "schema": {
                "minimum": 1,
                "maximum": 100,
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortDirection",
              "required": true,
              "in": "query",
              "example": "desc",
              "schema": {
                "default": "desc",
                "enum": [
                  "asc",
                  "desc"
                ],
                "type": "string"
              }
            },
            {
              "name": "sortBy",
              "required": true,
              "in": "query",
              "example": "createdAt",
              "schema": {
                "default": "createdAt",
                "enum": [
                  "name",
                  "websiteUrl",
                  "description",
                  "isMembership",
                  "createdAt"
                ],
                "type": "string"
              }
            },
            {
              "name": "searchNameTerm",
              "required": false,
              "in": "query",
              "example": "blog",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PaginatedBlogsViewDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Blogs"
          ]
        }
      },
      "/blogs/{blogId}/posts": {
        "get": {
          "operationId": "BlogController_getPostsOfBlog",
          "summary": "Returns posts for specified blog",
          "parameters": [
            {
              "name": "pageNumber",
              "required": true,
              "in": "query",
              "example": 1,
              "schema": {
                "minimum": 1,
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": true,
              "in": "query",
              "example": 10,
              "schema": {
                "minimum": 1,
                "maximum": 100,
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortDirection",
              "required": true,
              "in": "query",
              "example": "desc",
              "schema": {
                "default": "desc",
                "enum": [
                  "asc",
                  "desc"
                ],
                "type": "string"
              }
            },
            {
              "name": "sortBy",
              "required": true,
              "in": "query",
              "example": "createdAt",
              "schema": {
                "default": "createdAt",
                "enum": [
                  "title",
                  "blogName",
                  "createdAt"
                ],
                "type": "string"
              }
            },
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "description": "Blog id",
              "schema": {}
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PaginatedPostsViewDto"
                  }
                }
              }
            },
            "404": {
              "description": "Blog not found"
            }
          },
          "tags": [
            "Blogs"
          ]
        }
      },
      "/blogs/{id}": {
        "get": {
          "operationId": "BlogController_getBlog",
          "summary": "Returns blog by id",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "Blog id",
              "schema": {}
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/BlogViewDto"
                  }
                }
              }
            },
            "404": {
              "description": "Blog not found"
            }
          },
          "tags": [
            "Blogs"
          ]
        }
      },
      "/sa/blogs": {
        "get": {
          "operationId": "SaBlogController_getBlogs",
          "summary": "Returns blogs with pagination and sorting",
          "parameters": [
            {
              "name": "pageNumber",
              "required": true,
              "in": "query",
              "example": 1,
              "schema": {
                "minimum": 1,
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": true,
              "in": "query",
              "example": 10,
              "schema": {
                "minimum": 1,
                "maximum": 100,
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortDirection",
              "required": true,
              "in": "query",
              "example": "desc",
              "schema": {
                "default": "desc",
                "enum": [
                  "asc",
                  "desc"
                ],
                "type": "string"
              }
            },
            {
              "name": "sortBy",
              "required": true,
              "in": "query",
              "example": "createdAt",
              "schema": {
                "default": "createdAt",
                "enum": [
                  "name",
                  "websiteUrl",
                  "description",
                  "isMembership",
                  "createdAt"
                ],
                "type": "string"
              }
            },
            {
              "name": "searchNameTerm",
              "required": false,
              "in": "query",
              "example": "blog",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PaginatedBlogsViewDto"
                  }
                }
              }
            },
            "401": {
              "description": "Invalid basic auth credentials"
            }
          },
          "tags": [
            "Blogs (Admin)"
          ],
          "security": [
            {
              "basic": []
            }
          ]
        },
        "post": {
          "operationId": "SaBlogController_createBlog",
          "summary": "Create new blog",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateBlogDTO"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/BlogViewDto"
                  }
                }
              }
            },
            "400": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ValidationErrorResponseDto"
                  }
                }
              }
            },
            "401": {
              "description": "Invalid basic auth credentials"
            }
          },
          "tags": [
            "Blogs (Admin)"
          ],
          "security": [
            {
              "basic": []
            }
          ]
        }
      },
      "/sa/blogs/{id}": {
        "put": {
          "operationId": "SaBlogController_updateBlog",
          "summary": "Update existing blog by id",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "Blog id",
              "schema": {}
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateBlogDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Blog updated"
            },
            "400": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ValidationErrorResponseDto"
                  }
                }
              }
            },
            "401": {
              "description": "Invalid basic auth credentials"
            },
            "404": {
              "description": "Blog not found"
            }
          },
          "tags": [
            "Blogs (Admin)"
          ],
          "security": [
            {
              "basic": []
            }
          ]
        },
        "delete": {
          "operationId": "SaBlogController_deleteBlog",
          "summary": "Delete blog by id",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "Blog id",
              "schema": {}
            }
          ],
          "responses": {
            "204": {
              "description": "Blog deleted"
            },
            "401": {
              "description": "Invalid basic auth credentials"
            },
            "404": {
              "description": "Blog not found"
            }
          },
          "tags": [
            "Blogs (Admin)"
          ],
          "security": [
            {
              "basic": []
            }
          ]
        }
      },
      "/sa/blogs/{blogId}/posts": {
        "post": {
          "operationId": "SaBlogController_createPostInBlog",
          "summary": "Create new post for specific blog",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "description": "Blog id",
              "schema": {}
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreatePostInBlogDTO"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PostViewDto"
                  }
                }
              }
            },
            "400": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ValidationErrorResponseDto"
                  }
                }
              }
            },
            "401": {
              "description": "Invalid basic auth credentials"
            },
            "404": {
              "description": "Blog not found"
            }
          },
          "tags": [
            "Blogs (Admin)"
          ],
          "security": [
            {
              "basic": []
            }
          ]
        }
      },
      "/sa/blogs/{blogId}/posts/{postId}": {
        "put": {
          "operationId": "SaBlogController_updatePost",
          "summary": "Update post belonging to specific blog",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "description": "Blog id",
              "schema": {}
            },
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "description": "Post id",
              "schema": {}
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreatePostInBlogDTO"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Post updated"
            },
            "400": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ValidationErrorResponseDto"
                  }
                }
              }
            },
            "401": {
              "description": "Invalid basic auth credentials"
            },
            "404": {
              "description": "Blog or post not found"
            }
          },
          "tags": [
            "Blogs (Admin)"
          ],
          "security": [
            {
              "basic": []
            }
          ]
        },
        "delete": {
          "operationId": "SaBlogController_deletePost",
          "summary": "Delete post belonging to specific blog",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "description": "Blog id",
              "schema": {}
            },
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "description": "Post id",
              "schema": {}
            }
          ],
          "responses": {
            "204": {
              "description": "Post deleted"
            },
            "401": {
              "description": "Invalid basic auth credentials"
            },
            "404": {
              "description": "Blog or post not found"
            }
          },
          "tags": [
            "Blogs (Admin)"
          ],
          "security": [
            {
              "basic": []
            }
          ]
        }
      },
      "/security/devices": {
        "get": {
          "operationId": "SecurityController_getDevices",
          "summary": "Returns all active sessions (devices) for current user",
          "parameters": [],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/SecurityDeviceViewDto"
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Invalid refresh token"
            }
          },
          "tags": [
            "Security"
          ],
          "security": [
            {
              "refreshToken": []
            }
          ]
        },
        "delete": {
          "operationId": "SecurityController_terminateOtherDevices",
          "summary": "Terminate all other sessions except current",
          "parameters": [],
          "responses": {
            "204": {
              "description": "Other sessions terminated"
            },
            "401": {
              "description": "Invalid refresh token"
            }
          },
          "tags": [
            "Security"
          ],
          "security": [
            {
              "refreshToken": []
            }
          ]
        }
      },
      "/security/devices/{deviceId}": {
        "delete": {
          "operationId": "SecurityController_terminateDevice",
          "summary": "Terminate session by device id",
          "parameters": [
            {
              "name": "deviceId",
              "required": true,
              "in": "path",
              "description": "Device id",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "Session terminated"
            },
            "401": {
              "description": "Invalid refresh token"
            },
            "403": {
              "description": "Cannot terminate current device session"
            },
            "404": {
              "description": "Device not found"
            }
          },
          "tags": [
            "Security"
          ],
          "security": [
            {
              "refreshToken": []
            }
          ]
        }
      }
    },
    "info": {
      "title": "BLOGGER API",
      "description": "",
      "version": "1.0",
      "contact": {}
    },
    "tags": [],
    "servers": [],
    "components": {
      "securitySchemes": {
        "bearer": {
          "scheme": "bearer",
          "bearerFormat": "JWT",
          "type": "http"
        },
        "basic": {
          "type": "http",
          "scheme": "basic"
        },
        "cookie": {
          "type": "apiKey",
          "in": "cookie",
          "name": "refreshToken"
        }
      },
      "schemas": {
        "UserViewDto": {
          "type": "object",
          "properties": {
            "id": {
              "type": "object",
              "example": "uuid"
            },
            "login": {
              "type": "object",
              "example": "userLogin"
            },
            "email": {
              "type": "object",
              "example": "user@example.com"
            },
            "createdAt": {
              "type": "object",
              "example": "2024-01-01T00:00:00.000Z"
            }
          },
          "required": [
            "id",
            "login",
            "email",
            "createdAt"
          ]
        },
        "PaginatedUsersViewDto": {
          "type": "object",
          "properties": {
            "page": {
              "type": "object",
              "example": 1
            },
            "pageSize": {
              "type": "object",
              "example": 10
            },
            "pagesCount": {
              "type": "object",
              "example": 1
            },
            "totalCount": {
              "type": "object",
              "example": 0
            },
            "items": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/UserViewDto"
              }
            }
          },
          "required": [
            "page",
            "pageSize",
            "pagesCount",
            "totalCount",
            "items"
          ]
        },
        "CreateUserDTO": {
          "type": "object",
          "properties": {
            "login": {
              "type": "object",
              "minLength": 3,
              "maxLength": 10,
              "example": "userLogin"
            },
            "password": {
              "type": "object",
              "minLength": 6,
              "maxLength": 20,
              "example": "password123"
            },
            "email": {
              "type": "object",
              "example": "user@example.com"
            }
          },
          "required": [
            "login",
            "password",
            "email"
          ]
        },
        "FieldErrorDto": {
          "type": "object",
          "properties": {
            "message": {
              "type": "object",
              "example": "Invalid value"
            },
            "field": {
              "type": "object",
              "example": "email"
            }
          },
          "required": [
            "message",
            "field"
          ]
        },
        "ValidationErrorResponseDto": {
          "type": "object",
          "properties": {
            "errorsMessages": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/FieldErrorDto"
              }
            }
          },
          "required": [
            "errorsMessages"
          ]
        },
        "LoginDto": {
          "type": "object",
          "properties": {
            "loginOrEmail": {
              "type": "object",
              "example": "user@example.com"
            },
            "password": {
              "type": "object",
              "example": "password123"
            }
          },
          "required": [
            "loginOrEmail",
            "password"
          ]
        },
        "AccessTokenViewDto": {
          "type": "object",
          "properties": {
            "accessToken": {
              "type": "object",
              "example": "jwt-access-token"
            }
          },
          "required": [
            "accessToken"
          ]
        },
        "RecoveryPasswordDto": {
          "type": "object",
          "properties": {
            "email": {
              "type": "object",
              "example": "user@example.com"
            }
          },
          "required": [
            "email"
          ]
        },
        "NewPasswordDto": {
          "type": "object",
          "properties": {
            "newPassword": {
              "type": "object",
              "minLength": 6,
              "maxLength": 20,
              "example": "newPassword123"
            },
            "recoveryCode": {
              "type": "object",
              "format": "uuid",
              "example": "550e8400-e29b-41d4-a716-446655440000"
            }
          },
          "required": [
            "newPassword",
            "recoveryCode"
          ]
        },
        "RegistrationDto": {
          "type": "object",
          "properties": {
            "login": {
              "type": "object",
              "minLength": 3,
              "maxLength": 10,
              "example": "userLogin"
            },
            "email": {
              "type": "object",
              "example": "user@example.com"
            },
            "password": {
              "type": "object",
              "minLength": 6,
              "maxLength": 20,
              "example": "password123"
            }
          },
          "required": [
            "login",
            "email",
            "password"
          ]
        },
        "RegistrationEmailResendingDto": {
          "type": "object",
          "properties": {
            "email": {
              "type": "object",
              "example": "user@example.com"
            }
          },
          "required": [
            "email"
          ]
        },
        "RegistrationConfirmationDto": {
          "type": "object",
          "properties": {
            "code": {
              "type": "object",
              "minLength": 1,
              "maxLength": 255,
              "example": "confirmation-code"
            }
          },
          "required": [
            "code"
          ]
        },
        "MeViewDto": {
          "type": "object",
          "properties": {
            "email": {
              "type": "object",
              "example": "user@example.com"
            },
            "login": {
              "type": "object",
              "example": "userLogin"
            },
            "userId": {
              "type": "object",
              "example": "uuid"
            }
          },
          "required": [
            "email",
            "login",
            "userId"
          ]
        },
        "CommentatorInfoViewDto": {
          "type": "object",
          "properties": {
            "userId": {
              "type": "object",
              "example": "uuid"
            },
            "userLogin": {
              "type": "object",
              "example": "userLogin"
            }
          },
          "required": [
            "userId",
            "userLogin"
          ]
        },
        "LikesInfoViewDto": {
          "type": "object",
          "properties": {
            "likesCount": {
              "type": "object",
              "example": 0
            },
            "dislikesCount": {
              "type": "object",
              "example": 0
            },
            "myStatus": {
              "type": "string",
              "enum": [
                "None",
                "Like",
                "Dislike"
              ],
              "example": "None"
            }
          },
          "required": [
            "likesCount",
            "dislikesCount",
            "myStatus"
          ]
        },
        "CommentViewDto": {
          "type": "object",
          "properties": {
            "id": {
              "type": "object",
              "example": "uuid"
            },
            "content": {
              "type": "object",
              "example": "Comment content"
            },
            "commentatorInfo": {
              "$ref": "#/components/schemas/CommentatorInfoViewDto"
            },
            "createdAt": {
              "type": "object",
              "example": "2024-01-01T00:00:00.000Z"
            },
            "likesInfo": {
              "$ref": "#/components/schemas/LikesInfoViewDto"
            }
          },
          "required": [
            "id",
            "content",
            "commentatorInfo",
            "createdAt"
          ]
        },
        "LikeInputDto": {
          "type": "object",
          "properties": {
            "likeStatus": {
              "type": "string",
              "enum": [
                "None",
                "Like",
                "Dislike"
              ],
              "description": "Like status of entity (None, Like, Dislike)",
              "example": "Like"
            }
          },
          "required": [
            "likeStatus"
          ]
        },
        "UpdateCommentDTO": {
          "type": "object",
          "properties": {
            "content": {
              "type": "object",
              "minLength": 20,
              "maxLength": 300,
              "example": "Updated comment content text"
            }
          },
          "required": [
            "content"
          ]
        },
        "LikeDetailsViewDto": {
          "type": "object",
          "properties": {
            "addedAt": {
              "type": "object",
              "example": "2024-01-01T00:00:00.000Z"
            },
            "userId": {
              "type": "string",
              "example": "uuid"
            },
            "login": {
              "type": "string",
              "example": "userLogin"
            }
          },
          "required": [
            "addedAt"
          ]
        },
        "ExtendedLikesInfoViewDto": {
          "type": "object",
          "properties": {
            "likesCount": {
              "type": "object",
              "example": 0
            },
            "dislikesCount": {
              "type": "object",
              "example": 0
            },
            "myStatus": {
              "type": "string",
              "enum": [
                "None",
                "Like",
                "Dislike"
              ],
              "example": "None"
            },
            "newestLikes": {
              "nullable": true,
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/LikeDetailsViewDto"
              }
            }
          },
          "required": [
            "likesCount",
            "dislikesCount",
            "myStatus"
          ]
        },
        "PostViewDto": {
          "type": "object",
          "properties": {
            "id": {
              "type": "object",
              "example": "uuid"
            },
            "title": {
              "type": "object",
              "example": "Post title"
            },
            "shortDescription": {
              "type": "object",
              "example": "Short description"
            },
            "content": {
              "type": "object",
              "example": "Post content"
            },
            "blogId": {
              "type": "object",
              "example": "uuid"
            },
            "blogName": {
              "type": "object",
              "example": "Blog name"
            },
            "createdAt": {
              "type": "string",
              "example": "2024-01-01T00:00:00.000Z"
            },
            "extendedLikesInfo": {
              "$ref": "#/components/schemas/ExtendedLikesInfoViewDto"
            }
          },
          "required": [
            "id",
            "title",
            "shortDescription",
            "content",
            "blogId",
            "blogName",
            "extendedLikesInfo"
          ]
        },
        "PaginatedPostsViewDto": {
          "type": "object",
          "properties": {
            "page": {
              "type": "object",
              "example": 1
            },
            "pageSize": {
              "type": "object",
              "example": 10
            },
            "pagesCount": {
              "type": "object",
              "example": 1
            },
            "totalCount": {
              "type": "object",
              "example": 0
            },
            "items": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/PostViewDto"
              }
            }
          },
          "required": [
            "page",
            "pageSize",
            "pagesCount",
            "totalCount",
            "items"
          ]
        },
        "PaginatedCommentsViewDto": {
          "type": "object",
          "properties": {
            "page": {
              "type": "object",
              "example": 1
            },
            "pageSize": {
              "type": "object",
              "example": 10
            },
            "pagesCount": {
              "type": "object",
              "example": 1
            },
            "totalCount": {
              "type": "object",
              "example": 0
            },
            "items": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/CommentViewDto"
              }
            }
          },
          "required": [
            "page",
            "pageSize",
            "pagesCount",
            "totalCount",
            "items"
          ]
        },
        "CreatePostDto": {
          "type": "object",
          "properties": {
            "title": {
              "type": "object",
              "maxLength": 30,
              "example": "Post title"
            },
            "shortDescription": {
              "type": "object",
              "maxLength": 100,
              "example": "Short description"
            },
            "content": {
              "type": "object",
              "maxLength": 1000,
              "example": "Post content"
            },
            "blogId": {
              "type": "object",
              "example": "550e8400-e29b-41d4-a716-446655440000"
            }
          },
          "required": [
            "title",
            "shortDescription",
            "content",
            "blogId"
          ]
        },
        "CreateCommentInPostDto": {
          "type": "object",
          "properties": {
            "content": {
              "type": "object",
              "minLength": 20,
              "maxLength": 300,
              "example": "This is a comment content text"
            }
          },
          "required": [
            "content"
          ]
        },
        "UpdatePostDto": {
          "type": "object",
          "properties": {
            "title": {
              "type": "object",
              "maxLength": 30,
              "example": "Post title"
            },
            "shortDescription": {
              "type": "object",
              "maxLength": 100,
              "example": "Short description"
            },
            "content": {
              "type": "object",
              "maxLength": 1000,
              "example": "Post content"
            },
            "blogId": {
              "type": "object",
              "example": "550e8400-e29b-41d4-a716-446655440000"
            }
          },
          "required": [
            "title",
            "shortDescription",
            "content",
            "blogId"
          ]
        },
        "BlogViewDto": {
          "type": "object",
          "properties": {
            "id": {
              "type": "object",
              "example": "uuid"
            },
            "name": {
              "type": "object",
              "example": "Blog name"
            },
            "websiteUrl": {
              "type": "object",
              "example": "https://example.com"
            },
            "description": {
              "type": "object",
              "example": "Blog description"
            },
            "isMembership": {
              "type": "object",
              "example": false
            },
            "createdAt": {
              "type": "object",
              "example": "2024-01-01T00:00:00.000Z"
            }
          },
          "required": [
            "id",
            "name",
            "websiteUrl",
            "description",
            "isMembership",
            "createdAt"
          ]
        },
        "PaginatedBlogsViewDto": {
          "type": "object",
          "properties": {
            "page": {
              "type": "object",
              "example": 1
            },
            "pageSize": {
              "type": "object",
              "example": 10
            },
            "pagesCount": {
              "type": "object",
              "example": 1
            },
            "totalCount": {
              "type": "object",
              "example": 0
            },
            "items": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/BlogViewDto"
              }
            }
          },
          "required": [
            "page",
            "pageSize",
            "pagesCount",
            "totalCount",
            "items"
          ]
        },
        "CreateBlogDTO": {
          "type": "object",
          "properties": {
            "name": {
              "type": "object",
              "maxLength": 15,
              "example": "Blog name"
            },
            "description": {
              "type": "object",
              "maxLength": 500,
              "example": "Blog description"
            },
            "websiteUrl": {
              "type": "object",
              "maxLength": 100,
              "example": "https://example.com"
            }
          },
          "required": [
            "name",
            "description",
            "websiteUrl"
          ]
        },
        "UpdateBlogDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "object",
              "maxLength": 15,
              "example": "Blog name"
            },
            "description": {
              "type": "object",
              "maxLength": 500,
              "example": "Blog description"
            },
            "websiteUrl": {
              "type": "object",
              "maxLength": 100,
              "example": "https://example.com"
            }
          },
          "required": [
            "name",
            "description",
            "websiteUrl"
          ]
        },
        "CreatePostInBlogDTO": {
          "type": "object",
          "properties": {
            "title": {
              "type": "object",
              "maxLength": 30,
              "example": "Post title"
            },
            "shortDescription": {
              "type": "object",
              "maxLength": 100,
              "example": "Short description"
            },
            "content": {
              "type": "object",
              "maxLength": 1000,
              "example": "Post content"
            }
          },
          "required": [
            "title",
            "shortDescription",
            "content"
          ]
        },
        "SecurityDeviceViewDto": {
          "type": "object",
          "properties": {
            "ip": {
              "type": "object",
              "example": "127.0.0.1"
            },
            "title": {
              "type": "object",
              "example": "Chrome"
            },
            "lastActiveDate": {
              "type": "object",
              "example": "2024-01-01T00:00:00.000Z"
            },
            "deviceId": {
              "type": "object",
              "example": "uuid"
            }
          },
          "required": [
            "ip",
            "title",
            "lastActiveDate",
            "deviceId"
          ]
        }
      }
    }
  },
  "customOptions": {
    "withCredentials": true
  }
};
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
