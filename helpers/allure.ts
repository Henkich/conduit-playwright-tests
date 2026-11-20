// Allure labels: keys are used in code, values are shown in the report tree
export const EPIC = {
  auth: 'Auth',
  articles: 'Articles',
  profiles: 'Profiles',
} as const;

export const FEATURE = {
  // Auth
  registration: 'Registration',
  login: 'Login',
  session: 'Session',
  userSettings: 'User settings',
  // Articles
  createArticle: 'Create article',
  viewArticle: 'View article',
  editArticle: 'Edit article',
  deleteArticle: 'Delete article',
  favorites: 'Favorites',
  articleList: 'Article list',
  tags: 'Tags',
  feed: 'Feed',
  // Profiles
  profile: 'Profile',
  follow: 'Follow',
} as const;
