import { Handlers, PageProps } from "$fresh/server.ts";
import { getPosts } from "@/utils/posts.ts";
import { Post } from "/types/Post.ts";
import Header from "/components/Header.tsx";
import Footer from "/components/Footer.tsx";

export const handler: Handlers<Post[]> = {
  async GET(_req, ctx) {
    const posts = await getPosts();
    return ctx.render(posts);
  },
};

export default function BlogIndexPage(props: PageProps<Post[]>) {
  const posts = props.data;
  return (
    <>
      <Header />
      <main class="flex-grow-1 flex-shrink-0 flex-basis-auto max-w-screen-md px-4 pt-16 mx-auto">
        <h1 class="text-5xl font-bold">Go Fishing Gear</h1>
        <div class="mt-8">
          {posts.map((post) => <PostCard post={post} />)}
        </div>
      </main>
      <Footer />
    </>
  );
}

function PostCard(props: { post: Post }) {
  const { post } = props;
  return (
    <a class="sm:col-span-2" href={`/${post.slug}`}>
      <div class="p-4 my-4 border rounded-[4px] transform transition-transform duration-300 hover:scale-105">
        <h3 class="text(3xl gray-900) font-bold">{post.attrs.title}</h3>
        <time class="text-gray-500">
          {new Date(post.attrs.publishedAt).toLocaleDateString("en-us", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <div class="mt-4 text-gray-900">{post.attrs.snippet}</div>
      </div>
    </a>
  );
}
