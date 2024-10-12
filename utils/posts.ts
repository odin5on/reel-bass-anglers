import { extract } from "@std/front-matter/any";
import { join } from "@std/path";
import { Post, PostAttributes } from "/types/Post.ts";

const DIRECTORY = "./posts";

// export interface Post {
//   slug: string;
//   title: string;
//   publishedAt: Date;
//   snippet: string;
//   content: string;
// }

// Get posts.
export async function getPosts(): Promise<Post[]> {
  const files = Deno.readDir(DIRECTORY);
  const promises = [];
  for await (const file of files) {
    const slug = file.name.replace(".md", "");
    promises.push(getPost(slug));
  }
  const posts = (await Promise.all(promises)) as Post[];
  posts.sort((a, b) =>
    b.attrs.publishedAt.getTime() - a.attrs.publishedAt.getTime()
  );
  return posts;
}

// Get post.
export async function getPost(slug: string): Promise<Post | null> {
  const text = await Deno.readTextFile(join(DIRECTORY, `${slug}.md`));
  const post = extract<PostAttributes>(text);
  return {
    slug,
    body: post.body,
    attrs: post.attrs,
  };
}
