const currentDisplay = document.getElementById("current");
const previousDisplay = document.getElementById("previous");
const historyList = document.getElementById("history-list");

let current = "0";
let previous = null;
let operator = null;
let resetNext = false;

function updateDisplay() {
  currentDisplay.textContent = current;
}

function addNumber(number) {
  if (resetNext || current === "Error") {
    current = number;
    resetNext = false;
  } else {
    current = current === "0" ? number : current + number;
  }
  updateDisplay();
}

function addDecimal() {
  if (resetNext || current === "Error") {
    current = "0";
    resetNext = false;
  }
  if (!current.includes(".")) current += ".";
  updateDisplay();
}

function getSymbol(op) {
  return ({ "+": "+", "-": "−", "*": "×", "/": "÷" })[op];
}

function chooseOperator(op) {
  if (current === "Error") return;
  if (operator !== null && !resetNext) calculate();
  previous = Number(current);
  operator = op;
  previousDisplay.textContent = `${current} ${getSymbol(op)}`;
  resetNext = true;
}

function calculate() {
  if (operator === null || previous === null) return;

  const first = previous;
  const second = Number(current);
  let result;

  switch (operator) {
    case "+": result = first + second; break;
    case "-": result = first - second; break;
    case "*": result = first * second; break;
    case "/":
      if (second === 0) {
        current = "Error";
        previousDisplay.textContent = "Tidak bisa dibagi 0";
        previous = null;
        operator = null;
        resetNext = true;
        updateDisplay();
        return;
      }
      result = first / second;
      break;
  }

  const expression = `${first} ${getSymbol(operator)} ${second}`;
  result = Number(result.toPrecision(12));
  current = String(result);
  previousDisplay.textContent = `${expression} =`;
  saveHistory(expression, result);

  previous = null;
  operator = null;
  resetNext = true;
  updateDisplay();
}

function percentage() {
  if (current === "Error") return;
  current = String(Number(current) / 100);
  updateDisplay();
}

function clearCalculator() {
  current = "0";
  previous = null;
  operator = null;
  resetNext = false;
  previousDisplay.textContent = "";
  updateDisplay();
}

function deleteNumber() {
  if (resetNext || current === "Error") {
    current = "0";
    resetNext = false;
  } else {
    current = current.length > 1 ? current.slice(0, -1) : "0";
    if (current === "-") current = "0";
  }
  updateDisplay();
}

let history = [];
try {
  history = JSON.parse(localStorage.getItem("calculatorHistory")) || [];
} catch {
  history = [];
}

function saveHistory(expression, result) {
  history.unshift({ expression, result });
  history = history.slice(0, 20);
  localStorage.setItem("calculatorHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  historyList.replaceChildren();

  if (history.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "Belum ada riwayat.";
    historyList.appendChild(empty);
    return;
  }

  history.forEach(item => {
    const li = document.createElement("li");
    const expression = document.createElement("span");
    const result = document.createElement("strong");
    expression.textContent = `${item.expression} =`;
    result.textContent = item.result;
    li.append(expression, result);
    historyList.appendChild(li);
  });
}

document.getElementById("clear-history").addEventListener("click", () => {
  history = [];
  localStorage.removeItem("calculatorHistory");
  renderHistory();
});

document.getElementById("history-jump").addEventListener("click", () => {
  document.getElementById("history").scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll("[data-number]").forEach(button => {
  button.addEventListener("click", () => addNumber(button.dataset.number));
});

document.querySelectorAll("[data-operator]").forEach(button => {
  button.addEventListener("click", () => chooseOperator(button.dataset.operator));
});

document.querySelectorAll("[data-action]").forEach(button => {
  button.addEventListener("click", () => {
    switch (button.dataset.action) {
      case "clear": clearCalculator(); break;
      case "delete": deleteNumber(); break;
      case "percent": percentage(); break;
      case "decimal": addDecimal(); break;
      case "calculate": calculate(); break;
    }
  });
});

document.addEventListener("keydown", event => {
  if (/^[0-9]$/.test(event.key)) addNumber(event.key);
  if (event.key === ".") addDecimal();
  if (["+", "-", "*", "/"].includes(event.key)) chooseOperator(event.key);
  if (event.key === "Enter" || event.key === "=") calculate();
  if (event.key === "Backspace") deleteNumber();
  if (event.key === "Escape") clearCalculator();
  if (event.key === "%") percentage();
});

renderHistory();
updateDisplay();
