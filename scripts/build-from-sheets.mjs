import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const LOCAL_CSV = path.join(ROOT, "works-spreadsheet-template.csv");
const SHEET_CSV_URL = process.env.SHEET_CSV_URL;

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((item) => item.some((cell) => cell.trim()));
}

async function loadWorks() {
  const csv = SHEET_CSV_URL
    ? await fetch(SHEET_CSV_URL).then((response) => {
        if (!response.ok) {
          throw new Error(`Could not fetch Google Sheets CSV: ${response.status}`);
        }
        return response.text();
      })
    : await fs.readFile(LOCAL_CSV, "utf8");

  const [headers, ...rows] = parseCsv(csv);
  return rows.map((row) => {
    const item = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]));
    const categories = item.categories
      .split(",")
      .map((category) => category.trim())
      .filter(Boolean);
    return {
      ...item,
      title_display: item.title || item.title_en,
      categories,
    };
  });
}

function nav(active = "") {
  const projectCurrent = active === "projects" ? ' aria-current="page"' : "";
  const aboutCurrent = active === "about" ? ' aria-current="page"' : "";
  return `<header class="site-header" aria-label="サイトヘッダー">
      <a class="brand" href="./index.html" aria-label="森純平とインテロバング">
        <span>JUNPEI MORI / INTERROBANG</span>
      </a>
      <nav class="nav" aria-label="主要ナビゲーション">
        <a${projectCurrent} href="./works.html">PROJECTS</a>
        <a${aboutCurrent} href="./about.html">ABOUT</a>
        <a href="mailto:hello@example.com">INQUIRIES</a>
      </nav>
    </header>`;
}

function footer() {
  return `<footer class="footer">
      <span>© 森純平とインテロバング</span>
      <a href="./index.html">Home</a>
    </footer>`;
}

