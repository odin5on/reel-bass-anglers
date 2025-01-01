import { Handlers } from "$fresh/server.ts";

export const handler: Handlers<string> = {
  async GET(req, ctx) {
    return await ctx.render();
  },
};

export default function Subscribe() {
  return (
    <>
      <form method="post" action="/">
        <button type="submit">Subscribe</button>
        <input type="email" name="email" value="" class="border" />
      </form>
    </>
  );
}
