import { Handlers, PageProps } from "$fresh/server.ts";
import { getPosts } from "@/utils/posts.ts";
import { Post } from "/types/Post.ts";
import Header from "/components/Header.tsx";
import Footer from "/components/Footer.tsx";
import "@std/dotenv/load";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

export const handler: Handlers<Post[]> = {
  async GET(_req, ctx) {
    const posts = await getPosts();
    return ctx.render(posts);
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const email = form.get("email")?.toString();

    // Add email to list.
    const res = await fetch(
      "https://api.resend.com/audiences/7380c08d-501b-4942-82e7-61cc64afdfd6/contacts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          email: email,
        }),
      },
    );

    if(res.ok) {
      const data = await res.json();
      // Redirect user to thank you page.
      const headers = new Headers();
      headers.set("location", "/thanks-for-subscribing");
      return new Response(null, {
        status: 303, // See Other
        headers,
      });
    } else {
      return res
    }
  },
};

export default function BlogIndexPage(props: PageProps<Post[]>) {
  const posts = props.data;
  return (
    <>
      <Header />
      <main class="flex-grow-1 flex-shrink-0 flex-basis-auto max-w-screen-md p-4 sm:px-8 sm:pt-16 mx-auto">
        <h1 class="text-5xl font-bold">Reel Bass Anglers</h1>
        <h3 class="text-2xl pt-4">Latest Posts:</h3>
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
