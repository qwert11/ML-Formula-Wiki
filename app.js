// Рендер шпаргалки из data/formulas.js: оглавление по блокам, карточки
// со всеми 7 полями, поиск по названию, копирование LaTeX.

const BLOCKS = {
  E: "Персептрон и ADALINE",
  A: "Основы обучения",
  B: "Логистическая регрессия",
  C: "Метод опорных векторов",
  D: "Деревья решений и k ближайших соседей",
  F: "Подготовка данных",
  G: "Снижение размерности",
  H: "Оценка качества моделей",
  I: "Ансамблевые методы",
  J: "Анализ текстовых данных",
  K: "Регрессионный анализ",
  L: "Кластеризация",
  M: "Многослойные нейронные сети",
  N: "Функции активации нейронных сетей"
};

function tex(el, latex, displayMode) {
  katex.render(latex, el, { displayMode: !!displayMode, throwOnError: false });
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function buildCard(f) {
  const card = el("article", "formula-card");
  card.id = "formula-" + f.id;
  card.dataset.name = f.name.toLowerCase();

  // Заголовок: номер, название, страница
  const title = el("h3", null, f.order + ". " + f.name + " ");
  const ref = el("span", "page-ref", "(" + f.chapter + ", стр. " + f.page + ")");
  title.appendChild(ref);
  card.appendChild(title);

  // Формула + кнопка копирования LaTeX
  const formulaWrap = el("div", "formula-wrap");
  const display = el("div", "formula-display");
  tex(display, f.latex, true);
  formulaWrap.appendChild(display);

  const copyBtn = el("button", "copy-btn", "копировать LaTeX");
  copyBtn.type = "button";
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(f.latex).then(() => {
      copyBtn.textContent = "скопировано ✓";
      setTimeout(() => { copyBtn.textContent = "копировать LaTeX"; }, 1500);
    });
  });
  formulaWrap.appendChild(copyBtn);
  card.appendChild(formulaWrap);

  // Вывод формулы (только у формул с полем derivation), свёрнут по умолчанию
  if (f.derivation && f.derivation.length) {
    const details = document.createElement("details");
    details.className = "derivation";
    const summary = el("summary", null, "Как выводится");
    details.appendChild(summary);
    const steps = el("ol", "derivation-steps");
    for (const step of f.derivation) {
      const li = el("li");
      const stepTex = el("div", "derivation-latex");
      tex(stepTex, step.latex, true);
      li.appendChild(stepTex);
      li.appendChild(el("p", "derivation-comment", step.comment));
      steps.appendChild(li);
    }
    details.appendChild(steps);
    card.appendChild(details);
  }

  // Числовой пример есть у каждой формулы и свёрнут по умолчанию.
  const example = WORKED_EXAMPLES[f.id];
  if (example) {
    const details = document.createElement("details");
    details.className = "worked-example";
    details.appendChild(el("summary", null, "Пример на простых числах"));

    const content = el("div", "worked-example-content");
    const situation = el("p", "worked-example-question");
    situation.appendChild(el("strong", null, "Ситуация: "));
    situation.appendChild(document.createTextNode(example.question));
    content.appendChild(situation);

    if (example.hint) {
      const hint = el("p", "worked-example-hint");
      hint.appendChild(el("strong", null, "Что означают числа: "));
      hint.appendChild(document.createTextNode(example.hint));
      content.appendChild(hint);
    }

    content.appendChild(el("p", "worked-example-label", "Подставляем числа в формулу:"));
    const calculation = el("div", "worked-example-calculation");
    tex(calculation, example.calculation, true);
    content.appendChild(calculation);

    const answer = el("p", "worked-example-answer");
    answer.appendChild(el("strong", null, "Простыми словами: "));
    answer.appendChild(document.createTextNode(example.answer));
    content.appendChild(answer);
    details.appendChild(content);
    card.appendChild(details);
  }

  // Год и автор
  const meta = el("p", "discovered");
  meta.append(el("strong", null, "Кто и когда: "));
  meta.append(document.createTextNode(f.discovered.who + " — " + f.discovered.year + "."));
  if (f.discovered.note) {
    meta.append(" ");
    meta.append(el("span", "note", f.discovered.note + "."));
  }
  card.appendChild(meta);

  // Параметры
  card.appendChild(el("h4", null, "Параметры"));
  const dl = el("dl", "params");
  for (const p of f.params) {
    const dt = el("dt");
    tex(dt, p.symbol, false);
    const dd = el("dd", null, p.desc);
    dl.appendChild(dt);
    dl.appendChild(dd);
  }
  card.appendChild(dl);

  // Что делает
  card.appendChild(el("h4", null, "Что делает"));
  card.appendChild(el("p", "description", f.description));

  // Реальные примеры
  card.appendChild(el("h4", null, "Реальные примеры"));
  const ul = el("ul", "examples");
  for (const ex of f.examples) ul.appendChild(el("li", null, ex));
  card.appendChild(ul);

  return card;
}

function buildToc(sorted) {
  const toc = el("nav", "toc");
  toc.appendChild(el("h2", null, "Оглавление"));
  let currentBlock = null, list = null;
  for (const f of sorted) {
    if (f.block !== currentBlock) {
      currentBlock = f.block;
      toc.appendChild(el("h3", null, "Блок " + currentBlock + ". " + BLOCKS[currentBlock]));
      list = el("ol", "toc-list");
      toc.appendChild(list);
    }
    const li = el("li");
    const a = el("a", null, f.name);
    a.href = "#formula-" + f.id;
    li.appendChild(a);
    li.appendChild(el("span", "page-ref", " стр. " + f.page));
    list.appendChild(li);
  }
  return toc;
}

function applySearch(query) {
  const q = query.trim().toLowerCase();
  let visible = 0;
  document.querySelectorAll(".formula-card").forEach(card => {
    const match = !q || card.dataset.name.includes(q);
    card.hidden = !match;
    if (match) visible++;
  });
  // Заголовок блока прячем, если в нём не осталось видимых карточек
  document.querySelectorAll(".block-section").forEach(section => {
    section.hidden = !section.querySelector(".formula-card:not([hidden])");
  });
  document.getElementById("empty-state").hidden = visible > 0;
  document.querySelector(".toc").hidden = !!q;
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("app");
  const sorted = [...FORMULAS].sort((a, b) => a.order - b.order);

  // Поиск
  const searchWrap = el("div", "search-wrap");
  const search = document.createElement("input");
  search.type = "search";
  search.id = "search";
  search.placeholder = "Поиск по названию формулы…";
  search.setAttribute("aria-label", "Поиск по названию формулы");
  search.addEventListener("input", () => applySearch(search.value));
  searchWrap.appendChild(search);
  root.appendChild(searchWrap);

  root.appendChild(buildToc(sorted));

  // Карточки по блокам
  let currentBlock = null, section = null;
  for (const f of sorted) {
    if (f.block !== currentBlock) {
      currentBlock = f.block;
      section = el("section", "block-section");
      section.appendChild(el("h2", "block-title", "Блок " + currentBlock + ". " + BLOCKS[currentBlock]));
      root.appendChild(section);
    }
    section.appendChild(buildCard(f));
  }

  const empty = el("p", null, "Ничего не найдено. Попробуйте другое название.");
  empty.id = "empty-state";
  empty.hidden = true;
  root.appendChild(empty);
});
