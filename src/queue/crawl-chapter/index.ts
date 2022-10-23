import { promise, queueAsPromised } from "fastq";
import { crawlChapterWorker } from "./worker";

export type ChapterQueueArg = {
  storyUrl: string;
  storyId: string;
};

export const crawlChapterQueue: queueAsPromised<ChapterQueueArg> = promise(
  crawlChapterWorker,
  1
);
