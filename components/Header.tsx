import Subscribe from "./Subscibe.tsx";

export default function Header() {
  return (
    <header class="p-4 sm:p-8 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-6">
        <h1>
          <a
            href="/"
            class="hover:text-blue-600 transition-colors"
          >
            reelbassanglers.com
          </a>
        </h1>
        <a
          href="/gallery"
          class="text-gray-600 hover:text-blue-600 transition-colors"
        >
          Gallery
        </a>
      </div>

      <Subscribe />
    </header>
  );
}
