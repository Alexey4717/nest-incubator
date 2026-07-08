export const SEED_PASSWORD = 'qwerty123';

export const SEED_USERS = {
  dev: {
    login: 'devuser',
    email: 'dev@example.com',
    password: SEED_PASSWORD,
  },
  pending: {
    login: 'pending1',
    email: 'pending@example.com',
    password: SEED_PASSWORD,
  },
} as const;

export const SEED_BLOGS = {
  main: {
    name: 'Dev Blog',
    websiteUrl: 'https://example.com',
    description: 'Default blog for local development',
  },
} as const;

export const SEED_POSTS = [
  {
    title: 'Welcome post',
    shortDescription: 'First seed post',
    content: 'Hello from db:seed — use devuser / qwerty123 to login.',
  },
  {
    title: 'Second post',
    shortDescription: 'Another seed post',
    content: 'More sample content for local API testing.',
  },
] as const;

export const SEED_COMMENTS = [
  'First comment from seed data.',
  'Second comment on the welcome post.',
] as const;
