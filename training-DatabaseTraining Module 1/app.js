let db;
let currentModule = "welcome";
const modules = [
  "welcome",
  "concepts",
  "setup",
  "data-import",
  "sql-basics",
  "joins",
  "exercises",
  "project",
  "summary"
];
let completedModules = new Set();

document.addEventListener("DOMContentLoaded", async function () {
  await initSqlJsInternal().then((SQL) => {
    db = new SQL.Database();
    initializeDatabase();
  });
  setupEventListeners();
  loadModule("welcome");
  loadProgress();
});

function setupEventListeners() {
  document.querySelectorAll("#sidebar-menu .nav-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const module = this.getAttribute("data-module");
      loadModule(module);
    });
  });

  document.getElementById("next-btn").addEventListener("click", () => {
    const currentIndex = modules.indexOf(currentModule);
    if (currentIndex < modules.length - 1) {
      loadModule(modules[currentIndex + 1]);
    }
  });

  document.getElementById("prev-btn").addEventListener("click", () => {
    const currentIndex = modules.indexOf(currentModule);
    if (currentIndex > 0) {
      loadModule(modules[currentIndex - 1]);
    }
  });

  document.getElementById("run-sql").addEventListener("click", runSqlQuery);
  document.getElementById("clear-results").addEventListener("click", clearSqlResults);
  document.getElementById("reset-db").addEventListener("click", resetDatabase);
}

async function loadModule(moduleName) {
  try {
    currentModule = moduleName;

    document.querySelectorAll("#sidebar-menu .nav-link").forEach((link) =>
      link.classList.remove("active")
    );
    document
      .querySelector(`#sidebar-menu .nav-link[data-module="${moduleName}"]`)
      .classList.add("active");

    const menuText = document.querySelector(
      `#sidebar-menu .nav-link[data-module="${moduleName}"]`
    ).textContent.trim();
    document.getElementById("page-title").textContent = menuText;

    // ✅ Load from root
    const response = await fetch(`${moduleName}.html`);
    if (!response.ok) throw new Error(`Missing: ${moduleName}.html`);

    const content = await response.text();
    document.getElementById("module-content").innerHTML = content;

    const showSql = ["sql-basics", "joins", "exercises", "project"].includes(moduleName);
    document.getElementById("sql-playground").classList.toggle("d-none", !showSql);

    document.querySelectorAll("pre code").forEach((block) => hljs.highlightElement(block));

    const completeBtn = document.getElementById("complete-module-btn");
    if (completeBtn) {
      completeBtn.addEventListener("click", () => markModuleComplete(moduleName));
    }

    updateModuleUI(moduleName);
    updateProgressDisplay();
    updateNavigationButtons();
    window.scrollTo(0, 0);
  } catch (err) {
    console.error("Module load error:", err);
    document.getElementById("module-content").innerHTML = `
      <div class="alert alert-danger">
        <h4>Error</h4>
        <p>${err.message}</p>
      </div>
    `;
  }
}

function markModuleComplete(moduleName) {
  completedModules.add(moduleName);
  saveProgress();
  updateModuleUI(moduleName);
  updateProgressDisplay();
  const currentIndex = modules.indexOf(moduleName);
  if (currentIndex < modules.length - 1) {
    loadModule(modules[currentIndex + 1]);
  }
}

function updateModuleUI(moduleName) {
  const completeBtn = document.getElementById("complete-module-btn");
  if (completeBtn) {
    if (completedModules.has(moduleName)) {
      completeBtn.textContent = "✓ Completed";
      completeBtn.classList.replace("btn-primary", "btn-success");
      completeBtn.disabled = true;
    } else {
      completeBtn.textContent = "Mark as Complete";
      completeBtn.classList.replace("btn-success", "btn-primary");
      completeBtn.disabled = false;
    }
  }

  const menuItem = document.querySelector(`#sidebar-menu .nav-link[data-module="${moduleName}"]`);
  if (completedModules.has(moduleName)) {
    menuItem.innerHTML = menuItem.innerHTML.replace(/^([^<]*)/, "✓ $1");
  } else {
    menuItem.innerHTML = menuItem.innerHTML.replace(/^✓\s*/, "");
  }
}

function updateProgressDisplay() {
  const total = modules.length;
  const completed = completedModules.size;
  const percent = Math.round((completed / total) * 100);
  document.getElementById("progress-text").textContent = `${completed}/${total} completed`;
  const bar = document.querySelector(".progress-bar");
  bar.style.width = `${percent}%`;
  bar.textContent = `${percent}%`;
  bar.setAttribute("aria-valuenow", percent);
}

function updateNavigationButtons() {
  const i = modules.indexOf(currentModule);
  document.getElementById("prev-btn").disabled = i <= 0;
  document.getElementById("next-btn").disabled = i >= modules.length - 1;
}

function saveProgress() {
  localStorage.setItem("dbTraining_completedModules", JSON.stringify([...completedModules]));
}

function loadProgress() {
  const saved = localStorage.getItem("dbTraining_completedModules");
  if (saved) {
    completedModules = new Set(JSON.parse(saved));
    updateProgressDisplay();
    modules.forEach((module) => {
      const item = document.querySelector(`#sidebar-menu .nav-link[data-module="${module}"]`);
      if (completedModules.has(module)) {
        item.innerHTML = item.innerHTML.replace(/^([^<]*)/, "✓ $1");
      } else {
        item.innerHTML = item.innerHTML.replace(/^✓\s*/, "");
      }
    });
  }
}

function runSqlQuery() {
  const q = document.getElementById("sql-query").value.trim();
  if (!q) return;
  try {
    const results = db.exec(q);
    displaySqlResults(results);
  } catch (err) {
    displaySqlError(err);
  }
}

function displaySqlResults(results) {
  const div = document.getElementById("sql-results");
  if (!results || results.length === 0) {
    div.innerHTML = `<div class="alert alert-success">Query executed successfully. No results returned.</div>`;
    return;
  }
  let out = "";
  results.forEach((res) => {
    out += '<table class="table table-bordered"><thead><tr>';
    res.columns.forEach((col) => (out += `<th>${col}</th>`));
    out += "</tr></thead><tbody>";
    res.values.forEach((row) => {
      out += "<tr>";
      row.forEach((cell) => (out += `<td>${cell ?? "NULL"}</td>`));
      out += "</tr>";
    });
    out += "</tbody></table>";
  });
  div.innerHTML = out;
}

function displaySqlError(err) {
  document.getElementById("sql-results").innerHTML = `
    <div class="alert alert-danger">
      <strong>SQL Error:</strong> ${err.message}
    </div>
  `;
}

function clearSqlResults() {
  document.getElementById("sql-results").innerHTML = `
    <div class="text-muted text-center py-5">No results to display. Run a query to see results here.</div>
  `;
  document.getElementById("sql-query").value = "";
}

function resetDatabase() {
  if (confirm("Reset the database to sample data?")) {
    try {
      db.exec("DROP TABLE IF EXISTS deliveries;");
      db.exec("DROP TABLE IF EXISTS sales;");
      db.exec("DROP TABLE IF EXISTS customers;");
      db.exec("DROP TABLE IF EXISTS products;");
      db.exec("DROP TABLE IF EXISTS drivers;");
      initializeDatabase();
      clearSqlResults();
      alert("Database reset.");
    } catch (err) {
      alert("Reset error: " + err.message);
    }
  }
}

// Load SQL.js
async function initSqlJsInternal() {
  return await initSqlJs({
    locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
  });
}
