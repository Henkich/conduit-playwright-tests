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
export function generateTag(): string {
  const tag = `tag${uniqueId()}`;
  return tag;
}
export function generateArticleTags(): string[] {
  const count = 2 + Math.floor(Math.random() * 3);
  const tags: string[] = [];
  for (let i = 0; i < count; i++) {
    tags.push(`tag${uniqueId()}${i}`);
  }
  return tags;
}
export function generateEmail(): string {
  const username = `user${uniqueId()}`;
  return `${username}@example.com`;
}
export function generateUsername(): string {
  const username = `user${uniqueId()}`;
  return username;
}
