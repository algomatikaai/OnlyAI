import { useFeaturedCreators, useFeaturedContent } from "@/hooks/use-creator-data";
import CreatorCard from "@/components/creator-card";
import PostCard from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: featuredCreators, isLoading: creatorsLoading } = useFeaturedCreators();
  const { data: featuredContent, isLoading: contentLoading } = useFeaturedContent();

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Home</h1>
      </div>

      {/* Featured Creators Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Featured Creators</h2>
          <a href="/discover" className="text-primary text-sm">See All</a>
        </div>
        
        <div className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide">
          {creatorsLoading ? (
            // Loading skeletons
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-28">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-[#2C2C2E] border-2 border-primary/30 animate-pulse"></div>
                </div>
                <div className="mt-2 text-center">
                  <div className="h-4 bg-[#2C2C2E] rounded w-20 mx-auto"></div>
                  <div className="h-3 bg-[#2C2C2E] rounded w-16 mx-auto mt-1"></div>
                </div>
              </div>
            ))
          ) : (
            // Actual creators
            featuredCreators?.map((creator, index) => (
              <CreatorCard 
                key={creator.id}
                creator={creator} 
                isOnline={index % 3 === 0} // Random online status
                isSelected={index === 0} // First one is selected
              />
            ))
          )}
        </div>
      </section>

      {/* Feed Content Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Feed</h2>
          <button className="text-[#AFAFAF]">
            <FilterIcon className="h-5 w-5" />
          </button>
        </div>
        
        {contentLoading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-[#2C2C2E] rounded-xl overflow-hidden mb-6 animate-pulse">
              <div className="p-4 flex items-center">
                <Skeleton className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20 mt-1" />
                </div>
              </div>
              <Skeleton className="h-64 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </div>
            </div>
          ))
        ) : (
          // Actual content
          featuredContent?.map((content) => (
            <PostCard key={content.id} content={content} />
          ))
        )}
      </section>
    </div>
  );
}

function FilterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}
