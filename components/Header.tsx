import Subscribe from "./Subscibe.tsx";

export default function Header() {
  return (
    <header class="p-4 sm:p-8 flex flex-col sm:flex-row justify-between">
      <h1 class="mb-4 text-center sm:text-left">
        <a href="/">reelbassanglers.com</a>
      </h1>
      <Subscribe />
    </header>
  );
}
