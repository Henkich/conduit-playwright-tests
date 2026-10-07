export function uniqueId(): string {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}
export function generateArticleName(): string {
  const ArticleName = `Article${uniqueId()}`;
  return ArticleName;
}
export function generateArticleDescription(): string {
  const ArticleDescription = `ArticleDescription${uniqueId()}`;
  return ArticleDescription;
}
export function generateArticleBody(): string {
  const ArticleBody = `ArticleBody${uniqueId()}`;
  return ArticleBody;
}
export function generateArticleTags(): string {
  const ArticleTags = `ArticleTags${uniqueId()}`;
  return ArticleTags;
}
export function generateEmail(): string {
  const username = `user${uniqueId()}`;
  return `${username}@example.com`;
}
