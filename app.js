// Этап 0: смоук-тест рендера KaTeX — выводим формулы из data/formulas.js
// упрощёнными карточками (название + формула + страница).
// Полные карточки с 7 полями, оглавление и поиск — этап 2 (plan/roadmap.md).

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("app");

  const sorted = [...FORMULAS].sort((a, b) => a.order - b.order);

  for (const f of sorted) {
    const card = document.createElement("article");
    card.className = "formula-card";
    card.id = "formula-" + f.id;

    const title = document.createElement("h3");
    title.textContent = f.order + ". " + f.name + " ";
    const ref = document.createElement("span");
    ref.className = "page-ref";
    ref.textContent = "(" + f.chapter + ", стр. " + f.page + ")";
    title.appendChild(ref);

    const display = document.createElement("div");
    display.className = "formula-display";
    katex.render(f.latex, display, { displayMode: true, throwOnError: false });

    card.appendChild(title);
    card.appendChild(display);
    root.appendChild(card);
  }
});
