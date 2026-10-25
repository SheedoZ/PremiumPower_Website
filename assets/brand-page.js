(function () {
  "use strict";
  const ar = document.documentElement.lang === "ar";
  const say = (en, arabic) => (ar ? arabic : en);
  const byId = (id) => document.getElementById(id);
  const rows = Array.from(document.querySelectorAll("#model-table tbody tr"));
  const catalogue = new Map(
    rows.map((row) => [row.dataset.model, row.dataset]),
  );
  const selected = new Set();
  const brand = document.body.dataset.brand;
  const enquiry = window.PremiumPowerEnquiry;
  const fields = ["model-search", "rating", "min-kva", "max-kva", "model-sort"];
  function filter() {
    const search = byId("model-search").value.trim().toLowerCase();
    const rating = byId("rating").value;
    const min =
      byId("min-kva").value === "" ? 0 : Number(byId("min-kva").value);
    const max =
      byId("max-kva").value === "" ? Infinity : Number(byId("max-kva").value);
    const minValid = min >= 0;
    const maxValid = max >= 0 && (!minValid || max >= min);
    const valid = minValid && maxValid;
    byId("min-kva").setAttribute("aria-invalid", String(!minValid));
    byId("max-kva").setAttribute("aria-invalid", String(!maxValid));
    let count = 0;
    rows
      .sort(
        (a, b) =>
          (Number(a.dataset[rating]) - Number(b.dataset[rating])) *
          (byId("model-sort").value === "desc" ? -1 : 1),
      )
      .forEach((row) => {
        const d = row.dataset;
        row.hidden = !(
          valid &&
          Number(d[rating]) >= min &&
          Number(d[rating]) <= max &&
          (d.model + " " + d.engine).toLowerCase().includes(search)
        );
        if (!row.hidden) count++;
        row.parentElement.appendChild(row);
      });
    byId("result-count").textContent = valid
      ? say(
          `${count} of ${rows.length} models · Quote rating: ${rating === "prime" ? "Prime" : "Standby"}`,
          `${count} من ${rows.length} موديل · قدرة طلب السعر: ${rating === "prime" ? "Prime" : "Standby"}`,
        )
      : say("Enter a valid capacity range.", "أدخل نطاق قدرة صحيحاً.");
    byId("no-results").hidden = count > 0 || !valid;
  }
  function quote(model) {
    const data = catalogue.get(model);
    if (!enquiry.open("sales")) return;
    const rating = byId("rating").value;
    enquiry.setProduct(
      data
        ? {
            brand,
            model: data.model,
            capacity: data[rating],
            rating: rating === "prime" ? "Prime" : "Standby",
          }
        : { brand },
    );
  }
  function updateComparison() {
    document.querySelectorAll(".compare-check").forEach((box) => {
      box.checked = selected.has(box.value);
      box.disabled = selected.size >= 3 && !box.checked;
    });
    byId("comparison").hidden = selected.size === 0;
    byId("compare-status").textContent = say(
      `${selected.size}/3 selected. Comparison includes all selected models, including any hidden by filters.`,
      `${selected.size}/3 موديلات مختارة. المقارنة تشمل الاختيارات حتى لو أخفتها الفلاتر.`,
    );
    const parent = byId("compare-cards");
    parent.replaceChildren();
    for (const model of selected) {
      const d = catalogue.get(model),
        card = document.createElement("article"),
        title = document.createElement("h3");
      title.textContent = model;
      card.append(title);
      for (const text of [
        say("Engine: ", "المحرك: ") + d.engine,
        say("Alternator: ", "الألترنيتور: ") + d.alt,
        `Prime: ${d.prime} kVA`,
        `Standby: ${d.standby} kVA`,
      ]) {
        const p = document.createElement("p");
        p.textContent = text;
        card.append(p);
      }
      const request = document.createElement("button");
      request.type = "button";
      request.className = "btn solid";
      request.textContent = say("Request quote", "اطلب عرض سعر");
      request.addEventListener("click", () => quote(model));
      card.append(request);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "btn ghost";
      remove.textContent = say("Remove", "إزالة");
      remove.setAttribute("aria-label", say("Remove ", "إزالة ") + model);
      remove.addEventListener("click", () => {
        selected.delete(model);
        updateComparison();
        const next =
          byId("compare-cards").querySelector("button") ||
          document.querySelector(".compare-check");
        next.focus();
      });
      card.append(remove);
      parent.append(card);
    }
  }
  document
    .querySelectorAll("[data-quote]")
    .forEach((button) =>
      button.addEventListener("click", () => quote(button.dataset.quote)),
    );
  document.querySelectorAll("[data-general-quote]").forEach((link) =>
    link.addEventListener("click", (event) => {
      event.preventDefault();
      quote();
    }),
  );
  document.querySelectorAll(".compare-check").forEach((box) =>
    box.addEventListener("change", () => {
      if (box.checked && selected.size < 3) selected.add(box.value);
      else selected.delete(box.value);
      updateComparison();
    }),
  );
  fields.forEach((id) => byId(id).addEventListener("input", filter));
  byId("reset-filters").addEventListener("click", () => {
    byId("model-search").value = "";
    byId("min-kva").value = "";
    byId("max-kva").value = "";
    byId("rating").value = "prime";
    byId("model-sort").value = "asc";
    filter();
  });
  byId("clear-compare").addEventListener("click", () => {
    selected.clear();
    updateComparison();
    document.querySelector(".compare-check").focus();
  });
  byId("model-tools").hidden = false;
  enquiry.setProduct({ brand });
  const mobileQuote = byId('mobile-quote');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { mobileQuote.hidden = entries[0].isIntersecting; }).observe(byId('contact'));
  }
  byId('contact-form').addEventListener('focusin', () => { mobileQuote.hidden = true; });
  filter();
})();
