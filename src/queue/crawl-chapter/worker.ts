import { load } from "cheerio";
import { sleep } from "sleep";
import { supabase } from "@/app";
import { ChapterQueueArg } from "./index";
import { crawlChapterEvent, useAxios } from "@/helper";

export const crawlChapterWorker = async ({
  storyUrl,
  storyId,
}: ChapterQueueArg) => {
  const [chapters, error] = await crawlChapter(storyUrl);
  if (error) {
    crawlChapterEvent({ storyId, storyUrl, status: 0, error });
    return [null, error];
  }
  const { data: chapterInsertData, error: chapterInsertError } = await supabase
    .from("chapter")
    .insert(chapters.map((x: any) => ({ ...x, story_id: storyId })));
  if (chapterInsertError) {
    crawlChapterEvent({
      storyId,
      storyUrl,
      status: 0,
      error: chapterInsertError,
    });
    return [null, chapterInsertError];
  }
  crawlChapterEvent({ storyId, storyUrl, status: 0, error: null });
  return [chapterInsertData, null];
};

export const crawlChapter = async (
  url: string
): Promise<[any, Error | null]> => {
  const [data, error] = await useAxios(url).get();
  if (error) return [null, error];

  const $ = load(data);

  const pagination_control = $(".pagination-control")?.[0];

  const li_pages = $(pagination_control).find("li");
  const li_total_pages =
    $(pagination_control).find("li")?.[li_pages?.length - 2];
  const total_pages = $(li_total_pages).text();
  if (!total_pages) return [null, new Error("Total pages not found!")];

  const total_urls: (string | undefined)[] = [];

  for (let page = 1; page <= +total_pages; page++) {
    const urls_per_page: (string | undefined)[] = [];

    const _url = `${url}${page}`;
    console.log("_url", _url);

    const [data2, error2] = await useAxios(_url).get();
    if (error2) return [null, error2];

    const $2 = load(data2);
    const chapter_div = $2("#chapters")?.[0];
    $2(chapter_div)
      .find(".vip-0 a")
      .each((__, el) => {
        const href = $(el).attr("href");
        urls_per_page.push(href);
      });

    total_urls.push(...urls_per_page);
    sleep(3);
  }

  if (!total_urls.length) return [null, new Error("Urls not found!")];

  const chapters = [];
  for (let i = 0; i < total_urls.length - 1; i++) {
    const chapter_info = await crawlDetailChapter(total_urls[i]!);
    chapters.push(chapter_info);
    sleep(3);
  }

  return [chapters, null];
};

const crawlDetailChapter = async (url: string) => {
  console.log("Chapter url", url);

  const [data, error] = await useAxios(url).get();
  if (error) throw error;

  const $ = load(data);
  const title = $(".chapter-title")?.text();
  const content = $("#chapter-content")?.text();
  $("#chapter-content")?.find("iframe").remove();
  $("#chapter-content")?.find("script").remove();
  const html = $("#chapter-content").html();
  return { title, content, url, html };
};
