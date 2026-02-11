function addFiles() {
  const input = document.getElementById("cv");
  const list = document.querySelector(".form__resume-list");
  const info = document.querySelector(".form__resume-info");

  let storedFiles = [];
  const MAX_SIZE = 20 * 1024 * 1024; // 20 МБ

  function updateFileList() {
    list.innerHTML = "";
    storedFiles.forEach((file, index) => {
      const li = document.createElement("li");
      li.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "✖";
      removeBtn.classList.add("form__resume-remove");
      removeBtn.addEventListener("click", () => {
        storedFiles.splice(index, 1);
        syncInputFiles();
        updateFileList();
      });

      li.appendChild(removeBtn);
      list.appendChild(li);
    });

    const totalSize = storedFiles.reduce((sum, f) => sum + f.size, 0);
    info.textContent = `${(totalSize / 1024 / 1024).toFixed(2)} MB / 20 MB`;
    info.style.color = totalSize > MAX_SIZE ? "red" : "#333";
  }

  function syncInputFiles() {
    const dt = new DataTransfer();
    storedFiles.forEach((f) => dt.items.add(f));
    input.files = dt.files;
  }

  input.addEventListener("change", () => {
    if (input.files.length > 0) {
      Array.from(input.files).forEach((file) => {
        const exists = storedFiles.some(
          (f) => f.name === file.name && f.size === file.size
        );
        if (!exists) {
          storedFiles.push(file);
        }
      });

      const totalSize = storedFiles.reduce((sum, f) => sum + f.size, 0);
      if (totalSize > MAX_SIZE) {
        alert("More than 20 MB! Please remove some files.");
        // убираем лишние файлы до тех пор, пока не уложимся в лимит
        while (storedFiles.reduce((sum, f) => sum + f.size, 0) > MAX_SIZE) {
          storedFiles.pop();
        }
      }

      syncInputFiles();
      updateFileList();
    }

    // сбрасываем input, чтобы можно было выбрать те же файлы после удаления
    input.value = "";
  });
}

export default addFiles;
