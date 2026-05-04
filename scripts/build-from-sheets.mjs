import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const LOCAL_CSV = path.join(ROOT, "works-spreadsheet-template.csv");
const LOCAL_ABOUT_CSV = path.join(ROOT, "about-content-template.csv");
const SHEET_CSV_URL = process.env.SHEET_CSV_URL;
const ABOUT_CSV_URL = process.env.ABOUT_CSV_URL;
const ASSET_VERSION = "20260504-orange-scoped-v3";

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

function parseFeatured(value = "") {
  return ["1", "true", "yes", "y", "featured", "top"].includes(
    String(value).trim().toLowerCase(),
  );
}

function parseSortOrder(value = "") {
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
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
  const works = rows
    .map((row, rowIndex) => {
      const item = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]));
      const categories = item.categories
        .split(",")
        .map((category) => category.trim())
        .filter(Boolean);
      return {
        ...item,
        source_index: rowIndex,
        sort_order: parseSortOrder(item.sort_order),
        featured: parseFeatured(item.featured),
        title_display: item.title || item.title_en,
        categories: categories.map((category) => ({
          id: slugify(category),
          label: titleCase(category),
        })),
      };
    })
    .filter((item) => item.slug && item.title_display && item.year);

  const hasSortOrder = works.some((work) => work.sort_order !== null);
  return works.sort((a, b) => {
    if (!hasSortOrder) {
      return a.source_index - b.source_index;
    }
    return (a.sort_order ?? 9999) - (b.sort_order ?? 9999) || a.source_index - b.source_index;
  });
}

async function loadAbout() {
  const csv = ABOUT_CSV_URL
    ? await fetch(ABOUT_CSV_URL).then((response) => {
        if (!response.ok) {
          throw new Error(`Could not fetch About CSV: ${response.status}`);
        }
        return response.text();
      })
    : await fs.readFile(LOCAL_ABOUT_CSV, "utf8");

  const [headers, ...rows] = parseCsv(csv);
  return Object.fromEntries(
    rows.map((row) => {
      const item = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]));
      return [item.key, item.value];
    }),
  );
}

function nav(active = "") {
  const projectCurrent = active === "projects" ? ' aria-current="page"' : "";
  const aboutCurrent = active === "about" ? ' aria-current="page"' : "";
  const interrobangCurrent = active === "interrobang" ? ' aria-current="page"' : "";
  const brandText = active === "interrobang" ? "INTERROBANG" : "JUNPEI MORI / INTERROBANG";
  const brandHref = active === "interrobang" ? "./interrobang.html" : "./index.html";
  const navLinks =
    active === "interrobang"
      ? `<a href="./works.html">PROJECTS</a>
        <a href="./about.html">JUNPEI MORI</a>
        <a href="#ritsuko-mori">RITSUKO MORI</a>
        <a href="mailto:hello@example.com">CONTACT</a>`
      : `<a${projectCurrent} href="./works.html">PROJECTS</a>
        <a${aboutCurrent} href="./about.html">ABOUT</a>
        <a${interrobangCurrent} href="./interrobang.html">INTERROBANG</a>
        <a href="mailto:hello@example.com">CONTACT</a>`;
  return `<header class="site-header" aria-label="サイトヘッダー">
      <a class="brand" href="${brandHref}" aria-label="森純平とインテロバング">
        <span>${brandText}</span>
      </a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
        <span class="menu-toggle-text">Menu</span>
        <span class="menu-line" aria-hidden="true"></span>
        <span class="menu-line" aria-hidden="true"></span>
      </button>
      <nav class="nav" id="site-nav" aria-label="主要ナビゲーション">
        ${navLinks}
      </nav>
    </header>`;
}

function footer() {
  return `<footer class="footer">
      <span>© Interrobang</span>
      <span class="footer-links"><a href="./index.html">Home</a><a href="mailto:hello@example.com">Contact</a></span>
    </footer>`;
}

function contactSection() {
  return `<section class="contact contact-form-section" aria-labelledby="contact-title">
        <p class="kicker">CONTACT</p>
        <form class="contact-form" name="contact" method="POST" data-netlify="true">
          <input type="hidden" name="form-name" value="contact">
          <label>
            <span>Name</span>
            <input type="text" name="name" autocomplete="name">
          </label>
          <label>
            <span>Mail</span>
            <input type="email" name="email" autocomplete="email">
          </label>
          <label>
            <span>Subject</span>
            <input type="text" name="subject">
          </label>
          <label class="message-field">
            <span>Message</span>
            <textarea name="message" rows="5"></textarea>
          </label>
          <button type="submit">Send</button>
        </form>
      </section>`;
}

