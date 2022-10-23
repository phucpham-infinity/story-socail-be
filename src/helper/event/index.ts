import { supabase } from "@/app";

interface ICrawlChapterEvent {
  storyId: string;
  storyUrl: string;
  status: number;
  error?: any;
}

export const crawlChapterEvent = async ({
  storyId,
  storyUrl,
  status,
  error,
}: ICrawlChapterEvent) => {
  const { data: workerData } = await supabase
    .from("worker")
    .select("payload")
    .eq("event", "CRAWL_CHAPTER");

  await supabase
    .from("worker")
    .update({
      status: status,
      payload: {
        ...workerData![0].payload,
        [storyId]: { storyId, storyUrl, status, error },
      },
    })
    .eq("event", "CRAWL_CHAPTER");
};
