import Stopwatch from "./stopwatch.js";

const clock = new Stopwatch();

let isGaming = false;
let first = -1;
let second = -1;
let isFlipping = false;
let hoverAmount = 0;
let history = localStorage.history ? JSON.parse(localStorage.history) : [];

async function delay(s) {
  return new Promise((resolve) => setTimeout(resolve, s * 1000));
}

async function start() {
  if (isGaming) return;
  isGaming = true;
  shuffle();
  alert(
    "처음 3초 동안 위치를 최대한 외워 최고기록에 도전해보세요! 확인을 누르면 시작합니다."
  );
  cardData.forEach((card, i) => card.flipBack(i));
  await countdown();
  hoverAmount = 5;
  cardData.forEach((card, i) => card.flipFront(i));
  clock.operate();
}

async function countdown() {
  const el = document.querySelector("#countdown");
  el.style.display = "block";
  const setN = (n) => (el.innerHTML = n);
  setN(3);
  await delay(1);
  setN(2);
  await delay(1);
  setN(1);
  await delay(1);
  el.style.display = "none";
}

function end() {
  isGaming = false;
  hoverAmount = 0;
  clock.operate();
  history.push(clock.cur);
  localStorage.history = JSON.stringify(history);
  setTimeout(() => {
    loadHistory();
    cardData.forEach((card, i) => card.flipFront(i));
    clock.reset();
    if (confirm("게임 끝! 재시작하시려면 확인을 눌러주세요.")) start();
  }, 500);
}

function loadHistory() {
  const historyDom = document.querySelector("#history");
  while (historyDom.firstChild) historyDom.firstChild.remove();

  const historyNs = history
    .slice(0, 25)
    .sort((a, b) => (a > b ? 1 : -1))
    .map((cur, i) => {
      const newP2 = document.createElement("p");
      newP2.textContent = `${i < 9 ? `0${i + 1}` : i + 1} | ${parseTime(
        new Stopwatch(cur).result()
      )}`;
      return newP2;
    });
  historyDom.append(...historyNs);
}

function parseTime([, , s, ms]) {
  return `${s}.${ms}초`;
}

function loop() {
  if (clock.result()[1] === "01") {
    isGaming = false;
    hoverAmount = 0;
    clock.reset();
    cardData.forEach((card, i) => card.flipFront(i));
    alert("1분동안 뭐했냐 ㅋㅋ");
  }
  document.querySelector("#showtime").innerHTML = parseTime(clock.result());
  setTimeout(loop, 10);
}
loop();

function flipAction(n) {
  if (!isGaming) return;
  if (cardData[n].isFlipped || isFlipping) return;
  cardData[n].flipBack(n);

  if (first === -1 && second === -1) first = n;
  else if (first !== -1 && second === -1) second = n;

  cardData[n].isFlipped = true;

  if (first !== -1 && second !== -1) {
    if (cardData[first].name === cardData[second].name) {
      cardData.every(({ isFlipped }) => isFlipped) && end(); // 헿
    } else {
      const f = first;
      const s = second;
      isFlipping = true;
      cardData[first].isFlipped = false;
      cardData[second].isFlipped = false;

      setTimeout(() => {
        isFlipping = false;
        cardData[f].flipFront(f);
        cardData[s].flipFront(s);
      }, 500);
    }
    first = -1;
    second = -1;
  }
}

function getCardEl(n) {
  return document
    .querySelectorAll(".row")
    [parseInt(n / 4)].querySelectorAll(".column")[n % 4];
}

function shuffle() {
  cardData.sort(() => Math.random() - 0.5);
  cardData.forEach(({ img }, i) => {
    getCardEl(i).querySelector(".card-img.back").src = img;
  });
}

class Card {
  constructor(name) {
    this.name = name;
    this.id = null;
    this.isFlipped = false;
  }

  get img() {
    return "./img/" + this.name + ".jpg";
  }

  flipBack(n) {
    const frontEl = getCardEl(n).querySelector(".card-img.front");
    frontEl.style.transform = "rotateY(180deg)";
    const backEl = getCardEl(n).querySelector(".card-img.back");
    backEl.style.transform = "rotateY(0deg)";
    this.isFlipped = true;
  }

  flipFront(n) {
    const frontEl = getCardEl(n).querySelector(".card-img.front");
    frontEl.style.transform = "rotateY(0deg)";
    const backEl = getCardEl(n).querySelector(".card-img.back");
    backEl.style.transform = "rotateY(-180deg)";
    this.isFlipped = false;
  }
}

const cardData = [
  new Card("a"),
  new Card("a"),
  new Card("face"),
  new Card("face"),
  new Card("ice"),
  new Card("ice"),
  new Card("insta"),
  new Card("insta"),
  new Card("one"),
  new Card("one"),
  new Card("penta"),
  new Card("penta"),
  new Card("skku"),
  new Card("skku"),
  new Card("square"),
  new Card("square"),
];

// DOM
document.querySelector("#wrapper").append(
  ...Array(4)
    .fill()
    .map(() => {
      const rowEl = document.createElement("div");
      rowEl.setAttribute("class", "row");
      rowEl.append(
        ...Array(4)
          .fill()
          .map(() => {
            const colEl = document.createElement("div");
            colEl.setAttribute("class", "column");
            return colEl;
          })
      );
      return rowEl;
    })
);

document
  .querySelectorAll(".column")
  .forEach((el, i) => el.addEventListener("click", (e) => flipAction(i)));

document.querySelector("#start").addEventListener("click", start);

document.querySelector("#reset-history").addEventListener("click", () => {
  history = [];
  localStorage.history = "[]";
  loadHistory();
});

cardData.forEach((_, i) => {
  const childs = ["q", "b"].map((a) => {
    const imgEl = document.createElement("img");
    imgEl.className = `card-img ${a === "q" ? "front" : "back"}`;
    imgEl.src = a === "q" ? "./img/q.jpg" : cardData[i].img;
    return imgEl;
  });

  getCardEl(i).append(...childs);
});

document.querySelectorAll(".column").forEach((el, i) => {
  el.addEventListener("mouseover", () => {
    if (cardData[i].isFlipped) return;
    el.style.transform = `scale(1.0${hoverAmount})`;
    el.style.transition = ".1s ease";
  });
});

document.querySelectorAll(".column").forEach((el) => {
  el.addEventListener("mouseout", () => {
    el.style.transform = "scale(1)";
    el.style.transition = ".1s ease";
  });
});

loadHistory();