function shell({ title, description, active, body }) {
  const bodyClass = active === "interrobang" ? ' class="interrobang-theme"' : "";
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="stylesheet" href="./styles.css?v=${ASSET_VERSION}">
  </head>
  <body${bodyClass}>
    ${nav(active)}

    <main>
${body}
    </main>

    ${footer()}
    <script src="./menu.js?v=${ASSET_VERSION}"></script>
  </body>
</html>
`;
}

function projectRow(work, { image = false } = {}) {
  const imageMarkup = image
    ? `<span class="project-thumb"><img src="${escapeHtml(work.image_url)}" alt=""></span>`
    : "";
  const imageClass = image ? " project-row-with-image" : "";
  return `<a class="project-row${imageClass}" href="./work-${escapeHtml(work.slug)}.html" data-tags="${escapeHtml(
    work.categories.map((category) => category.id).join(" "),
  )}" data-year="${escapeHtml(work.year)}">
            ${imageMarkup}
            <span class="project-name">${escapeHtml(work.title_display)}</span>
            <span class="project-meta">${escapeHtml(work.year)}</span>
          </a>`;
}

function indexPage(works) {
  const featuredWorks = works.filter((work) => work.featured);
  const selectedWorks = (featuredWorks.length ? featuredWorks : works).slice(0, 5);
  const selectedRows = works
    .filter((work) => selectedWorks.includes(work))
    .map((work) => projectRow(work, { image: true }))
    .join("\n          ");
  return shell({
    title: "森純平とインテロバング",
    description: "森純平とインテロバングの活動、プロジェクト、制作姿勢を紹介するサイト。",
    active: "",
    body: `      <section class="home" aria-labelledby="home-title">
        <h1 class="visually-hidden" id="home-title">Jumpei Mori</h1>
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

      ${contactSection()}`,
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
  const years = [...new Set(works.map((work) => work.year))].sort(
    (a, b) => Number(b) - Number(a),
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
            <span>Category /</span>
            <button class="filter-button is-active" type="button" data-filter="all" aria-pressed="true">All</button>
            ${categoryButtons}
          </div>
          <div class="filter-group" aria-label="年">
            <span>Year /</span>
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
          const dimmed = !(tagMatch && yearMatch);
          row.classList.toggle("is-dimmed", dimmed);
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

function aboutPage(about) {
  return shell({
    title: "About - 森純平とインテロバング",
    description: "森純平とインテロバングについて。",
    active: "about",
    body: `      <section class="about about-page" aria-label="プロフィール">
        <div class="about-body">
          <div class="bio-section">
            <p class="bio-title">${escapeHtml(about.en_name)}</p>
            <p class="bio-role">${escapeHtml(about.en_role)}</p>
            <p>${escapeHtml(about.en_p1)}</p>
            <p>${escapeHtml(about.en_p2)}</p>
            <p>${escapeHtml(about.en_p3)}</p>
          </div>

          <div class="bio-section">
            <p>${escapeHtml(about.ja_p1)}</p>
            <p>${escapeHtml(about.ja_p2)}</p>
            <p>${escapeHtml(about.ja_p3)}</p>
          </div>
        </div>
      </section>

      ${contactSection()}`,
  });
}

function interrobangPage() {
  return shell({
    title: "Interrobang - 森純平とインテロバング",
    description: "株式会社インテロバングについて。",
    active: "interrobang",
    body: `      <section class="page-head compact-head" aria-labelledby="interrobang-title">
        <h1 id="interrobang-title">INTERROBANG / インテロバング</h1>
      </section>

      <section class="text-page interrobang-page">
        <article class="text-block">
          <p>‽(インテロバング、感嘆修辞疑問符）は、英語などの表記に使われる記号で、疑問符「?」と感嘆符「!」を縦に重ね合わせたもので、疑問と感嘆を同時に表現します。</p>
          <p>株式会社インテロバングは、日常の空間に提案を行い、驚きと感動を与えることを目指しています。まちや広場、建物など日常空間の在り方を思考し、建築家・美術家・写真家・音楽家・エンジニアなど、化学反応を起こしそうな仲間と共に、あるべき未来を提案しています‽</p>
        </article>

        <article class="text-block keyword-block">
          <p class="kicker">KEYWORD</p>
          <dl class="keyword-list">
            <div><dt>Innovation</dt><dd>新しいアイデアや技術を採用し、従来の方法にとらわれない発想で空間デザインを追求すること。</dd></div>
            <div><dt>Interdisciplinary Collaboration</dt><dd>建築家、美術家、写真家、音楽家、エンジニアなど、多様な専門分野のメンバーが共同でプロジェクトに取り組むことで、新たな価値を生み出す。</dd></div>
            <div><dt>Sustainability</dt><dd>環境や社会への影響を考慮し、エコロジカルなデザインや未来の世代に継承できる価値ある空間を創出すること。</dd></div>
            <div><dt>Local Identity</dt><dd>地域や文化の特色を活かし、それぞれの場所に根ざした空間デザインを提案すること。</dd></div>
            <div><dt>Wonder and Emotion</dt><dd>日常空間に驚きと感動をもたらすデザインで、人々の暮らしを豊かにすることを目指す。</dd></div>
          </dl>
        </article>

        <article class="text-block">
          <p class="kicker">OUR PROJECTS</p>
          <div class="chronology">
            <p><span>2025</span>YAU CENTER ゼニガメ 設計（市原昇と共同） / YAU STUDIO(銀座INZ) / Future Vision Summit 会場構成監修（小泉立と共同） / 恋はみずいろ(作・演出：菅原直樹)</p>
            <p><span>2024-</span>千葉家(重要文化財) 展示計画 / 尾道市御調文化会館 音響設計 / ISAI PARK ヘラルボニー音響設計 / 大手町タワー音響改修 PJ / YAU STUDIO(国際ビル7F) / YAU CENTER(国際ビル1F) / 終点まさゆめ 舞台美術（志賀耕太と共同）</p>
            <p><span>2023-</span>長野県小諸新校 音響設計 / レクリエーション葬(作・演出：菅原直樹)</p>
            <p><span>2021-</span>有楽町アートアーバニズム 企画/運営</p>
            <p><span>2017-2021</span>青森県八戸市美術館 設計/音響設計</p>
            <p><span>2019-2020</span>京成上野駅地下通路改修 ディレクション/基本設計/管理</p>
            <p><span>2019</span>取手市たいけん美じゅつ場 VIVA 基本設計/管理/運営 / 電通 本社ビル23階 Open the Window Project 音響システム、オリジナル音源制作</p>
            <p><span>2018</span>電通 本社ビル39階 Open the Window Project 音響システム、オリジナル音源制作</p>
            <p><span>2017</span>森の音楽祭 企画/運営</p>
            <p><span>2021</span>森の音楽集 編纂</p>
          </div>
        </article>

        <article class="text-block">
          <p class="kicker">COMPANY</p>
          <dl class="company-list">
            <div><dt>商号</dt><dd>株式会社インテロバング</dd></div>
            <div><dt>設立</dt><dd>2019年12月23日</dd></div>
            <div><dt>事業内容</dt><dd>建築、音、アートに関わる企画・設計・コンサルティング</dd></div>
            <div><dt>主要取引先</dt><dd>株式会社アトレ / 京成電鉄株式会社 / コンバースジャパン株式会社 / 小諸市 / 株式会社電通 / 東京藝術大学 / 八戸市 / 松戸市 / 三菱地所株式会社</dd></div>
            <div><dt>主な受賞歴</dt><dd>JIA日本建築大賞（八戸市美術館）2023 / AACA賞2023優秀賞（八戸市美術館）2023 / グッド・デザイン・ベスト100, 2022（八戸市美術館） / 第43回東北建築賞 作品賞（八戸市美術館）2022 / 第14回ふるさとあおもり景観賞最優秀賞 公共施設部門（八戸市美術館）2018 / 松戸市教育文化功労賞(PARADISE AIR)2016 / 松戸景観優秀賞(やしま商店)2016</dd></div>
          </dl>
        </article>

        <article class="text-block">
          <p class="kicker">MEMBER</p>
          <div class="member-list">
            <section id="junpei-mori">
              <h2>森 純平 / Junpei Mori</h2>
              <p>Architect / Consultant / Educator / 空間デザイン / 建築設計 / 企画コンサルティング / マネジメント / ブランドディレクション / Director of PARADISE AIR / Co-director of VIVA.</p>
              <p><a class="text-link" href="https://linktr.ee/junpe1">Linktree</a></p>
            </section>
            <section id="ritsuko-mori">
              <h2>森 律子 / Ritsuko Mori</h2>
              <p>Architect / Acoustic designer / Interior and Furniture designer / 音響設計 / 音環境コンサルテング / 内装設計 / 家具デザイン / Interior and acoustic designer of SONA Co.</p>
              <p>東京藝術大学 音楽学部 音楽環境創造科、早稲田大学芸術学校 建築科、東京藝術大学大学院 音楽音響創造を経て、株式会社ソナで音響設計・意匠設計の両面からスタジオデザインに従事。2019年、株式会社インテロバング設立。</p>
            </section>
          </div>
        </article>
      </section>`,
  });
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
const about = await loadAbout();
await fs.rm(PUBLIC_DIR, { recursive: true, force: true });
await fs.mkdir(PUBLIC_DIR, { recursive: true });

await copyFile("styles.css");
await copyFile("menu.js");
await copyFile("_headers");
await writeFile("index.html", indexPage(works));
await writeFile("works.html", worksPage(works));
await writeFile("about.html", aboutPage(about));
await writeFile("interrobang.html", interrobangPage());

for (const work of works) {
  await writeFile(`work-${work.slug}.html`, workPage(work));
}

console.log(`Generated ${works.length} projects from ${SHEET_CSV_URL ? "Google Sheets" : "local CSV"}.`);
