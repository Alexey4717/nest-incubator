
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
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/testing/all-data": {
        "delete": {
          "operationId": "TestingController_deleteAllData",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/users": {
        "get": {
          "operationId": "UserController_getUsers",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "UserController_createUser",
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
              "description": ""
            }
          }
        }
      },
      "/users/{id}": {
        "delete": {
          "operationId": "UserController_deleteUser",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/blogs": {
        "get": {
          "operationId": "BlogController_getBlogs",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "BlogController_createBlog",
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
              "description": ""
            }
          }
        }
      },
      "/blogs/{id}": {
        "get": {
          "operationId": "BlogController_getBlog",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "put": {
          "operationId": "BlogController_updateBlog",
          "parameters": [],
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
              "description": ""
            }
          }
        },
        "delete": {
          "operationId": "BlogController_deleteBlog",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/blogs/{blogId}/posts": {
        "get": {
          "operationId": "BlogController_getPostsOfBlog",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "BlogController_createPostInBlog",
          "parameters": [],
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
              "description": ""
            }
          }
        }
      },
      "/comments/{id}": {
        "get": {
          "operationId": "CommentController_getComment",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/comments/{commentId}": {
        "put": {
          "operationId": "CommentController_changeLikeStatus",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        },
        "delete": {
          "operationId": "CommentController_deleteComment",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/posts": {
        "get": {
          "operationId": "PostController_getPosts",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "PostController_createPost",
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
              "description": ""
            }
          }
        }
      },
      "/posts/{id}": {
        "get": {
          "operationId": "PostController_getPost",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "put": {
          "operationId": "PostController_updatePost",
          "parameters": [],
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
              "description": ""
            }
          }
        },
        "delete": {
          "operationId": "PostController_deletePost",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/posts/{postId}/comments": {
        "get": {
          "operationId": "PostController_getCommentsOfPost",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "PostController_createCommentInPost",
          "parameters": [],
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
              "description": ""
            }
          }
        }
      },
      "/posts/{postId}": {
        "put": {
          "operationId": "PostController_updatePostLikeStatus",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      }
    },
    "info": {
      "title": "nestjs app example",
      "description": "API description",
      "version": "1.0",
      "contact": {}
    },
    "tags": [
      {
        "name": "nestjs it-incubator app",
        "description": ""
      }
    ],
    "servers": [],
    "components": {
      "schemas": {
        "CreateUserDTO": {
          "type": "object",
          "properties": {}
        },
        "CreateBlogDTO": {
          "type": "object",
          "properties": {}
        },
        "CreatePostInBlogDTO": {
          "type": "object",
          "properties": {}
        },
        "UpdateBlogDto": {
          "type": "object",
          "properties": {}
        },
        "UpdateCommentDTO": {
          "type": "object",
          "properties": {}
        },
        "CreatePostDto": {
          "type": "object",
          "properties": {}
        },
        "CreateCommentInPostDto": {
          "type": "object",
          "properties": {}
        },
        "UpdatePostDto": {
          "type": "object",
          "properties": {}
        }
      }
    }
  },
  "customOptions": {}
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
