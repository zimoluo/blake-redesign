import MasonryLayout from "@/components/ui/homepage/masonry-layout";
import MasonryLoading from "@/components/ui/homepage/masonry-loading";
import { Suspense } from "react";

// for now to keep things simpler we use RSC to render the dynamic layout. one could move the logic to the client
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main>
      <div className="w-full h-[80svh] px-[0.8rem]">
        <Suspense fallback={<MasonryLoading />}>
          <MasonryLayout />
        </Suspense>
      </div>
    </main>
  );
}
