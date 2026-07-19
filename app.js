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

const AUTO_LINKS = [
  { id: "unit-step-function", patterns: [/единичн[а-яё-]* ступенчат[а-яё-]* функц[а-яё-]*/giu, /функц[а-яё-]* хевисайд[а-яё-]*/giu] },
  { id: "net-input", patterns: [/чист[а-яё-]* вход[а-яё-]*/giu, /взвешенн[а-яё-]* сумм[а-яё-]*/giu, /скалярн[а-яё-]* произведен[а-яё-]*/giu, /w\^T x/giu] },
  { id: "perceptron-rule", patterns: [/правил[а-яё-]* обучен[а-яё-]* персептрон[а-яё-]*/giu] },
  { id: "sse-cost", patterns: [/функц[а-яё-]* стоимост[а-яё-]* SSE/giu, /сумм[а-яё-]* квадрат[а-яё-]* ошиб[а-яё-]*/giu, /SSE/giu] },
  { id: "batch-gradient-descent", patterns: [/пакетн[а-яё-]* градиентн[а-яё-]* спуск[а-яё-]*/giu, /градиентн[а-яё-]* спуск[а-яё-]*/giu, /градиент[а-яё-]*/giu] },
  { id: "sse-gradient", patterns: [/градиент[а-яё-]* функц[а-яё-]* стоимост[а-яё-]* SSE/giu, /ADALINE/giu] },
  { id: "standardization", patterns: [/стандартизац[а-яё-]*/giu, /стандартн[а-яё-]* отклонен[а-яё-]*/giu] },
  { id: "sgd-update", patterns: [/стохастическ[а-яё-]* градиентн[а-яё-]* спуск[а-яё-]*/giu, /обновлен[а-яё-]* вес[а-яё-]*/giu, /SGD/giu] },
  { id: "adaptive-learning-rate", patterns: [/адаптивн[а-яё-]* темп[а-яё-]* обучен[а-яё-]*/giu] },
  { id: "odds-ratio", patterns: [/отношен[а-яё-]* шанс[а-яё-]*/giu, /шанс[а-яё-]* против/giu, /шанс[а-яё-]*/giu] },
  { id: "logit", patterns: [/логит[а-яё-]*/giu, /logit/giu] },
  { id: "sigmoid", patterns: [/сигмоид[а-яё-]*/giu, /логистическ[а-яё-]* функц[а-яё-]*/giu, /активац[а-яё-]*/giu] },
  { id: "likelihood", patterns: [/функц[а-яё-]* правдоподоб[а-яё-]*/giu, /правдоподоб[а-яё-]*/giu, /формул[аы]\s+7/giu] },
  { id: "log-likelihood", patterns: [/логарифмическ[а-яё-]* правдоподоб[а-яё-]*/giu, /лог-правдоподоб[а-яё-]*/giu, /формул[аы]\s+8/giu] },
  { id: "logistic-cost", patterns: [/логистическ[а-яё-]* функц[а-яё-]* стоимост[а-яё-]*/giu, /log-loss/giu, /перекр[её]стн[а-яё-]* энтроп[а-яё-]*/giu] },
  { id: "sigmoid-derivative", patterns: [/производн[а-яё-]* сигмоид[а-яё-]*/giu, /производн[а-яё-]*/giu] },
  { id: "l2-regularization", patterns: [/L2(?:-| )?регуляризац[а-яё-]*/giu, /L2/giu, /регуляризац[а-яё-]*/giu] },
  { id: "svm-margin", patterns: [/зазор[а-яё-]*/giu, /марж[а-яё-]*/giu] },
  { id: "svm-soft-margin", patterns: [/мягк[а-яё-]* зазор[а-яё-]*/giu] },
  { id: "kernel-trick", patterns: [/ядерн[а-яё-]* трюк[а-яё-]*/giu, /ядерн[а-яё-]*/giu, /ядр[а-яё-]*/giu] },
  { id: "rbf-kernel", patterns: [/RBF/giu, /гауссов[а-яё-]* ядр[а-яё-]*/giu] },
  { id: "information-gain", patterns: [/прирост[а-яё-]* информац[а-яё-]*/giu] },
  { id: "entropy", patterns: [/энтроп[а-яё-]*/giu] },
  { id: "gini-impurity", patterns: [/джини/giu] },
  { id: "classification-error", patterns: [/ошибк[а-яё-]* классификац[а-яё-]*/giu] },
  { id: "minkowski-distance", patterns: [/расстоян[а-яё-]* минковск[а-яё-]*/giu, /Minkowski/giu] },
  { id: "min-max-scaling", patterns: [/минимаксн[а-яё-]* масштабирован[а-яё-]*/giu, /масштабирован[а-яё-]*/giu, /min-?max/giu] },
  { id: "l1-regularization", patterns: [/L1(?:-| )?регуляризац[а-яё-]*/giu, /L1/giu] },
  { id: "covariance", patterns: [/ковариац[а-яё-]*/giu] },
  { id: "eigen-decomposition", patterns: [/собственн[а-яё-]* вектор[а-яё-]*/giu, /собственн[а-яё-]* значен[а-яё-]*/giu, /собственн[а-яё-]* разложен[а-яё-]*/giu, /собственн[а-яё-]*/giu] },
  { id: "explained-variance-ratio", patterns: [/дол[а-яё-]* объясн[её]нн[а-яё-]* дисперс[а-яё-]*/giu] },
  { id: "pca-projection", patterns: [/PCA/giu, /главн[а-яё-]* компонент[а-яё-]*/giu, /компонент[а-яё-]*/giu] },
  { id: "lda-mean-vector", patterns: [/вектор[а-яё-]* средн[а-яё-]*/giu] },
  { id: "lda-within-scatter", patterns: [/внутриклассов[а-яё-]* матриц[а-яё-]* разброс[а-яё-]*/giu] },
  { id: "lda-between-scatter", patterns: [/межклассов[а-яё-]* матриц[а-яё-]* разброс[а-яё-]*/giu, /LDA/giu] },
  { id: "kernel-matrix", patterns: [/матриц[а-яё-]* ядр[а-яё-]*/giu] },
  { id: "polynomial-kernel", patterns: [/полиномиальн[а-яё-]* ядр[а-яё-]*/giu] },
  { id: "sigmoid-kernel", patterns: [/сигмоидн[а-яё-]* ядр[а-яё-]*/giu] },
  { id: "kernel-centering", patterns: [/центрирован[а-яё-]* матриц[а-яё-]* ядр[а-яё-]*/giu] },
  { id: "error-accuracy", patterns: [/верност[а-яё-]*/giu, /accuracy/giu, /ошибк[а-яё-]*/giu] },
  { id: "fpr-tpr", patterns: [/FPR/giu, /TPR/giu, /ложно-?[а-яё-]* положительн[а-яё-]*/giu, /истинно-?[а-яё-]* положительн[а-яё-]*/giu] },
  { id: "precision-recall", patterns: [/точност[а-яё-]*/giu, /полнот[а-яё-]*/giu, /precision/giu, /recall/giu] },
  { id: "f1-score", patterns: [/F1/giu] },
  { id: "majority-voting", patterns: [/мажоритарн[а-яё-]* голосован[а-яё-]*/giu] },
  { id: "ensemble-error", patterns: [/ошибк[а-яё-]* ансамбл[а-яё-]*/giu, /ансамбл[а-яё-]*/giu] },
  { id: "weighted-majority-voting", patterns: [/взвешенн[а-яё-]* мажоритарн[а-яё-]* голосован[а-яё-]*/giu] },
  { id: "probability-voting", patterns: [/голосован[а-яё-]* вероятност[а-яё-]*/giu] },
  { id: "adaboost", patterns: [/AdaBoost/giu] },
  { id: "tf-idf", patterns: [/tf-?idf/giu] },
  { id: "multiple-linear-regression", patterns: [/множественн[а-яё-]* линейн[а-яё-]* регресс[а-яё-]*/giu, /линейн[а-яё-]* регресс[а-яё-]*/giu] },
  { id: "pearson-correlation", patterns: [/корреляц[а-яё-]* пирсон[а-яё-]*/giu] },
  { id: "mse", patterns: [/MSE/giu, /среднеквадратичн[а-яё-]* ошибк[а-яё-]*/giu, /средн[а-яё-]* квадрат[а-яё-]* ошибк[а-яё-]*/giu] },
  { id: "r-squared", patterns: [/R\^2/giu, /коэффициент[а-яё-]* детерминац[а-яё-]*/giu] },
  { id: "ridge-regression", patterns: [/гребнев[а-яё-]* регресс[а-яё-]*/giu, /ridge/giu] },
  { id: "lasso-regression", patterns: [/лассо/giu, /Lasso/giu] },
  { id: "elastic-net", patterns: [/эластичн[а-яё-]* сет[а-яё-]*/giu, /Elastic Net/giu] },
  { id: "polynomial-regression", patterns: [/полиномиальн[а-яё-]* регресс[а-яё-]*/giu] },
  { id: "squared-euclidean-distance", patterns: [/квадратичн[а-яё-]* евклидов[а-яё-]* расстоян[а-яё-]*/giu, /евклидов[а-яё-]*/giu, /расстоян[а-яё-]*/giu] },
  { id: "kmeans-sse", patterns: [/k-?means/giu, /внутрикластерн[а-яё-]* сумм[а-яё-]* квадрат[а-яё-]*/giu] },
  { id: "fcm-objective", patterns: [/неч[её]тк[а-яё-]* c-?means/giu, /неч[её]тк[а-яё-]*/giu] },
  { id: "fcm-membership", patterns: [/степен[а-яё-]* принадлежност[а-яё-]*/giu] },
  { id: "silhouette", patterns: [/силуэтн[а-яё-]* коэффициент[а-яё-]*/giu, /кластер[а-яё-]*/giu] },
  { id: "mlp-hidden-activation", patterns: [/активац[а-яё-]* узл[а-яё-]* скрыт[а-яё-]* сло[а-яё-]*/giu, /нейрон[а-яё-]*/giu] },
  { id: "mlp-forward-propagation", patterns: [/прям[а-яё-]* распространен[а-яё-]*/giu] },
  { id: "mlp-cost", patterns: [/функц[а-яё-]* стоимост[а-яё-]* MLP/giu] },
  { id: "backpropagation", patterns: [/обратн[а-яё-]* распространен[а-яё-]*/giu, /backpropagation/giu, /backprop/giu] },
  { id: "gradient-checking", patterns: [/проверк[а-яё-]* градиент[а-яё-]*/giu] },
  { id: "softmax", patterns: [/softmax/giu, /многоклассов[а-яё-]*/giu] },
  { id: "tanh-activation", patterns: [/tanh/giu, /гиперболическ[а-яё-]* тангенс[а-яё-]*/giu] },
  { id: "log-likelihood-partial-weight", patterns: [/частн[а-яё-]* производн[а-яё-]* логарифмическ[а-яё-]* правдоподоб[а-яё-]* по вес[а-яё-]*/giu] },
  { id: "sigmoid-chain-weight", patterns: [/производн[а-яё-]* сигмоид[а-яё-]* по вес[а-яё-]*/giu] },
  { id: "logistic-gradient", patterns: [/градиент[а-яё-]* логистическ[а-яё-]* регресс[а-яё-]*/giu] }
];

