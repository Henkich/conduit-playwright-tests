// Unique values per call, so parallel tests never collide on titles, emails or usernames
export function uniqueId(): string {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export function generateArticleName(): string {
  return `Article${uniqueId()}`;
}

export function generateArticleDescription(): string {
  return `ArticleDescription${uniqueId()}`;
}

export function generateArticleBody(): string {
  return `ArticleBody${uniqueId()}`;
}

export function generateTag(): string {
  return `tag${uniqueId()}`;
}

// 2–4 unique tags
export function generateArticleTags(): string[] {
  const count = 2 + Math.floor(Math.random() * 3);
  const tags: string[] = [];
  for (let i = 0; i < count; i++) {
    tags.push(`tag${uniqueId()}${i}`);
  }
  return tags;
}

export function generateEmail(): string {
  return `user${uniqueId()}@example.com`;
}

export function generateUsername(): string {
  return `user${uniqueId()}`;
}