function shell({ title, description, active, body }) {
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body>
    ${nav(active)}

    <main>
${body}
    </main>

    ${footer()}
  </body>
</html>
`;
}

function projectRow(work) {
  return `<a class="project-row" href="./work-${escapeHtml(work.slug)}.html" data-tags="${escapeHtml(
    work.categories.join(" "),
  )}" data-year="${escapeHtml(work.year)}">
            <span class="project-name">${escapeHtml(work.title_display)}</span>
            <span class="project-meta">${escapeHtml(work.meta)}</span>
          </a>`;
}

function indexPage(works) {
  const selectedRows = works.slice(0, 3).map(projectRow).join("\n          ");
  return shell({
    title: "森純平とインテロバング",
    description: "森純平とインテロバングの活動、プロジェクト、制作姿勢を紹介するサイト。",
    active: "",
    body: `      <section class="home" aria-labelledby="home-title">
        <p class="page-label">ABOUT</p>
        <h1 id="home-title">森純平とインテロバング</h1>
        <div class="home-copy">
          <p>JUNPEI MORIは、文章、編集、企画、ウェブ、展示の言葉を横断して活動しています。</p>
          <p>INTERROBANGは、問いの輪郭を見つけ、まだ名前のついていない感覚を読み手や使い手に届くかたちへ整える制作室です。</p>
        </div>
      </section>

      <section class="selected home-works" aria-label="プロジェクト一覧">
        <div class="section-label">
          <p>Selected Projects</p>
          <span>2019 - 2026</span>
        </div>

        <div class="project-list">
          ${selectedRows}
          <a class="project-row" href="./works.html">
            <span class="project-name">All Projects</span>
            <span class="project-meta">View Index</span>
          </a>
        </div>
      </section>

      <section class="home-inquiries" aria-labelledby="home-inquiries-title">
        <p class="page-label" id="home-inquiries-title">INQUIRIES</p>
        <a class="contact-link" href="mailto:hello@example.com">hello@example.com</a>
      </section>`,
  });
}

function worksPage(works) {
  const categories = [...new Set(works.flatMap((work) => work.categories))];
  const years = [...new Set(works.map((work) => work.year))].sort((a, b) => Number(b) - Number(a));
  const categoryButtons = categories
    .map((category) => `<button class="filter-button" type="button" data-filter="${escapeHtml(category)}" aria-pressed="false">${escapeHtml(category)}</button>`)
    .join("\n            ");
  const yearButtons = years
    .map((year) => `<button class="filter-button" type="button" data-year="${escapeHtml(year)}" aria-pressed="false">${escapeHtml(year)}</button>`)
    .join("\n            ");
  const rows = works.map(projectRow).join("\n          ");

  return shell({
    title: "Projects - 森純平とインテロバング",
    description: "森純平とインテロバングのプロジェクト一覧。",
    active: "projects",
    body: `      <section class="page-head" aria-labelledby="works-title">
        <p class="page-label">PROJECTS</p>
        <h1 class="visually-hidden" id="works-title">Projects</h1>
      </section>

      <section class="selected" aria-label="プロジェクト一覧">
        <div class="section-label">
          <p>Selected Projects</p>
          <span>2019 - 2026</span>
        </div>

        <div class="filters" aria-label="作品フィルター">
          <div class="filter-group" aria-label="カテゴリー">
            <span>Category</span>
            <button class="filter-button is-active" type="button" data-filter="all" aria-pressed="true">All</button>
            ${categoryButtons}
          </div>
          <div class="filter-group" aria-label="年">
            <span>Year</span>
            <button class="filter-button is-active" type="button" data-year="all" aria-pressed="true">All</button>
            ${yearButtons}
          </div>
        </div>

        <div class="project-list">
          ${rows}
        </div>
      </section>`,
  }).replace(
    "</body>",
    `<script>
      const active = { tag: "all", year: "all" };
      const rows = Array.from(document.querySelectorAll(".project-row"));
      const buttons = Array.from(document.querySelectorAll(".filter-button"));

      function updateWorks() {
        rows.forEach((row) => {
          const tags = row.dataset.tags.split(" ");
          const tagMatch = active.tag === "all" || tags.includes(active.tag);
          const yearMatch = active.year === "all" || row.dataset.year === active.year;
          row.hidden = !(tagMatch && yearMatch);
        });
      }

      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          const group = button.dataset.filter ? "filter" : "year";
          const selector = group === "filter" ? "[data-filter]" : "[data-year]";
          document.querySelectorAll(selector).forEach((item) => {
            item.classList.remove("is-active");
            item.setAttribute("aria-pressed", "false");
          });
          button.classList.add("is-active");
          button.setAttribute("aria-pressed", "true");
          active[group === "filter" ? "tag" : "year"] =
            group === "filter" ? button.dataset.filter : button.dataset.year;
          updateWorks();
        });
      });
    </script>
  </body>`,
  );
}

function workPage(work) {
  return shell({
    title: `${work.title_display} - 森純平とインテロバング`,
    description: `${work.title_display}のプロジェクト詳細。`,
    active: "projects",
    body: `      <section class="page-head" aria-labelledby="work-title">
        <p class="page-label">${escapeHtml(work.meta)}</p>
        <h1 id="work-title">${escapeHtml(work.title_display)}</h1>
      </section>

      <article class="work-detail">
        <aside class="work-meta">${escapeHtml(work.categories.join(" / "))}</aside>
        <div class="work-body">
          <p>${escapeHtml(work.summary)}</p>
          <figure class="work-image">
            <img src="${escapeHtml(work.image_url)}" alt="${escapeHtml(work.image_alt)}">
          </figure>
          <a class="text-link" href="./works.html">Back to Projects</a>
        </div>
      </article>`,
  });
}

async function writeFile(name, content) {
  await fs.writeFile(path.join(PUBLIC_DIR, name), content, "utf8");
}

async function copyFile(name) {
  await fs.copyFile(path.join(ROOT, name), path.join(PUBLIC_DIR, name));
}

const works = await loadWorks();
await fs.rm(PUBLIC_DIR, { recursive: true, force: true });
await fs.mkdir(PUBLIC_DIR, { recursive: true });

await copyFile("styles.css");
await copyFile("about.html");
await writeFile("index.html", indexPage(works));
await writeFile("works.html", worksPage(works));

for (const work of works) {
  await writeFile(`work-${work.slug}.html`, workPage(work));
}

console.log(`Generated ${works.length} projects from ${SHEET_CSV_URL ? "Google Sheets" : "local CSV"}.`);
