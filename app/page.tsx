import MasonryLayout from "@/components/ui/homepage/masonry-layout";
import MasonryLoading from "@/components/ui/homepage/masonry-loading";
import { Suspense } from "react";

// for now to keep things simpler we use RSC to render the dynamic layout. one could move the logic to the client
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main>
      <div className="w-full h-[80svh] px-[0.8rem]">
        {/* Since MasonryLayout is not async, this suspense will never be triggered. It's here to provide an alternative visual of how the loading screen would look like */}
        <Suspense fallback={<MasonryLoading />}>
          <MasonryLayout />
        </Suspense>
      </div>
    </main>
  );
}
