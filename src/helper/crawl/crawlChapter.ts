// import * as request from "request-promise";
import { load } from "cheerio";
import * as axios from "axios";
import { sleep } from "sleep";

export const crawlChapter = async (
  url: string
): Promise<[any, Error | null]> => {
  //@ts-ignore
  const res = await axios.get(url);

  if (!res.data) return [null, new Error("Link not found!")];

  const $ = load(res.data);

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
    //@ts-ignore
    const res = await axios.get(_url);
    const $2 = load(res.data);
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

  //@ts-ignore
  const res = await axios.get(url);

  const $ = load(res.data);
  const title = $(".chapter-title")?.text();
  const content = $("#chapter-content")?.text();
  $("#chapter-content")?.find("iframe").remove();
  const html = $("#chapter-content").html();
  return { title, content, url, html };
};
