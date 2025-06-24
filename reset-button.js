// Reset button script
document.addEventListener("DOMContentLoaded", function() {
  // Create reset button
  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset Progress";
  resetButton.style.position = "fixed";
  resetButton.style.bottom = "20px";
  resetButton.style.right = "20px";
  resetButton.style.padding = "10px 15px";
  resetButton.style.backgroundColor = "#dc3545";
  resetButton.style.color = "white";
  resetButton.style.border = "none";
  resetButton.style.borderRadius = "4px";
  resetButton.style.cursor = "pointer";
  resetButton.style.zIndex = "9999";
  resetButton.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  resetButton.style.fontSize = "14px";
  
  // Add click event
  resetButton.addEventListener("click", function() {
    if (confirm("Are you sure you want to reset your progress? This cannot be undone.")) {
      localStorage.removeItem("dbTraining_completedModules");
      alert("Progress has been reset successfully!");
      location.reload();
    }
  });
  
  // Add to body
  document.body.appendChild(resetButton);
});
