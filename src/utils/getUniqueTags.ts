import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify";
import postFilter from "./postFilter";
import { TAGS } from "@/constants";

export interface Tag {
  tag: string;
  tagName: string;
  tagCount: number;
  description?: string;
}

const getUniqueTags = (posts: CollectionEntry<"blog">[]) => {
  const tags: Tag[] = posts
    .filter(postFilter)
    .flatMap(post => post.data.tags)
    .map(tag => {
      const slug = slugifyStr(tag);
      return {
        tag: slug,
        tagName: tag,
        tagCount: 0,
        description: TAGS[slug],
      };
    })
    .filter(
      (value, index, self) =>
        self.findIndex(tag => tag.tag === value.tag) === index
    )
    .sort((tagA, tagB) => tagA.tag.localeCompare(tagB.tag));

  posts.filter(postFilter).flatMap(post => post.data.tags).forEach((value) => {
    let t = tags.findIndex(tag => tag.tagName === value)
    tags[t].tagCount = (tags[t].tagCount || 0) + 1
  });
  return tags;
};

export default getUniqueTags;
