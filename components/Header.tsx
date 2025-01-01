import Subscribe from "./Subscibe.tsx";

export default function Header() {
  return (
    <header class="p-8 flex justify-between">
      <h1>
        <a href="/">reelbassanglers.com</a>
      </h1>
      <Subscribe />
    </header>
  );
}
