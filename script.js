const taskInput = document.getElementById("taskInput");
const addTask = document.getElementById("addTask");
const taskDeadline = document.getElementById("taskDeadline");
const taskPriority = document.getElementById("taskPriority");
const taskList = document.getElementById("taskList");

const progress = document.getElementById("progress");
const percentage = document.getElementById("percentage");
const progressFill = document.getElementById("progressFill");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const remainingTasks = document.getElementById("remainingTasks");

let tasks = [];
let currentFilter = "all";

try {
    tasks = JSON.parse(localStorage.getItem("tasks")) || [];
} catch (error) {
    tasks = [];
}

// Keep older saved tasks compatible
tasks = tasks.map(task => {
    if (typeof task === "string") {
        return {
            text: task,
            completed: false,
            priority: "medium",
            deadline: ""
        };
    }

    return {
        ...task,
        priority: task.priority || "medium",
        deadline: task.deadline || ""
    };
});

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateProgress() {
    const completed = tasks.filter(task => task.completed).length;
    const total = tasks.length;
    const remaining = total - completed;

    const percent = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    progress.textContent =
        `${completed} of ${total} tasks completed`;

    percentage.textContent = `${percent}%`;
    progressFill.style.width = `${percent}%`;

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    remainingTasks.textContent = remaining;
}

function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
    if (currentFilter === "active" && task.completed) return;
    if (currentFilter === "completed" && !task.completed) return;
        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        const span = document.createElement("span");
        span.textContent = task.text;

        const deadlineLabel = document.createElement("span");
        deadlineLabel.className = "deadline-label";

        if (task.deadline) {
    const date = new Date(task.deadline + "T00:00:00");

    const today = new Date();
    const todayString =
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    if (!task.completed && task.deadline < todayString) {
        deadlineLabel.classList.add("overdue");
        deadlineLabel.textContent = "Overdue: " + formattedDate;
    } else if (!task.completed && task.deadline === todayString) {
        deadlineLabel.classList.add("due-today");
        deadlineLabel.textContent = "Due today";
    } else {
        deadlineLabel.textContent = "Due: " + formattedDate;
    }
} else {
    deadlineLabel.textContent = "No deadline";
}


        const priorityLabel = document.createElement("span");

priorityLabel.className =
    `priority-badge ${task.priority || "medium"}`;

priorityLabel.textContent =
    (task.priority || "medium").toUpperCase();

        if (task.completed) {
            span.style.textDecoration = "line-through";
            span.style.opacity = "0.5";
        }

        checkbox.addEventListener("change", () => {
            tasks[index].completed = checkbox.checked;

            saveTasks();
            renderTasks();
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {
            tasks.splice(index, 1);

            saveTasks();
            renderTasks();
        });

        const editButton = document.createElement("button");
editButton.textContent = "Edit";
editButton.className = "edit-btn";

        editButton.addEventListener("click", () => {
    const newText = prompt("Edit task name:", tasks[index].text);

    if (newText === null || newText.trim() === "") return;

    const newPriority = prompt(
        "Enter priority (high, medium, low):",
        tasks[index].priority
    );

    if (newPriority === null) return;

    const priority = newPriority.toLowerCase().trim();

    if (!["high", "medium", "low"].includes(priority)) {
        alert("Invalid priority!");
        return;
    }

    const newDeadline = prompt(
        "Enter deadline (YYYY-MM-DD), or leave blank:",
        tasks[index].deadline
    );

    if (newDeadline === null) return;

    tasks[index].text = newText.trim();
    tasks[index].priority = priority;
    tasks[index].deadline = newDeadline.trim();

    saveTasks();
    renderTasks();
});

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(priorityLabel);
        li.appendChild(deadlineLabel);
        li.appendChild(editButton);
        li.appendChild(deleteButton);

        taskList.appendChild(li);
    });

    updateProgress();
}

function addNewTask() {
    const task = taskInput.value.trim();

    if (task === "") return;

    tasks.push({
    text: task,
    completed: false,
    priority: taskPriority.value,
    deadline: taskDeadline.value
});

    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskDeadline.value = "";
    taskInput.focus();
}

addTask.addEventListener("click", addNewTask);

taskInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        addNewTask();
    }
});

renderTasks();

const todayDateElement = document.getElementById("todayDate");
const todayDayElement = document.getElementById("todayDay");

const now = new Date();

todayDateElement.textContent =
    now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

todayDayElement.textContent = now.getDate();

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        renderTasks();
    });
});