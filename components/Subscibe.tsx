import { Handlers } from "$fresh/server.ts";

export const handler: Handlers<string> = {
  async GET(req, ctx) {
    return await ctx.render();
  },
  async POST(req, ctx) {

    const form = await req.formData();
    const email = form.get("email")?.toString();

    // Add email to list.

    // Redirect user to thank you page.
    const headers = new Headers();
    headers.set("location", "/first-post");
    return new Response(null, {
      status: 303, // See Other
      headers,
    });
  },
};

export default function Subscribe() {
  return (
    <>
      <form method="post">
        <button type="submit">Subscribe</button>
        <input type="email" name="email" value="" class="border" />
      </form>
    </>
  );
}
