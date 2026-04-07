import { useState, useEffect } from "react";
import { useGetSchedule } from "@workspace/api-client-react";
import type { GetScheduleDay } from "@workspace/api-client-react";
import { AnimeCard } from "@/components/shared/AnimeCard";
import { LoadingPage } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";

const DAYS: GetScheduleDay[] = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"];

const getDayName = (day: string) => {
  const map: Record<string, string> = {
    senin: "Monday", selasa: "Tuesday", rabu: "Wednesday", 
    kamis: "Thursday", jumat: "Friday", sabtu: "Saturday", minggu: "Sunday"
  };
  return map[day] || day;
};

const getCurrentDayId = (): GetScheduleDay => {
  const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday
  const dayMap: Record<number, GetScheduleDay> = {
    0: "minggu", 1: "senin", 2: "selasa", 3: "rabu", 
    4: "kamis", 5: "jumat", 6: "sabtu"
  };
  return dayMap[dayIndex];
};

export default function Schedule() {
  const [activeDay, setActiveDay] = useState<GetScheduleDay>(getCurrentDayId());
  
  const { data, isLoading, error } = useGetSchedule({ day: activeDay });

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/20 rounded-xl text-primary">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-display">Airing Schedule</h1>
            <p className="text-muted-foreground mt-1">Keep track of ongoing anime releases</p>
          </div>
        </div>

        <Tabs value={activeDay} onValueChange={(v) => setActiveDay(v as GetScheduleDay)} className="w-full">
          <TabsList className="w-full h-auto flex flex-wrap justify-start sm:justify-center bg-transparent p-0 gap-2 mb-8">
            {DAYS.map(day => (
              <TabsTrigger 
                key={day} 
                value={day}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6 py-2.5 text-sm font-semibold transition-all shadow-sm border border-border/40 bg-secondary/50 hover:bg-secondary"
              >
                {getDayName(day)}
              </TabsTrigger>
            ))}
          </TabsList>

          {DAYS.map(day => (
            <TabsContent key={day} value={day} className="mt-0 outline-none">
              {isLoading ? (
                <LoadingPage />
              ) : error ? (
                <ErrorState title="Failed to load schedule" />
              ) : data?.schedule && data.schedule[0]?.anime ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {data.schedule[0].anime.map((anime, i) => (
                    <AnimeCard key={anime.slug} anime={anime} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-muted-foreground bg-secondary/10 rounded-xl border border-border/50">
                  <p className="text-lg">No anime airing on this day</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
