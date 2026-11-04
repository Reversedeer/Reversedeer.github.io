/* ==========================================================================
   build-blog.js · 把 blog/posts/*.md 生成静态文章页和博客列表
   用法：npm run build:blog
   ========================================================================== */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BLOG_DIR = path.join(ROOT, 'blog');
const POSTS_DIR = path.join(BLOG_DIR, 'posts');
const TEMPLATE_PATH = path.join(ROOT, 'scripts', 'blog-template.html');
const INDEX_PATH = path.join(BLOG_DIR, 'index.html');
const HOME_PATH = path.join(ROOT, 'index.html');
const SITE_URL = 'https://blog.reversedeer.com';
const START_MARK = '<!-- build:posts:start -->';
const END_MARK = '<!-- build:posts:end -->';
const HOME_START_MARK = '<!-- build:latest:start -->';
const HOME_END_MARK = '<!-- build:latest:end -->';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

function stripTags(html) {
  return html.replace(/<[^>]*>/g, '');
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function slugify(text) {
  return decodeEntities(stripTags(text))
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

/* 记录每个二到六级标题的显式 id，并把标题末尾的 {#id} 去掉 */
function extractHeadingIds(md) {
  const ids = [];
  let inFence = false;
  const lines = md.split('\n').map((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return line;
    }
    if (inFence) return line;

    const explicit = line.match(/^(#{2,6})\s+(.+?)\s*\{#([A-Za-z][\w-]*)\}\s*$/);
    if (explicit) {
      ids.push(explicit[3]);
      return explicit[1] + ' ' + explicit[2];
    }
    if (/^#{2,6}\s+/.test(line)) ids.push(null);
    return line;
  });
  return { md: lines.join('\n'), ids };
}

function renderBody(md) {
  const prepared = extractHeadingIds(md);
  let html = marked.parse(prepared.md, { gfm: true });

  // 正文块级元素挂滚动渐显，按出现顺序错开 0/1/2
  let block = 0;
  html = html.replace(/^<(p|blockquote|ul|ol|pre)>/gm, (match, tag) => {
    const index = block % 3;
    block += 1;
    return '<' + tag + ' class="reveal"' + (index ? ' style="--i: ' + index + '"' : '') + '>';
  });

  // 标题加 id 与可点击锚点
  let heading = 0;
  html = html.replace(/^<h([2-6])>([^\n]*?)<\/h\1>$/gm, (match, depth, inner) => {
    const plain = decodeEntities(stripTags(inner)).trim();
    const id = prepared.ids[heading] || slugify(plain) || 'section-' + (heading + 1);
    heading += 1;
    const attr = escapeHtml(id);
    return (
      '<h' + depth + ' class="reveal" id="' + attr + '">' + inner +
      '<a class="post__anchor" href="#' + attr +
      '" aria-label="本节锚点：' + escapeHtml(plain) + '">#</a>' +
      '</h' + depth + '>'
    );
  });

  return html.trim();
}

function excerptOf(md) {
  const text = md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{2,6}\s+.*$/gm, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.slice(0, 100);
}

function readingMinutes(md) {
  const text = md
    .replace(/```[^\n]*/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|-]/g, ' ');
  const cjk = (text.match(/[㐀-鿿]/g) || []).length;
  const latin = (text.match(/[A-Za-z0-9]+/g) || []).length;
  return Math.max(1, Math.round((cjk + latin * 2) / 300));
}

function toDateString(value, file) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, '0');
    const day = String(value.getUTCDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }
  const text = String(value ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new Error(file + '：date 必须是 YYYY-MM-DD，当前为 "' + text + '"');
  }
  return text;
}

async function loadPosts() {
  const names = (await fs.readdir(POSTS_DIR)).filter((name) => name.endsWith('.md'));
  const posts = [];
  const seen = new Set();

  for (const name of names) {
    const file = path.join(POSTS_DIR, name);
    const raw = await fs.readFile(file, 'utf8');
    const { data, content } = matter(raw);

    if (!data.title) throw new Error(name + '：缺少 title');
    if (data.draft === true) {
      console.log('跳过草稿：' + name);
      continue;
    }

    const slug = String(data.slug || name.replace(/\.md$/, ''));
    if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
      throw new Error(name + '：slug 只能用小写字母、数字和连字符');
    }
    if (seen.has(slug)) throw new Error(name + '：slug 重复 "' + slug + '"');
    seen.add(slug);

    posts.push({
      slug,
      date: toDateString(data.date, name),
      title: String(data.title),
      tag: data.tag ? String(data.tag) : '',
      lede: data.lede ? String(data.lede) : '',
      note: data.note ? String(data.note) : '',
      description: String(data.description || excerptOf(content) || data.title),
      reading: readingMinutes(content),
      body: renderBody(content)
    });
  }

  posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  return posts;
}

function fillTemplate(template, values) {
  let html = template;
  for (const [key, value] of Object.entries(values)) {
    html = html.replaceAll('{{' + key + '}}', () => value);
  }
  return html;
}

function postNavHtml(newer, older) {
  const items = [];
  if (newer) {
    items.push(
      '            <a class="post-nav__item post-nav__item--previous" href="' + newer.slug + '.html" rel="prev">\n' +
      '              <span class="post-nav__label mono">上一篇</span>\n' +
      '              <span class="post-nav__title"><span class="post-nav__arrow" aria-hidden="true">«</span><span class="post-nav__text">' + escapeHtml(newer.title) + '</span></span>\n' +
      '            </a>'
    );
  }
  if (older) {
    items.push(
      '            <a class="post-nav__item post-nav__item--next" href="' + older.slug + '.html" rel="next">\n' +
      '              <span class="post-nav__label mono">下一篇</span>\n' +
      '              <span class="post-nav__title"><span class="post-nav__text">' + escapeHtml(older.title) + '</span><span class="post-nav__arrow" aria-hidden="true">»</span></span>\n' +
      '            </a>'
    );
  }
  if (!items.length) return '';
  return '<nav class="post-nav" aria-label="文章导航">\n' + items.join('\n') + '\n          </nav>';
}

function indexGroupsHtml(posts) {
  if (!posts.length) return '          <p class="blog-head__sub">还没有文章。</p>';

  const years = new Map();
  for (const post of posts) {
    const year = post.date.slice(0, 4);
    if (!years.has(year)) years.set(year, []);
    years.get(year).push(post);
  }

  return Array.from(years.entries()).map(([year, list]) => {
    const rows = list.map((post, index) => {
      const tag = post.tag
        ? '\n                  <span class="blog-tag">' + escapeHtml(post.tag) + '</span>'
        : '';
      return '              <li class="post-row reveal" style="--i: ' + (index % 3) + '">\n' +
        '                <a class="post-row__link" href="' + post.slug + '.html">\n' +
        '                  <time class="post-row__date" datetime="' + post.date + '">' +
        post.date + '</time>\n' +
        '                  <span class="post-row__title">' + escapeHtml(post.title) + '</span>' +
        tag + '\n' +
        '                </a>\n' +
        '              </li>';
    }).join('\n');

    return '          <section class="blog-group" aria-labelledby="year-' + year + '">\n' +
      '            <div class="section__head reveal">\n' +
      '              <h2 class="blog-year fx-drift" id="year-' + year + '">' + year + '</h2>\n' +
      '            </div>\n' +
      '            <ul class="post-list">\n' + rows + '\n' +
      '            </ul>\n' +
      '          </section>';
  }).join('\n\n');
}

/* 首页最近在写：按日期取最新三篇，链接用博客子域的绝对地址 */
function latestRowsHtml(posts) {
  return posts.slice(0, 3).map((post, index) =>
    '            <li class="post-row reveal" style="--i: ' + index + '">\n' +
    '              <a class="post-row__link" href="' + SITE_URL + '/' + post.slug + '.html">\n' +
    '                <time class="post-row__date" datetime="' + post.date + '">' +
    post.date + '</time>\n' +
    '                <span class="post-row__title">' + escapeHtml(post.title) + '</span>\n' +
    '              </a>\n' +
    '            </li>'
  ).join('\n');
}

async function main() {
  const template = await fs.readFile(TEMPLATE_PATH, 'utf8');
  const posts = await loadPosts();

  for (let index = 0; index < posts.length; index += 1) {
    const post = posts[index];
    const noteBlock = post.note
      ? '<p class="post__note blog-head__sub">' + escapeHtml(post.note) + '</p>'
      : '';
    const ledeBlock = post.lede
      ? '<p class="post__lede reveal">' + escapeHtml(post.lede) + '</p>'
      : '';
    const body = [ledeBlock, post.body].filter(Boolean).join('\n');

    const html = fillTemplate(template, {
      title: escapeHtml(post.title),
      description: escapeHtml(post.description),
      canonical: SITE_URL + '/' + post.slug + '.html',
      date: post.date,
      readingTime: String(post.reading),
      noteBlock,
      body,
      postNav: postNavHtml(posts[index - 1] || null, posts[index + 1] || null)
    });

    if (/\{\{[a-zA-Z]+\}\}/.test(html)) {
      throw new Error('模板占位符没有全部替换：' + post.slug);
    }

    await fs.writeFile(path.join(BLOG_DIR, post.slug + '.html'), html);
    console.log('生成文章：' + post.slug + '.html（阅读 ' + post.reading + ' 分钟）');
  }

  let indexHtml = await fs.readFile(INDEX_PATH, 'utf8');
  const start = indexHtml.indexOf(START_MARK);
  const end = indexHtml.indexOf(END_MARK);
  if (start === -1 || end === -1 || end < start) {
    throw new Error('blog/index.html 里找不到构建标记 <!-- build:posts:start/end -->');
  }
  indexHtml = indexHtml.slice(0, start + START_MARK.length) +
    '\n' + indexGroupsHtml(posts) + '\n          ' + indexHtml.slice(end);
  await fs.writeFile(INDEX_PATH, indexHtml);
  console.log('已刷新 blog/index.html 列表，共 ' + posts.length + ' 篇');

  let homeHtml = await fs.readFile(HOME_PATH, 'utf8');
  const homeStart = homeHtml.indexOf(HOME_START_MARK);
  const homeEnd = homeHtml.indexOf(HOME_END_MARK);
  if (homeStart === -1 || homeEnd === -1 || homeEnd < homeStart) {
    throw new Error('index.html 里找不到构建标记 <!-- build:latest:start/end -->');
  }
  homeHtml = homeHtml.slice(0, homeStart + HOME_START_MARK.length) +
    '\n' + latestRowsHtml(posts) + '\n            ' + homeHtml.slice(homeEnd);
  await fs.writeFile(HOME_PATH, homeHtml);
  console.log('已刷新首页最近在写，取最新 ' + Math.min(posts.length, 3) + ' 篇');
}

main().catch((error) => {
  console.error('构建失败：' + error.message);
  process.exitCode = 1;
});
