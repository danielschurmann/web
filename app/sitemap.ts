import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/posts";
import { services } from "@/lib/services";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = [];
  try {
    posts = await getPublishedPosts(100);
  } catch (error) {
    console.error("sitemap: no se pudieron cargar novedades", error);
  }

  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/servicios"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...services.map((service) => ({
      url: absoluteUrl(`/servicios/${service.slug}`),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: absoluteUrl("/novedades"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: absoluteUrl(`/novedades/${post.slug}`),
      lastModified: new Date(post.published_at ?? post.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
