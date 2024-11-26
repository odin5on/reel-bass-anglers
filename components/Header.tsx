import Subscribe from "/components/Subscibe.tsx";

export default function Header() {
  return (
    <header class="p-8 flex justify-between">
      <h1>
        <a href="/">GoFishingGear.com</a>
      </h1>
      <Subscribe />
    </header>
  );
}
