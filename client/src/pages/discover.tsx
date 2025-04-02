import { useState } from "react";
import { useFeaturedCreators, useTrendingContent } from "@/hooks/use-creator-data";
import CreatorCard from "@/components/creator-card";
import ContentCard from "@/components/content-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Discover() {
  const [activeFilter, setActiveFilter] = useState("for-you");
  
  const { data: featuredCreators, isLoading: creatorsLoading } = useFeaturedCreators();
  const { data: trendingContent, isLoading: contentLoading } = useTrendingContent();

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Top Section with Title and Filters */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Discover</h1>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            className={`rounded-full text-sm ${activeFilter === 'recent' ? 'bg-[#2C2C2E]' : 'bg-[#1E1E1E]'}`}
            onClick={() => setActiveFilter('recent')}
          >
            Recent
          </Button>
          <Button 
            variant="ghost" 
            className={`rounded-full text-sm ${activeFilter === 'popular' ? 'bg-[#2C2C2E]' : 'bg-[#1E1E1E]'}`}
            onClick={() => setActiveFilter('popular')}
          >
            Popular
          </Button>
          <Button 
            variant={activeFilter === 'for-you' ? 'default' : 'ghost'} 
            className="rounded-full text-sm"
            onClick={() => setActiveFilter('for-you')}
          >
            For You
          </Button>
        </div>
      </div>

      {/* Featured Creators Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Featured Creators</h2>
          <a href="#" className="text-primary text-sm">See All</a>
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
                isOnline={index % 3 === 0} // Random online status for demo
              />
            ))
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Categories</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <Button 
            variant="outline" 
            className="bg-[#1E1E1E] hover:bg-[#2C2C2E] text-white py-3 rounded-xl text-sm font-medium"
          >
            <FlameIcon className="text-primary mr-2 h-4 w-4" /> Trending
          </Button>
          <Button 
            variant="outline" 
            className="bg-[#1E1E1E] hover:bg-[#2C2C2E] text-white py-3 rounded-xl text-sm font-medium"
          >
            <CameraIcon className="text-primary mr-2 h-4 w-4" /> Realistic
          </Button>
          <Button 
            variant="outline" 
            className="bg-[#1E1E1E] hover:bg-[#2C2C2E] text-white py-3 rounded-xl text-sm font-medium"
          >
            <BrushIcon className="text-primary mr-2 h-4 w-4" /> Anime
          </Button>
          <Button 
            variant="outline" 
            className="bg-[#1E1E1E] hover:bg-[#2C2C2E] text-white py-3 rounded-xl text-sm font-medium"
          >
            <MaskIcon className="text-primary mr-2 h-4 w-4" /> Cosplay
          </Button>
          <Button 
            variant="outline" 
            className="bg-[#1E1E1E] hover:bg-[#2C2C2E] text-white py-3 rounded-xl text-sm font-medium"
          >
            <MoreIcon className="text-primary mr-2 h-4 w-4" /> More
          </Button>
        </div>
      </section>

      {/* Trending Content Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Trending Now</h2>
          <a href="#" className="text-primary text-sm">See All</a>
        </div>
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {contentLoading ? (
            // Loading skeletons
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-[#2C2C2E] rounded-xl overflow-hidden">
                <div className="aspect-[3/4] bg-[#3A3A3C] animate-pulse"></div>
                <div className="p-3">
                  <div className="flex items-center">
                    <Skeleton className="w-8 h-8 rounded-full mr-2" />
                    <div>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                    <Skeleton className="h-4 w-12 ml-auto" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Actual content
            trendingContent?.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function FlameIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
    </svg>
  );
}

function CameraIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
      <circle cx="12" cy="13" r="3"></circle>
    </svg>
  );
}

function BrushIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M18.37 2.63 14 7l-1.87-1.87c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71L12.29 7a1.001 1.001 0 0 0 1.42 0l.29-.3 4.01-3.93c.19-.18.3-.44.3-.71 0-.55-.45-1-1-1-.28 0-.53.11-.71.29zm-9.2 13.07a3.493 3.493 0 0 0-3.5 3.5c0 .36-.01 1.28-3.04 3.43-.33.25-.45.71-.27 1.09.13.26.39.42.68.42.1 0 .2-.02.29-.06.2-.08 4.93-2.02 4.93-4.88 0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5c0 1.2.72 1.43 1.04 1.44a.7.7 0 0 0 .13-.01c.76-.13 1.02-.91.7-1.57-.19-.38-.44-.69-.75-.94V10.5c0-.83-.67-1.5-1.5-1.5H8.92C7.11 9 6 10.1 6 11.92c0 .9.55 1.72 1.38 2.06.8.34 1.8.7 1.79.72z"></path>
    </svg>
  );
}

function MaskIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M19 9V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4"></path>
      <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <path d="M9 16a2 2 0 0 1 6 0"></path>
      <path d="M17 10v2"></path>
      <path d="M7 10v2"></path>
    </svg>
  );
}

function MoreIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="12" cy="5" r="1"></circle>
      <circle cx="12" cy="19" r="1"></circle>
    </svg>
  );
}
