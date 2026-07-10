import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts(100);
  const base = siteConfig.url.replace(/\/$/, "");

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/novedades`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${base}/novedades/${post.slug}`,
      lastModified: new Date(post.published_at ?? post.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
