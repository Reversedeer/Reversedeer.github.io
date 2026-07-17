import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return rss({
    title: 'Reversedeer · 博客',
    description: 'Reversedeer 的开发记录与个人思考。',
    site: context.site ?? 'https://reversedeer.com',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
  });
};
