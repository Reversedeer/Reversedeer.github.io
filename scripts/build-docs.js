/* ==========================================================================
   build-docs.js · 把 docs/pages/*.md 生成 docs/*.html
   用法：npm run build:docs
   ========================================================================== */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGES_DIR = path.join(ROOT, 'docs', 'pages');
const NAV_PATH = path.join(PAGES_DIR, 'nav.json');
const TEMPLATE_PATH = path.join(ROOT, 'scripts', 'docs-template.html');
const OUTPUT_DIR = path.join(ROOT, 'docs');
const SITE_URL = 'https://docs.reversedeer.com';

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

function plainText(markdown) {
  return decodeEntities(stripTags(marked.parseInline(markdown))).trim();
}

function slugify(text) {
  return plainText(text)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

function pageHref(slug) {
  return slug === 'index' ? 'index.html' : slug + '.html';
}

/* 按二级标题拆成小节，代码块里的标题不参与拆分 */
function splitSections(markdown) {
  const lines = markdown.split('\n');
  const sections = [];
  const preamble = [];
  let current = null;
  let inFence = false;

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;

    if (!inFence) {
      const heading = line.match(/^##\s+(.+?)(?:\s+\{#([A-Za-z][\w-]*)\})?\s*$/);
      if (heading) {
        current = { title: heading[1].trim(), id: heading[2] || null, lines: [] };
        sections.push(current);
        continue;
      }
    }

    if (current) current.lines.push(line);
    else if (line.trim()) preamble.push(line);
  }

  return { sections, preamble };
}

/* 收集三级标题的 id，并把 {#id} 从标题末尾去掉 */
function prepareH3(lines) {
  const headings = [];
  let inFence = false;
  const prepared = lines.map((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return line;
    }
    if (inFence) return line;

    const heading = line.match(/^###\s+(.+?)(?:\s+\{#([A-Za-z][\w-]*)\})?\s*$/);
    if (!heading) return line;

    const id = heading[2] || slugify(heading[1]) || 'section-' + (headings.length + 1);
    headings.push({ title: plainText(heading[1]), id });
    return '### ' + heading[1];
  });

  return { md: prepared.join('\n'), headings };
}

function renderSection(section, seenIds) {
  const prepared = prepareH3(section.lines);
  let html = marked.parse(prepared.md, { gfm: true });

  let id = section.id || slugify(section.title) || 'section';
  if (seenIds.has(id)) {
    let index = 2;
    while (seenIds.has(id + '-' + index)) index += 1;
    id = id + '-' + index;
  }
  seenIds.add(id);

  prepared.headings.forEach((heading) => {
    if (seenIds.has(heading.id)) throw new Error('文档锚点重复：' + heading.id);
    seenIds.add(heading.id);
  });

  // 三级标题补 id
  let h3Index = 0;
  html = html.replace(/^<h3(?:\s[^>]*)?>(.*?)<\/h3>$/gm, (match, inner) => {
    const heading = prepared.headings[h3Index];
    h3Index += 1;
    if (!heading) return match;
    return '<h3 id="' + escapeHtml(heading.id) + '">' + inner + '</h3>';
  });

  // 补回文档页的专属类名
  html = html.replace(/<pre>/g, '<pre class="docs-code">');
  html = html.replace(/<ul>/g, '<ul class="docs-list">');
  html = html.replace(/<ol>/g, '<ol class="docs-steps">');
  html = html.replace(
    /<table>([\s\S]*?)<\/table>/g,
    '<div class="docs-table-wrap"><table class="docs-table">$1</table></div>'
  );

  const titleHtml = marked.parseInline(section.title).trim();
  const label = escapeHtml(plainText(section.title));
  const attr = escapeHtml(id);

  const heading =
    '<h2 class="docs-section__title" id="' + attr + '">' + titleHtml +
    '<a class="docs-anchor" href="#' + attr + '" aria-label="本节锚点：' + label + '">#</a></h2>';

  const wrapper =
    '<section class="docs-section reveal" aria-labelledby="' + attr + '">\n' +
    '            ' + heading + '\n' +
    html.trim() + '\n' +
    '          </section>';

  return { id, title: plainText(section.title), headings: prepared.headings, html: wrapper };
}

/* 左侧文档目录：按 nav.json 分组，当前页面所在分组展开 */
function renderNav(nav, pages, currentSlug) {
  return nav.map((group) => {
    const slugs = Array.isArray(group.pages) ? group.pages : [];
    const active = slugs.includes(currentSlug);
    const items = slugs.map((slug) => {
      const page = pages.get(slug);
      if (!page) throw new Error('nav.json 引用了不存在的页面：' + slug);
      const current = slug === currentSlug;
      return '              <li><a class="docs-toc__link' + (current ? ' is-current' : '') +
        '" href="' + pageHref(slug) + '"' + (current ? ' aria-current="page"' : '') + '>' +
        escapeHtml(page.title) + '</a></li>';
    }).join('\n');

    return '            <details class="docs-toc__group"' + (active ? ' open' : '') + '>\n' +
      '              <summary class="docs-toc__group-title">' + escapeHtml(group.group || '') + '</summary>\n' +
      '              <ul class="docs-toc__list">\n' + items + '\n              </ul>\n' +
      '            </details>';
  }).join('\n');
}

/* 右侧本页目录：二级标题加各自的三级标题 */
function renderPageToc(sections) {
  const items = sections.map((section) => {
    const subItems = section.headings.map((heading) =>
      '              <li><a class="docs-page-toc__link" href="#' + escapeHtml(heading.id) + '">' +
      escapeHtml(heading.title) + '</a></li>'
    ).join('\n');

    const subList = subItems
      ? '\n            <ul class="docs-page-toc__sublist">\n' + subItems + '\n            </ul>'
      : '';

    return '          <li><a class="docs-page-toc__link" href="#' + escapeHtml(section.id) + '">' +
      escapeHtml(section.title) + '</a>' + subList + '</li>';
  }).join('\n');

  return '          <ul class="docs-page-toc__list">\n' + items + '\n          </ul>';
}

function fillTemplate(template, values) {
  let html = template;
  for (const [key, value] of Object.entries(values)) {
    html = html.replaceAll('{{' + key + '}}', () => value);
  }
  return html;
}

async function loadPages(nav) {
  const pages = new Map();
  const order = [];

  for (const group of nav) {
    const slugs = Array.isArray(group.pages) ? group.pages : [];
    for (const slug of slugs) {
      if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
        throw new Error('页面 slug 只能用小写字母、数字和连字符：' + slug);
      }
      if (pages.has(slug)) throw new Error('nav.json 页面重复：' + slug);

      const file = path.join(PAGES_DIR, slug + '.md');
      let raw;
      try {
        raw = await fs.readFile(file, 'utf8');
      } catch (error) {
        throw new Error('缺少页面文件：docs/pages/' + slug + '.md');
      }

      const { data, content } = matter(raw);
      pages.set(slug, {
        slug,
        group: String(group.group || ''),
        title: String(data.title || slug),
        description: String(data.description || ''),
        lede: String(data.lede || data.description || ''),
        content
      });
      order.push(slug);
    }
  }

  return { pages, order };
}

