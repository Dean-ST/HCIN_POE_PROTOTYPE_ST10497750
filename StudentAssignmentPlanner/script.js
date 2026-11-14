// ========================================
// STUDENT ASSIGNMENT PLANNER
// ========================================

// 1. GET HTML ELEMENTS

const assignmentForm = document.getElementById("assignmentForm");
const assignmentList = document.getElementById("assignmentList");

const totalAssignments = document.getElementById("totalAssignments");
const pendingAssignments = document.getElementById("pendingAssignments");
const completedAssignments = document.getElementById("completedAssignments");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

const notification = document.getElementById("notification");

const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEdit");

const currentDate = document.getElementById("currentDate");

// 2. LOAD ASSIGNMENTS

let assignments = [];

try {
  assignments = JSON.parse(localStorage.getItem("assignments")) || [];
} catch (error) {
  assignments = [];
}

let editingId = null;

// 3. DISPLAY CURRENT DATE

currentDate.textContent = new Date().toLocaleDateString("en-ZA", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

// 4. SAVE ASSIGNMENTS

function saveAssignments() {
  localStorage.setItem("assignments", JSON.stringify(assignments));
}

// 5. DISPLAY NOTIFICATIONS

function showNotification(message) {
  notification.textContent = message;

  notification.classList.add("show");

  setTimeout(function () {
    notification.classList.remove("show");
  }, 3000);
}

// 6. UPDATE DASHBOARD STATISTICS

function updateStatistics() {
  const total = assignments.length;

  const completed = assignments.filter(function (assignment) {
    return assignment.status === "Completed";
  }).length;

  const pending = total - completed;

  totalAssignments.textContent = total;
  pendingAssignments.textContent = pending;
  completedAssignments.textContent = completed;
}

// 7. CREATE HTML ELEMENTS SAFELY

function createTextElement(tag, text, className) {
  const element = document.createElement(tag);

  element.textContent = text;

  if (className) {
    element.className = className;
  }

  return element;
}

// 8. DISPLAY ASSIGNMENTS

function displayAssignments() {
  assignmentList.innerHTML = "";

  const searchTerm = searchInput.value.toLowerCase();

  const selectedStatus = statusFilter.value;

  const filteredAssignments = assignments.filter(function (assignment) {
    const matchesSearch =
      assignment.name.toLowerCase().includes(searchTerm) ||
      assignment.module.toLowerCase().includes(searchTerm);

    const matchesStatus =
      selectedStatus === "All" || assignment.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  if (filteredAssignments.length === 0) {
    const emptyMessage = createTextElement(
      "p",
      "No assignments found. Add an assignment or change your search.",
      "empty-message",
    );

    assignmentList.appendChild(emptyMessage);

    updateStatistics();

    return;
  }

  filteredAssignments.forEach(function (assignment) {
    // CREATE ASSIGNMENT CARD

    const card = document.createElement("div");

    card.className = "assignment-card";

    // ASSIGNMENT INFORMATION

    const info = document.createElement("div");

    info.className = "assignment-info";

    const name = createTextElement("h3", assignment.name);

    const module = createTextElement("p", "Module: " + assignment.module);

    const dueDate = createTextElement(
      "p",
      "Due Date: " +
        new Date(assignment.dueDate + "T00:00:00").toLocaleDateString("en-ZA"),
    );

    const workload = createTextElement(
      "p",
      "Estimated Workload: " + assignment.workload + " hours",
    );

    // BADGES

    const badges = document.createElement("div");

    badges.className = "assignment-badges";

    const priorityBadge = createTextElement(
      "span",
      assignment.priority + " Priority",
      "badge priority-" + assignment.priority.toLowerCase(),
    );

    const statusBadge = createTextElement(
      "span",
      assignment.status,
      "badge status-badge",
    );

    badges.appendChild(priorityBadge);

    badges.appendChild(statusBadge);

    // ADD INFORMATION TO CARD

    info.appendChild(name);

    info.appendChild(module);

    info.appendChild(dueDate);

    info.appendChild(workload);

    info.appendChild(badges);

    // ACTION BUTTONS

    const actions = document.createElement("div");

    actions.className = "assignment-actions";

    const editButton = createButton("Edit", "edit", assignment.id);

    const statusButton = createButton("Change Status", "status", assignment.id);

    const deleteButton = createButton(
      "Delete",
      "delete",
      assignment.id,
      "delete-button",
    );

    actions.appendChild(editButton);

    actions.appendChild(statusButton);

    actions.appendChild(deleteButton);

    // COMPLETE CARD

    card.appendChild(info);

    card.appendChild(actions);

    assignmentList.appendChild(card);
  });

  updateStatistics();
}

// 9. CREATE BUTTONS

function createButton(text, action, id, className) {
  const button = document.createElement("button");

  button.type = "button";

  button.textContent = text;

  button.dataset.action = action;

  button.dataset.id = id;

  if (className) {
    button.className = className;
  }

  return button;
}

// 10. ADD OR UPDATE ASSIGNMENTS

assignmentForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("assignmentName").value.trim();

  const module = document.getElementById("moduleName").value.trim();

  const dueDate = document.getElementById("dueDate").value;

  const priority = document.getElementById("priority").value;

  const status = document.getElementById("status").value;

  const workload = Number(document.getElementById("workload").value);

  // VALIDATION

  if (
    !name ||
    !module ||
    !dueDate ||
    !Number.isInteger(workload) ||
    workload < 1
  ) {
    showNotification("Please enter valid assignment details.");

    return;
  }

  // CHECK DEADLINE

  const today = new Date();

  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  if (dueDate < localToday) {
    showNotification("Please select today or a future due date.");

    return;
  }

  // UPDATE EXISTING ASSIGNMENT

  if (editingId !== null) {
    const assignment = assignments.find(function (item) {
      return item.id === editingId;
    });

    if (!assignment) {
      showNotification("Assignment could not be found.");

      return;
    }

    assignment.name = name;
    assignment.module = module;
    assignment.dueDate = dueDate;
    assignment.priority = priority;
    assignment.status = status;
    assignment.workload = workload;

    showNotification("Assignment updated successfully!");

    editingId = null;

    submitButton.textContent = "Add Assignment";

    cancelEditButton.hidden = true;
  }

  // ADD NEW ASSIGNMENT
  else {
    const newAssignment = {
      id: Date.now(),

      name: name,

      module: module,

      dueDate: dueDate,

      priority: priority,

      status: status,

      workload: workload,
    };

    assignments.push(newAssignment);

    showNotification("Assignment added successfully!");
  }

  saveAssignments();

  displayAssignments();

  assignmentForm.reset();

  document.getElementById("priority").value = "Medium";

  document.getElementById("status").value = "Not Started";
});

// 11. EDIT ASSIGNMENT

function editAssignment(id) {
  const assignment = assignments.find(function (item) {
    return item.id === id;
  });

  if (!assignment) return;

  document.getElementById("assignmentName").value = assignment.name;

  document.getElementById("moduleName").value = assignment.module;

  document.getElementById("dueDate").value = assignment.dueDate;

  document.getElementById("priority").value = assignment.priority;

  document.getElementById("status").value = assignment.status;

  document.getElementById("workload").value = assignment.workload;

  editingId = id;

  submitButton.textContent = "Update Assignment";

  cancelEditButton.hidden = false;

  document.getElementById("add-assignment").scrollIntoView({
    behavior: "smooth",
  });
}

// 12. DELETE ASSIGNMENT

function deleteAssignment(id) {
  const confirmed = confirm("Are you sure you want to delete this assignment?");

  if (!confirmed) return;

  assignments = assignments.filter(function (assignment) {
    return assignment.id !== id;
  });

  if (editingId === id) {
    cancelEditing();
  }

  saveAssignments();

  displayAssignments();

  showNotification("Assignment deleted successfully!");
}

// 13. CHANGE ASSIGNMENT STATUS

function changeStatus(id) {
  const assignment = assignments.find(function (item) {
    return item.id === id;
  });

  if (!assignment) return;

  const statuses = ["Not Started", "In Progress", "Completed"];

  const currentIndex = statuses.indexOf(assignment.status);

  const nextIndex = (currentIndex + 1) % statuses.length;

  assignment.status = statuses[nextIndex];

  saveAssignments();

  displayAssignments();

  showNotification("Assignment status updated!");
}

// 14. HANDLE BUTTON CLICKS

assignmentList.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const id = Number(button.dataset.id);

  const action = button.dataset.action;

  if (action === "edit") {
    editAssignment(id);
  } else if (action === "delete") {
    deleteAssignment(id);
  } else if (action === "status") {
    changeStatus(id);
  }
});

// 15. CANCEL EDITING

function cancelEditing() {
  editingId = null;

  assignmentForm.reset();

  document.getElementById("priority").value = "Medium";

  document.getElementById("status").value = "Not Started";

  submitButton.textContent = "Add Assignment";

  cancelEditButton.hidden = true;
}

cancelEditButton.addEventListener("click", cancelEditing);

// 16. SEARCH

searchInput.addEventListener("input", displayAssignments);

// 17. FILTER

statusFilter.addEventListener("change", displayAssignments);

// 18. START APPLICATION

displayAssignments();

showNotification("Welcome to your Student Assignment Planner!");