function isLinkBoundary(text, index) {
  if (index <= 0 || index >= text.length) return true;
  return !/[\p{L}\p{N}_]/u.test(text[index]);
}

function makeTextLink(text, formulaId) {
  const anchor = el("a", "internal-link", text);
  anchor.href = "#formula-" + formulaId;
  return anchor;
}

function collectAutoLinks(text, currentFormulaId) {
  const matches = [];
  for (const link of AUTO_LINKS) {
    if (link.id === currentFormulaId) continue;
    for (const pattern of link.patterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(text))) {
        const start = match.index;
        const end = start + match[0].length;
        if (match[0].length && isLinkBoundary(text, start) && isLinkBoundary(text, end)) {
          matches.push({ start, end, id: link.id });
        }
      }
    }
  }
  return matches;
}

function appendLinkedText(parent, text, currentFormulaId, manualLinks = []) {
  const matches = [];
  for (const link of manualLinks) {
    if (!link || !link.text || !link.formulaId || link.formulaId === currentFormulaId) continue;
    let index = text.indexOf(link.text);
    while (index !== -1) {
      matches.push({ start: index, end: index + link.text.length, id: link.formulaId, manual: true });
      index = text.indexOf(link.text, index + link.text.length);
    }
  }
  matches.push(...collectAutoLinks(text, currentFormulaId));
  matches.sort((a, b) => a.start - b.start || Number(b.manual) - Number(a.manual) || (b.end - b.start) - (a.end - a.start));

  let cursor = 0;
  for (const match of matches) {
    if (match.start < cursor) continue;
    if (cursor < match.start) parent.append(document.createTextNode(text.slice(cursor, match.start)));
    parent.appendChild(makeTextLink(text.slice(match.start, match.end), match.id));
    cursor = match.end;
  }
  if (cursor < text.length) parent.append(document.createTextNode(text.slice(cursor)));
}

