import MasonryLayout from "@/components/ui/homepage/masonry-layout";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main>
      <div className="w-full h-[80svh] px-[0.8rem]">
        <MasonryLayout />
      </div>
    </main>
  );
}
