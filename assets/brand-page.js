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
  let restoringUrlState = false;

  function readUrlState() {
    let url;
    try {
      url = new URL(window.location.href);
    } catch (_) {
      return;
    }
    const rating = url.searchParams.get("rating");
    byId("rating").value = rating === "standby" ? "standby" : "prime";
    selected.clear();
    const raw = url.searchParams.get("compare") || "";
    for (const model of raw.slice(0, 120).split(",").slice(0, 12)) {
      if (catalogue.has(model) && !selected.has(model) && selected.size < 3) selected.add(model);
    }
  }

  function writeUrlState() {
    if (restoringUrlState || !window.history || typeof window.history.replaceState !== "function") return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("rating", byId("rating").value === "standby" ? "standby" : "prime");
      const models = Array.from(selected).filter((model) => catalogue.has(model)).slice(0, 3);
      if (models.length) url.searchParams.set("compare", models.join(","));
      else url.searchParams.delete("compare");
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    } catch (_) {
      // URL state is an enhancement; filtering and comparison still work if history is unavailable.
    }
  }
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
          `${count} of ${rows.length} models · Quote rating: ${rating === "prime" ? "Prime (PRP)" : "Standby (ESP)"}`,
          `${count} من ${rows.length} موديل · تصنيف القدرة: \u2066${rating === "prime" ? "Prime (PRP)" : "Standby (ESP)"}\u2069`,
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
    const jump = byId("view-comparison");
    jump.hidden = selected.size === 0;
    jump.textContent = say(`View comparison (${selected.size})`, `عرض المقارنة (${selected.size})`);
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
      title.dir = "ltr";
      card.append(title);
      for (const [label, value] of [
        [say("Engine: ", "المحرك: "), d.engine],
        [say("Alternator: ", "الألترنيتور: "), d.alt],
        [say("Prime (PRP): ", "قدرة Prime (PRP): "), `${d.prime} ${say("kVA", "ك.ف.أ")}`],
        [say("Standby (ESP): ", "قدرة Standby (ESP): "), `${d.standby} ${say("kVA", "ك.ف.أ")}`],
      ]) {
        const p = document.createElement("p");
        p.append(document.createTextNode(label));
        if (ar) {
          const bdi = document.createElement("bdi");
          bdi.dir = "ltr";
          bdi.textContent = value;
          p.append(bdi);
        } else {
          p.append(document.createTextNode(value));
        }
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
    writeUrlState();
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
  fields.forEach((id) => {
    byId(id).addEventListener("input", () => {
      filter();
      if (id === "rating") writeUrlState();
    });
    byId(id).addEventListener("change", () => {
      filter();
      if (id === "rating") writeUrlState();
    });
  });
  // A catalogue link must still reach its model when filters hide that row.
  document.querySelectorAll('a[href^="#model-"]').forEach((link) => {
    link.addEventListener("click", () => {
      const row = byId(link.hash.slice(1));
      if (!row || !row.hidden) return;
      for (const id of ["model-search", "min-kva", "max-kva"]) byId(id).value = "";
      filter();
    });
  });
  byId("reset-filters").addEventListener("click", () => {
    byId("model-search").value = "";
    byId("min-kva").value = "";
    byId("max-kva").value = "";
    byId("rating").value = "prime";
    byId("model-sort").value = "asc";
    filter();
    writeUrlState();
  });
  byId("clear-compare").addEventListener("click", () => {
    selected.clear();
    updateComparison();
    document.querySelector(".compare-check").focus();
  });
  byId("model-tools").hidden = false;
  restoringUrlState = true;
  readUrlState();
  restoringUrlState = false;
  updateComparison();
  enquiry.setProduct({ brand });
  const mobileQuote = byId('mobile-quote');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { mobileQuote.hidden = entries[0].isIntersecting; }).observe(byId('contact'));
  }
  byId('contact-form').addEventListener('focusin', () => { mobileQuote.hidden = true; });
  filter();
  window.addEventListener("popstate", () => {
    restoringUrlState = true;
    readUrlState();
    restoringUrlState = false;
    updateComparison();
    filter();
  });
})();
