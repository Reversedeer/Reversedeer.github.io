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
const INDEX_TEMPLATE_PATH = path.join(ROOT, 'scripts', 'docs-index-template.html');
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
    '<div class="docs-table-wrap"><table class="docs-table">$1</table></div>',
  );

  const titleHtml = marked.parseInline(section.title).trim();
  const label = escapeHtml(plainText(section.title));
  const attr = escapeHtml(id);

  const heading =
    '<h2 class="docs-section__title" id="' +
    attr +
    '">' +
    titleHtml +
    '<a class="docs-anchor" href="#' +
    attr +
    '" aria-label="本节锚点：' +
    label +
    '">#</a></h2>';

  const wrapper =
    '<section class="docs-section reveal" aria-labelledby="' +
    attr +
    '">\n' +
    '            ' +
    heading +
    '\n' +
    html.trim() +
    '\n' +
    '          </section>';

  return { id, title: plainText(section.title), headings: prepared.headings, html: wrapper };
}

/* 左侧文档目录：按 nav.json 分组，当前页面所在分组展开 */
function renderNav(nav, pages, currentSlug) {
  const currentPage = pages.get(currentSlug);
  if (currentPage.layout === 'index') return '';
  const groups = nav.filter((group) => String(group.project || '') === currentPage.project);
  const heading =
    '<p class="docs-toc__project">' + escapeHtml(currentPage.projectTitle) + '</p>\n';
  return (
    heading +
    groups
      .map((group) => {
        const slugs = Array.isArray(group.pages) ? group.pages : [];
        const active = slugs.includes(currentSlug);
        const items = slugs
          .map((slug) => {
            const page = pages.get(slug);
            if (!page) throw new Error('nav.json 引用了不存在的页面：' + slug);
            const current = slug === currentSlug;
            return (
              '              <li><a class="docs-toc__link' +
              (current ? ' is-current' : '') +
              '" href="' +
              pageHref(slug) +
              '"' +
              (current ? ' aria-current="page"' : '') +
              '>' +
              escapeHtml(page.title) +
              '</a></li>'
            );
          })
          .join('\n');

        return (
          '            <details class="docs-toc__group"' +
          (active ? ' open' : '') +
          '>\n' +
          '              <summary class="docs-toc__group-title">' +
          escapeHtml(group.group || '') +
          '</summary>\n' +
          '              <ul class="docs-toc__list">\n' +
          items +
          '\n              </ul>\n' +
          '            </details>'
        );
      })
      .join('\n')
  );
}

/* 右侧本页目录：二级标题加各自的三级标题 */
function renderPageToc(sections) {
  const items = sections
    .map((section) => {
      const subItems = section.headings
        .map(
          (heading) =>
            '              <li><a class="docs-page-toc__link" href="#' +
            escapeHtml(heading.id) +
            '">' +
            escapeHtml(heading.title) +
            '</a></li>',
        )
        .join('\n');

      const subList = subItems
        ? '\n            <ul class="docs-page-toc__sublist">\n' + subItems + '\n            </ul>'
        : '';

      return (
        '          <li><a class="docs-page-toc__link" href="#' +
        escapeHtml(section.id) +
        '">' +
        escapeHtml(section.title) +
        '</a>' +
        subList +
        '</li>'
      );
    })
    .join('\n');

  return '          <ul class="docs-page-toc__list">\n' + items + '\n          </ul>';
}

/* 翻页顺序沿用 nav.json，允许从当前分组进入下一分组。 */
function renderPagination(previous, next) {
  const items = [
    { page: previous, direction: 'previous', label: '上一页', rel: 'prev', arrow: '«' },
    { page: next, direction: 'next', label: '下一页', rel: 'next', arrow: '»' },
  ]
    .filter((item) => item.page)
    .map(({ page, direction, label, rel, arrow }) => {
      const title = escapeHtml(page.title);
      const glyph = '<span class="docs-pagination__arrow" aria-hidden="true">' + arrow + '</span>';
      const text = '<span class="docs-pagination__text">' + title + '</span>';
      return (
        '<a class="docs-pagination__link docs-pagination__link--' +
        direction +
        '"' +
        ' href="' +
        pageHref(page.slug) +
        '" rel="' +
        rel +
        '"' +
        ' aria-label="' +
        label +
        '：' +
        title +
        '">' +
        '<span class="docs-pagination__label">' +
        label +
        '</span>' +
        '<span class="docs-pagination__title">' +
        (direction === 'previous' ? glyph + text : text + glyph) +
        '</span></a>'
      );
    });
  if (!items.length) return '';
  return (
    '<nav class="docs-pagination reveal" aria-label="文档翻页">\n' + items.join('\n') + '\n</nav>'
  );
}