function renderPage(page) {
  const { sections, preamble } = splitSections(page.content);
  const seenIds = new Set();
  const rendered = sections.map((section) => renderSection(section, seenIds));
  const preambleHtml = preamble.length
    ? marked.parse(preamble.join('\n'), { gfm: true })
    : '';
  const contentHtml = [preambleHtml, ...rendered.map((section) => section.html)]
    .filter((part) => part.trim())
    .join('\n\n');

  return { rendered, contentHtml };
}

async function main() {
  const template = await fs.readFile(TEMPLATE_PATH, 'utf8');
  const nav = JSON.parse(await fs.readFile(NAV_PATH, 'utf8'));
  if (!Array.isArray(nav) || !nav.length) {
    throw new Error('docs/pages/nav.json 必须是非空数组');
  }

  const { pages, order } = await loadPages(nav);

  for (const slug of order) {
    const page = pages.get(slug);
    const { rendered, contentHtml } = renderPage(page);
    const canonical = SITE_URL + '/' + (slug === 'index' ? '' : pageHref(slug));

    const html = fillTemplate(template, {
      title: escapeHtml(page.title),
      description: escapeHtml(page.description),
      lede: escapeHtml(page.lede),
      group: escapeHtml(page.group),
      nav: renderNav(nav, pages, slug),
      pageToc: renderPageToc(rendered),
      content: contentHtml,
      canonical
    });

    if (/\{\{[a-zA-Z]+\}\}/.test(html)) {
      throw new Error('模板占位符没有全部替换：' + slug);
    }

    await fs.writeFile(path.join(OUTPUT_DIR, pageHref(slug)), html);
    console.log('生成 docs/' + pageHref(slug) + '，' + rendered.length + ' 节');
  }
}

main().catch((error) => {
  console.error('构建失败：' + error.message);
  process.exitCode = 1;
});
