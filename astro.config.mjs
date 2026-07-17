import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://reversedeer.com',

  integrations: [
    starlight({
      title: 'Reversedeer',
      description: '个人网站、博客与持续整理的文档空间。',
      sidebar: [
        {
          label: '开始阅读',
          items: [
            { label: '文档首页', link: '/docs/' },
            { label: '开始使用', link: '/docs/getting-started/' },
          ],
        },
        {
          label: '架构规划',
          items: [{ label: '网站架构', link: '/docs/architecture/' }],
        },
      ],
    }),
  ],

  adapter: cloudflare(),
});