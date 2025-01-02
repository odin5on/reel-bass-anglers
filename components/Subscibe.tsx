import { Handlers } from "$fresh/server.ts";

export const handler: Handlers<string> = {
  async GET(req, ctx) {
    return await ctx.render();
  },
};

export default function Subscribe() {
  return (
    <>
      <form method="post" action="/" class="border-black border-2 rounded-md flex">
        <input type="email" name="email" value="" placeholder="Enter email" class="pl-2 focus:outline-none flex-grow rounded-xl" />
        <button type="submit" class="bg-black text-white p-2 ml-2">Subscribe</button>
      </form>
    </>
  );
}
