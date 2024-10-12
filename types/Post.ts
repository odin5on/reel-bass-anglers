export type PostAttributes = {
  title: string;
  publishedAt: Date;
  snippet: string;
};

// export type PostFile = {
//   attrs: PostAttributes;
//   body: string;
// }

export type Post = {
  slug: string;
  attrs: PostAttributes;
  body: string;
};