function fillTemplate(template, values) {
  let html = template;
  for (const [key, value] of Object.entries(values)) {
    html = html.replaceAll('{{' + key + '}}', () => value);
  }
  return html;
}

function renderProjectList(pages, order) {
  const projects = new Map();
  for (const slug of order) {
    const page = pages.get(slug);
    if (!page.project || projects.has(page.project)) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(page.date)) {
      throw new Error(slug + '.md：项目首页需要 YYYY-MM-DD 格式的 date');
    }
    projects.set(page.project, page);
  }
  const years = new Map();
  for (const page of [...projects.values()].sort((a, b) => b.date.localeCompare(a.date))) {
    const year = page.date.slice(0, 4);
    if (!years.has(year)) years.set(year, []);
    years.get(year).push(page);
  }

  // 与博客首页保持同一套年份分组、日期和文章行结构
  return [...years]
    .map(([year, entries]) => {
      const rows = entries
        .map(
          (page, index) =>
            '              <li class="post-row reveal" style="--i: ' +
            (index % 3) +
            '">\n' +
            '                <a class="post-row__link" href="' +
            pageHref(page.slug) +
            '">\n' +
            '                  <time class="post-row__date" datetime="' +
            page.date +
            '">' +
            page.date +
            '</time>\n' +
            '                  <span class="post-row__title">' +
            escapeHtml(page.title) +
            '</span>\n' +
            '                </a>\n' +
            '              </li>',
        )
        .join('\n');

      return (
        '          <section class="blog-group" aria-labelledby="year-' +
        year +
        '">\n' +
        '            <div class="section__head reveal">\n' +
        '              <h2 class="blog-year fx-drift" id="year-' +
        year +
        '">' +
        year +
        '</h2>\n' +
        '            </div>\n' +
        '            <ul class="post-list">\n' +
        rows +
        '\n' +
        '            </ul>\n' +
        '          </section>'
      );
    })
    .join('\n\n');
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
        project: String(group.project || ''),
        projectTitle: String(group.projectTitle || ''),
        layout: data.layout === 'index' ? 'index' : 'document',
        group: String(group.group || ''),
        title: String(data.title || slug),
        description: String(data.description || ''),
        lede: String(data.lede || data.description || ''),
        date:
          data.date instanceof Date
            ? data.date.toISOString().slice(0, 10)
            : String(data.date || ''),
        content,
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
  const preambleHtml = preamble.length ? marked.parse(preamble.join('\n'), { gfm: true }) : '';
  const contentHtml = [preambleHtml, ...rendered.map((section) => section.html)]
    .filter((part) => part.trim())
    .join('\n\n');

  return { rendered, contentHtml };
}

async function main() {
  const [template, indexTemplate] = await Promise.all([
    fs.readFile(TEMPLATE_PATH, 'utf8'),
    fs.readFile(INDEX_TEMPLATE_PATH, 'utf8'),
  ]);
  const nav = JSON.parse(await fs.readFile(NAV_PATH, 'utf8'));
  if (!Array.isArray(nav) || !nav.length) {
    throw new Error('docs/pages/nav.json 必须是非空数组');
  }

  const { pages, order } = await loadPages(nav);
  const projectList = renderProjectList(pages, order);

  for (const slug of order) {
    const page = pages.get(slug);
    const projectOrder = order.filter(
      (item) => pages.get(item).project === page.project && pages.get(item).layout !== 'index',
    );
    const projectIndex = projectOrder.indexOf(slug);
    const landing = pages.get(projectOrder[0]);
    const projectBreadcrumb =
      landing && landing.slug !== slug
        ? '<span class="docs-breadcrumb__sep" aria-hidden="true"></span>' +
          '<a class="docs-breadcrumb__link" href="' +
          pageHref(landing.slug) +
          '">' +
          escapeHtml(page.projectTitle) +
          '</a>'
        : '';
    const isIndex = page.layout === 'index';
    const { rendered, contentHtml } = isIndex
      ? { rendered: [], contentHtml: '' }
      : renderPage(page);
    const canonical = SITE_URL + '/' + (slug === 'index' ? '' : pageHref(slug));

    const html = fillTemplate(isIndex ? indexTemplate : template, {
      title: escapeHtml(page.title),
      description: escapeHtml(page.description),
      lede: escapeHtml(page.lede),
      group: escapeHtml(page.group),
      bodyClassAttr: isIndex ? ' class="blog-index"' : '',
      projectList,
      projectBreadcrumb,
      nav: renderNav(nav, pages, slug),
      pageToc: renderPageToc(rendered),
      pagination:
        page.layout === 'index'
          ? ''
          : renderPagination(
              pages.get(projectOrder[projectIndex - 1]),
              pages.get(projectOrder[projectIndex + 1]),
            ),
      content: contentHtml,
      canonical,
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
