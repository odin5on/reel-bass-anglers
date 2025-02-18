import { Handlers, PageProps } from "$fresh/server.ts";
import Header from "/components/Header.tsx";
import Footer from "/components/Footer.tsx";

interface ImageData {
  src: string;
  alt: string;
  title: string;
}

interface GalleryData {
  images: ImageData[];
}

export const handler: Handlers<GalleryData> = {
  async GET(_req, ctx) {
    try {
      const images: ImageData[] = [];

      // Specifically look for .webp files
      for await (const dirEntry of Deno.readDir("static/images")) {
        if (
          dirEntry.isFile &&
          dirEntry.name.toLowerCase().endsWith(".webp")
        ) {
          // Format the title by removing .webp and replacing dashes with spaces
          const title = dirEntry.name
            .replace(".webp", "")
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize first letter of each word

          images.push({
            src: `/images/${dirEntry.name}`,
            alt: title,
            title: title,
          });
        }
      }

      // Sort images alphabetically by title
      images.sort((a, b) => a.title.localeCompare(b.title));

      return ctx.render({ images });
    } catch (error) {
      console.error("Error reading WebP images:", error);
      return ctx.render({ images: [] });
    }
  },
};

export default function GalleryPage({ data }: PageProps<GalleryData>) {
  const { images } = data;

  return (
    <>
      <Header />
      <main class="max-w-screen-xl mx-auto p-4 sm:px-6 lg:px-8">
        <h1 class="text-4xl font-bold mb-8">Photo Gallery</h1>

        {images.length === 0
          ? <p class="text-gray-600">No WebP images found in the gallery.</p>
          : (
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((image) => (
                <GalleryImage key={image.src} image={image} />
              ))}
            </div>
          )}
      </main>
      <Footer />
    </>
  );
}

function GalleryImage({ image }: { image: ImageData }) {
  return (
    <div class="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
      <div class="aspect-w-1 aspect-h-1 w-full">
        <img
          src={image.src}
          alt={image.alt}
          class="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          width="400"
          height="400"
        />
      </div>
      <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0">
        <h3 class="text-sm font-medium text-center">{image.title}</h3>
      </div>
    </div>
  );
}
