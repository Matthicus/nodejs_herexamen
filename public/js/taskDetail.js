document.addEventListener("DOMContentLoaded", function () {
  const editBtn = document.getElementById("editBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const editForm = document.getElementById("editForm");
  const taskInfo = document.querySelector(".task-info");

  if (editBtn) {
    editBtn.addEventListener("click", function () {
      editForm.style.display = "block";
      editBtn.style.display = "none";

      window.scrollTo({
        top: editForm.offsetTop - 20,
        behavior: "smooth",
      });
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      editForm.style.display = "none";
      editBtn.style.display = "inline-block";
    });
  }

  const form = document.querySelector("#editForm form");
  if (form) {
    form.addEventListener("submit", function (e) {
      const title = document.getElementById("title").value.trim();
      const description = document.getElementById("description").value.trim();
      const category = document.getElementById("category").value.trim();

      if (!title || !description || !category) {
        e.preventDefault();
        alert("Please fill in all required fields");
        return;
      }

      if (title.length > 200) {
        e.preventDefault();
        alert("Title must be 200 characters or less");
        return;
      }

      if (description.length > 1000) {
        e.preventDefault();
        alert("Description must be 1000 characters or less");
        return;
      }

      if (category.length > 100) {
        e.preventDefault();
        alert("Category must be 100 characters or less");
        return;
      }
    });
  }
});
