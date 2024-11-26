export type PostAttributes = {
  title: string;
  publishedAt: Date;
  snippet: string;
};

export type Post = {
  slug: string;
  attrs: PostAttributes;
  body: string;
};
