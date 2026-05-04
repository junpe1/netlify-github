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

function slugify(value = "") {
  const slug = String(value)
    .trim()
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (slug) {
    return slug;
  }
  return `cat-${Array.from(String(value).trim())
    .map((char) => char.codePointAt(0).toString(36))
    .join("-")}`;
}

function titleCase(value = "") {
  if (/[A-Z]/.test(value)) {
    return value.trim();
  }
  return value
    .trim()
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
      categories: categories.map((category) => ({
        id: slugify(category),
        label: titleCase(category),
      })),
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
        <a href="mailto:hello@example.com">CONTACT</a>
      </nav>
    </header>`;
}

function footer() {
  return `<footer class="footer">
      <span>© Interrobang</span>
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
    work.categories.map((category) => category.id).join(" "),
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
        <h1 id="home-title">Architect /</h1>
        <div class="home-copy">
          <p>Jumpei Mori is an architect and Project Associate Professor at Tokyo University of the Arts, where he also serves as Director of The Way Of.</p>
          <p>His work centers on connecting art, society, and the city by designing new social ecosystems and connections. He is a founding director of PARADISE AIR and leads key cultural platforms such as VIVA and YAU.</p>
          <p>In 2026, he established the GEIDAI NY DESK in New York, the university's first overseas base. Mori's practice extends beyond buildings to the design of invisible structures, including institutional systems and community networks.</p>
        </div>
        <div class="home-links">
          <a class="text-link" href="./about.html">Learn More</a>
        </div>
      </section>

      <section class="selected home-works" aria-label="プロジェクト一覧">
        <div class="section-label">
          <p>Selected Projects</p>
          <span>2006 - 2026</span>
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
        <p class="page-label" id="home-inquiries-title">CONTACT</p>
        <a class="contact-link" href="mailto:hello@example.com">hello@example.com</a>
      </section>`,
  });
}

function worksPage(works) {
  const categories = [
    ...new Map(
      works
        .flatMap((work) => work.categories)
        .map((category) => [category.id, category]),
    ).values(),
  ];
  const workYears = works.map((work) => Number(work.year)).filter(Boolean);
  const maxYear = Math.max(...workYears);
  const minYear = Math.min(2006, ...workYears);
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, index) =>
    String(maxYear - index),
  );
  const categoryButtons = categories
    .map((category) => `<button class="filter-button" type="button" data-filter="${escapeHtml(category.id)}" aria-pressed="false">${escapeHtml(category.label)}</button>`)
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
        <aside class="work-meta">${escapeHtml(work.categories.map((category) => category.label).join(" / "))}</aside>
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