function linkedEl(tag, className, text, currentFormulaId, manualLinks = []) {
  const node = el(tag, className);
  appendLinkedText(node, text || "", currentFormulaId, manualLinks);
  return node;
}

function linkedComment(step, currentFormulaId) {
  return linkedEl("p", "derivation-comment", step.comment, currentFormulaId, [step.commentLink]);
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
      li.appendChild(linkedComment(step, f.id));
      steps.appendChild(li);
    }
    details.appendChild(steps);
    card.appendChild(details);
  }

  // Разобранный пример — главная поясняющая часть каждой карточки.
  const example = WORKED_EXAMPLES[f.id];
  if (example) {
    const details = document.createElement("details");
    details.className = "worked-example";
    details.appendChild(el("summary", null, "Разобранный пример"));

    const content = el("div", "worked-example-content");
    content.appendChild(el("h5", null, "1. Реальная задача"));
    content.appendChild(linkedEl("p", "worked-example-question", example.question, f.id));

    content.appendChild(el("h5", null, "2. Что нужно найти"));
    content.appendChild(linkedEl("p", null, example.goal || ("Вычислить значение формулы «" + f.name + "» для данных из задачи."), f.id));

    if (example.hint) {
      content.appendChild(linkedEl("p", "worked-example-hint", example.hint, f.id));
    }

    content.appendChild(el("h5", null, "3. Связываем условие с обозначениями"));
    if (example.values && example.values.length) {
      const values = el("dl", "worked-example-values");
      for (const value of example.values) {
        const dt = el("dt");
        tex(dt, value.symbol, false);
        const dd = el("dd");
        dd.appendChild(el("strong", null, value.value + " — "));
        appendLinkedText(dd, value.meaning, f.id);
        values.append(dt, dd);
      }
      content.appendChild(values);
    } else {
      const values = el("dl", "worked-example-values worked-example-values-general");
      for (const param of f.params) {
        const dt = el("dt");
        tex(dt, param.symbol, false);
        values.append(dt, linkedEl("dd", null, param.desc, f.id));
      }
      content.appendChild(values);
    }

    content.appendChild(el("h5", null, "4. Исходная формула"));
    const sourceFormula = el("div", "worked-example-formula");
    tex(sourceFormula, f.latex, true);
    content.appendChild(sourceFormula);

    content.appendChild(el("h5", null, "5. Подставляем и считаем по шагам"));
    if (example.steps && example.steps.length) {
      const steps = el("ol", "worked-example-steps");
      for (const step of example.steps) {
        const li = el("li");
        const calculation = el("div", "worked-example-calculation");
        tex(calculation, step.latex, true);
        li.appendChild(calculation);
        li.appendChild(linkedEl("p", "worked-example-step-comment", step.comment, f.id));
        steps.appendChild(li);
      }
      content.appendChild(steps);
    } else {
      const calculation = el("div", "worked-example-calculation");
      tex(calculation, example.calculation, true);
      content.appendChild(calculation);
    }

    content.appendChild(el("h5", null, "6. Смысл результата"));
    const answer = el("p", "worked-example-answer");
    appendLinkedText(answer, example.answer, f.id);
    content.appendChild(answer);

    content.appendChild(el("h5", null, "7. Где это применяется"));
    content.appendChild(linkedEl("p", "worked-example-application", example.application || f.examples[0], f.id));
    details.appendChild(content);
    card.appendChild(details);
  }

  // Год и автор
  const meta = el("p", "discovered");
  meta.append(el("strong", null, "Кто и когда: "));
  appendLinkedText(meta, f.discovered.who + " — " + f.discovered.year + ".", f.id);
  if (f.discovered.note) {
    meta.append(" ");
    meta.append(linkedEl("span", "note", f.discovered.note + ".", f.id));
  }
  card.appendChild(meta);

  // Параметры
  card.appendChild(el("h4", null, "Параметры"));
  const dl = el("dl", "params");
  for (const p of f.params) {
    const dt = el("dt");
    tex(dt, p.symbol, false);
    const dd = linkedEl("dd", null, p.desc, f.id);
    dl.appendChild(dt);
    dl.appendChild(dd);
  }
  card.appendChild(dl);

  // Что делает
  card.appendChild(el("h4", null, "Что делает"));
  card.appendChild(linkedEl("p", "description", f.description, f.id));

  // Реальные примеры
  card.appendChild(el("h4", null, "Реальные примеры"));
  const ul = el("ul", "examples");
  for (const ex of f.examples) ul.appendChild(linkedEl("li", null, ex, f.id));
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
