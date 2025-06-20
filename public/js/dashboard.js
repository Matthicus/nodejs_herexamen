document.addEventListener("DOMContentLoaded", function () {
  const categoryFilter = document.getElementById("categoryFilter");
  const priorityFilter = document.getElementById("priorityFilter");
  const clearFiltersBtn = document.getElementById("clearFilters");

  function updateFilters() {
    const category = categoryFilter.value;
    const priority = priorityFilter.value;

    const params = new URLSearchParams();

    if (category && category !== "all") {
      params.append("category", category);
    }

    if (priority && priority !== "all") {
      params.append("priority", priority);
    }

    const newUrl =
      window.location.pathname +
      (params.toString() ? "?" + params.toString() : "");
    window.location.href = newUrl;
  }

  categoryFilter.addEventListener("change", updateFilters);
  priorityFilter.addEventListener("change", updateFilters);

  clearFiltersBtn.addEventListener("click", function () {
    window.location.href = window.location.pathname;
  });

  const taskRows = document.querySelectorAll(".task-row");
  taskRows.forEach(function (row) {
    row.addEventListener("click", function () {
      row.style.backgroundColor =
        row.style.backgroundColor === "rgb(248, 249, 250)" ? "" : "#f8f9fa";
    });
  });
});
