import type { MetadataRoute } from 'next'
import { detailPageProjects } from '@/content/projects'
import { SITE_URL } from '@/lib/env'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, priority: 1 },
    ...detailPageProjects.map((project) => ({
      url: `${SITE_URL}/projects/${project.slug}`,
      priority: 0.8,
    })),
  ]
}
