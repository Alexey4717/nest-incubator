export type InvalidInputCase = {
  description: string;
  payload: Record<string, unknown>;
  expectedFields: string[];
};

const validUser = {
  login: 'user1',
  password: 'qwerty12',
  email: 'user1@test.dev',
};

const validBlog = {
  name: 'Blog name',
  description: 'Blog description',
  websiteUrl: 'https://example.com',
};

const validPost = {
  title: 'Post title',
  shortDescription: 'Short description',
  content: 'Post content long enough',
  blogId: '00000000-0000-0000-0000-000000000001',
};

const validComment = {
  content: 'Comment content long enough',
};

const validAuthRegistration = {
  login: 'authuser',
  email: 'authuser@test.dev',
  password: 'qwerty12',
};

export const invalidInputData = {
  user: [
    {
      description: 'login too short',
      payload: { ...validUser, login: 'ab' },
      expectedFields: ['login'],
    },
    {
      description: 'login too long',
      payload: { ...validUser, login: 'a'.repeat(11) },
      expectedFields: ['login'],
    },
    {
      description: 'invalid email',
      payload: { ...validUser, email: 'not-an-email' },
      expectedFields: ['email'],
    },
    {
      description: 'password too short',
      payload: { ...validUser, password: '12345' },
      expectedFields: ['password'],
    },
    {
      description: 'password too long',
      payload: { ...validUser, password: 'a'.repeat(21) },
      expectedFields: ['password'],
    },
    {
      description: 'all fields invalid at once',
      payload: { login: 'a', email: 'bad', password: '1' },
      expectedFields: ['login', 'email', 'password'],
    },
  ] satisfies InvalidInputCase[],

  blog: [
    {
      description: 'name too long',
      payload: { ...validBlog, name: 'a'.repeat(16) },
      expectedFields: ['name'],
    },
    {
      description: 'description too long',
      payload: { ...validBlog, description: 'a'.repeat(501) },
      expectedFields: ['description'],
    },
    {
      description: 'invalid websiteUrl',
      payload: { ...validBlog, websiteUrl: 'not-a-url' },
      expectedFields: ['websiteUrl'],
    },
  ] satisfies InvalidInputCase[],

  post: [
    {
      description: 'title too long',
      payload: { ...validPost, title: 'a'.repeat(31) },
      expectedFields: ['title'],
    },
    {
      description: 'shortDescription too long',
      payload: { ...validPost, shortDescription: 'a'.repeat(101) },
      expectedFields: ['shortDescription'],
    },
    {
      description: 'content too long',
      payload: { ...validPost, content: 'a'.repeat(1001) },
      expectedFields: ['content'],
    },
    {
      description: 'missing blogId',
      payload: {
        title: validPost.title,
        shortDescription: validPost.shortDescription,
        content: validPost.content,
      },
      expectedFields: ['blogId'],
    },
  ] satisfies InvalidInputCase[],

  comment: [
    {
      description: 'content too short',
      payload: { content: 'short' },
      expectedFields: ['content'],
    },
    {
      description: 'content too long',
      payload: { content: 'a'.repeat(301) },
      expectedFields: ['content'],
    },
  ] satisfies InvalidInputCase[],

  auth: {
    registration: [
      {
        description: 'login too short',
        payload: { ...validAuthRegistration, login: 'ab' },
        expectedFields: ['login'],
      },
      {
        description: 'invalid email',
        payload: { ...validAuthRegistration, email: 'bad-email' },
        expectedFields: ['email'],
      },
      {
        description: 'password too short',
        payload: { ...validAuthRegistration, password: '12345' },
        expectedFields: ['password'],
      },
      {
        description: 'all fields invalid at once',
        payload: { login: 'a', email: 'bad', password: '1' },
        expectedFields: ['login', 'email', 'password'],
      },
    ] satisfies InvalidInputCase[],

    login: [
      {
        description: 'empty loginOrEmail',
        payload: { loginOrEmail: '', password: 'qwerty12' },
        expectedFields: ['loginOrEmail'],
      },
      {
        description: 'empty password',
        payload: { loginOrEmail: 'user1', password: '' },
        expectedFields: ['password'],
      },
      {
        description: 'all fields invalid at once',
        payload: { loginOrEmail: '', password: '' },
        expectedFields: ['loginOrEmail', 'password'],
      },
    ] satisfies InvalidInputCase[],

    newPassword: [
      {
        description: 'newPassword too short',
        payload: {
          newPassword: '12345',
          recoveryCode: '00000000-0000-0000-0000-000000000001',
        },
        expectedFields: ['newPassword'],
      },
      {
        description: 'invalid recoveryCode',
        payload: {
          newPassword: 'qwerty12',
          recoveryCode: 'not-a-uuid',
        },
        expectedFields: ['recoveryCode'],
      },
    ] satisfies InvalidInputCase[],
  },
};

export const validInputData = {
  blog: validBlog,
  post: validPost,
  comment: validComment,
};
