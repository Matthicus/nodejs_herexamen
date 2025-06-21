document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("createTaskForm");
  const titleInput = document.getElementById("title");
  const descriptionInput = document.getElementById("description");
  const categoryInput = document.getElementById("category");
  const prioritySelect = document.getElementById("priority");
  const dueDateInput = document.getElementById("dueDate");

  if (dueDateInput) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    dueDateInput.min = now.toISOString().slice(0, 16);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      const title = titleInput.value.trim();
      const description = descriptionInput.value.trim();
      const category = categoryInput.value.trim();
      const priority = prioritySelect.value;
      const dueDate = dueDateInput.value;

      [titleInput, descriptionInput, categoryInput, prioritySelect].forEach(
        (input) => {
          input.style.borderColor = "";
        }
      );

      let hasError = false;
      let errorMessage = "";

      if (!title) {
        titleInput.style.borderColor = "#e53e3e";
        errorMessage = "Title is required";
        hasError = true;
      } else if (!description) {
        descriptionInput.style.borderColor = "#e53e3e";
        errorMessage = "Description is required";
        hasError = true;
      } else if (!category) {
        categoryInput.style.borderColor = "#e53e3e";
        errorMessage = "Category is required";
        hasError = true;
      } else if (!priority) {
        prioritySelect.style.borderColor = "#e53e3e";
        errorMessage = "Priority is required";
        hasError = true;
      }

      if (!hasError) {
        if (title.length > 200) {
          titleInput.style.borderColor = "#e53e3e";
          errorMessage = "Title must be 200 characters or less";
          hasError = true;
        } else if (description.length > 1000) {
          descriptionInput.style.borderColor = "#e53e3e";
          errorMessage = "Description must be 1000 characters or less";
          hasError = true;
        } else if (category.length > 100) {
          categoryInput.style.borderColor = "#e53e3e";
          errorMessage = "Category must be 100 characters or less";
          hasError = true;
        }
      }

      if (
        !hasError &&
        !["low", "medium", "high"].includes(priority.toLowerCase())
      ) {
        prioritySelect.style.borderColor = "#e53e3e";
        errorMessage = "Please select a valid priority";
        hasError = true;
      }

      if (!hasError && dueDate) {
        const dueDateObj = new Date(dueDate);
        const now = new Date();

        if (isNaN(dueDateObj.getTime())) {
          dueDateInput.style.borderColor = "#e53e3e";
          errorMessage = "Please enter a valid date and time";
          hasError = true;
        } else if (dueDateObj <= now) {
          dueDateInput.style.borderColor = "#e53e3e";
          errorMessage = "Due date must be in the future";
          hasError = true;
        }
      }

      if (hasError) {
        e.preventDefault();

        let errorDiv = document.querySelector(".client-error-message");
        if (!errorDiv) {
          errorDiv = document.createElement("div");
          errorDiv.className = "error-message client-error-message";
          form.insertBefore(errorDiv, form.firstChild);
        }
        errorDiv.innerHTML = `<strong>Error:</strong> ${errorMessage}`;

        errorDiv.scrollIntoView({ behavior: "smooth", block: "center" });

        return false;
      }

      const clientErrorDiv = document.querySelector(".client-error-message");
      if (clientErrorDiv) {
        clientErrorDiv.remove();
      }

      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Creating Task...";
      }
    });
  }

  if (categoryInput) {
    categoryInput.addEventListener("blur", function () {
      if (this.value) {
        this.value = this.value
          .trim()
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");
      }
    });
  }
});
