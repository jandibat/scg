/*
요구사항 외에 추가한 기능들
===============================
1 hover 시 이미지 확대
1-1 단 뒤집힌 카드는 확대 안 됨
1-2 게임 중이 아닐 때도 확대 안 됨
2 게임 기록 측정
3 기록의 순위가 저장되어 과거 기록과 비교가능
3 - 1 기록 초기화 가능
3 - 2 localStorage로 어거지로 서버의기능을 구현(한 듯?)
4 처음 3초 동안 카운트다운이 됨
5 뒤집는 애니메이션 추가
*/

// 대충 모듈이나 변수 선언하는 곳
import Stopwatch from "./stopwatch.js";

const clock = new Stopwatch();

let isGaming = false;
let first = -1;
let second = -1;
let isFlipping = false;
let hoverAmount = 0;
let history = localStorage.history ? JSON.parse(localStorage.history) : [];

// 함수들 선언

// async 작업이 여러개가 아니여서 효율성이 발현되지는 않지만 뭐...
async function delay(s) {
  return new Promise((resolve) => setTimeout(resolve, s * 1000));
}

// 시작버튼 클릭하면 실행
async function start() {
  if (isGaming) return;
  isGaming = true;
  shuffle();
  alert(
    "처음 3초 동안 위치를 최대한 외워 최고기록에 도전해보세요! 확인을 누르면 시작합니다."
  );
  cardData.forEach((card, i) => card.flipBack(i));

  // 한 번 묶어보고 싶었다
  await (async function countdown() {
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
  })();

  hoverAmount = 5;
  cardData.forEach((card, i) => card.flipFront(i));
  clock.operate();
}

// 게임이 끝난 후 기록과 초기화
async function end() {
  isGaming = false;
  hoverAmount = 0;
  clock.operate();
  history.push(clock.cur);
  localStorage.history = JSON.stringify(history);
  await delay(0.5);
  loadHistory();
  cardData.forEach((card, i) => card.flipFront(i));
  clock.reset();
  confirm("게임 끝! 재시작하시려면 확인을 눌러주세요.") && start(); // 문법 장난 헿
}

// 저장소에 저장된 기록을 페이지에 로드
function loadHistory() {
  const historyDom = document.querySelector("#history");
  historyDom.innerHTML = "";
  // while (historyDom.firstChild) historyDom.firstChild.remove(); => 솔직히 누가 귀찮게 이렇게 함?

  historyDom.append(
    ...history
      .slice(0, 25)
      .sort((a, b) => (a > b ? 1 : -1))
      .map((cur, i) => {
        const newP2 = document.createElement("p");
        newP2.textContent = `${i < 9 ? `0${i + 1}` : i + 1} | ${parseTime(
          new Stopwatch(cur).result()
        )}`;
        return newP2;
      })
  );
}

// stopwatch 모듈의 출력을 화면에 보기 편하게 파싱(이 맞나? ㅋㅋ)
function parseTime([, , s, ms]) {
  return `${s}.${ms}초`;
}

// stopwatch 돌리기 위한 loop(루프 자체를 모듈 static function으로 넣을 걸 그랬나)
(async function loop() {
  if (clock.result()[1] === "01") {
    isGaming = false;
    hoverAmount = 0;
    clock.reset();
    cardData.forEach((card, i) => card.flipFront(i));
    alert("1분동안 뭐했냐 ㅋㅋ");
  }

  document.querySelector("#showtime").innerHTML = parseTime(clock.result());

  await delay(0.01);
  loop();
})();

// 이 프로그램의 핵심. 게임 중 카드를 클릭하면 이루어지는 모든 메커니즘

// 함수 안에서 전역변수를 접근하는 게 맘에 안 들지만 귀찮아요
async function flipAction(n) {
  // 게임 중이 아니라면 동작 안 함
  if (!isGaming) return;

  // 카드가 뒤집혔거나 뒤집히는 중이라면 동작 안 함. 0.5초 딜레이를 위한 장치
  if (cardData[n].isFlipped || isFlipping) return;

  // 위에 통과하면 카드 뒤집기
  cardData[n].flipBack(n);

  // 메커니즘이 첫번째 누르고 두번째 누르면 그 두 개를 비교
  // 따라서 first나 second에다가 현재 카드 번호를 대입
  if (first === -1 && second === -1) first = n;
  else if (first !== -1 && second === -1) second = n;

  // first와 second에 둘 다 값이 있다면 맞는지 확인
  if (first !== -1 && second !== -1) {
    if (cardData[first].name === cardData[second].name) {
      // 대신 두 개를 뒤집는 순간이 모든 카드를 뒤집는 상태를 만든다면 게임 끝
      first = -1;
      second = -1;
      if (cardData.every(({ isFlipped }) => isFlipped)) await end();
    } else {
      // 0.5초 다시 덮는 동안 동작 안 되게
      isFlipping = true;
      await delay(0.5);
      cardData[first].flipFront(first);
      cardData[second].flipFront(second);
      first = -1;
      second = -1;
      isFlipping = false;
    }
  }
}

// 2차원의 카드를 0 ~ 15번호로 Element 가져오기
function getCardEl(n) {
  return document
    .querySelectorAll(".row")
    [parseInt(n / 4)].querySelectorAll(".column")[n % 4];
}

// 게임 시작 전에 카드 섞는 함수
function shuffle() {
  cardData.sort(() => Math.random() - 0.5);
  cardData.forEach(({ img }, i) => {
    getCardEl(i).querySelector(".card-img.back").src = img;
  });
}

// 대망에 카드 class!!
class Card {
  constructor(name) {
    this.name = name;
    this.id = null;
    this.isFlipped = false;
  }

  get img() {
    return "./img/" + this.name + ".jpg";
  }

  // 뒤집는 애니메이션. 카드가 나중에 섞이기 때문에 파라미터 받아야 함

  // 뒷면으로 뒤집고
  flipBack(n) {
    const frontEl = getCardEl(n).querySelector(".card-img.front");
    frontEl.style.transform = "rotateY(180deg)";
    const backEl = getCardEl(n).querySelector(".card-img.back");
    backEl.style.transform = "rotateY(0deg)";
    this.isFlipped = true;
  }

  // 앞면으로 뒤집고
  flipFront(n) {
    const frontEl = getCardEl(n).querySelector(".card-img.front");
    frontEl.style.transform = "rotateY(0deg)";
    const backEl = getCardEl(n).querySelector(".card-img.back");
    backEl.style.transform = "rotateY(-180deg)";
    this.isFlipped = false;
  }
}

// 초기 카드 세팅 값
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

// HTML JS로 작성

// 그냥 단순히 카드 div Element 만들기
// for을 혐오하는 나..
// 솔직히 setAttribute 누가 씀? ㅋㅋ
document.querySelector("#wrapper").append(
  ...Array(4)
    .fill()
    .map((_, i) => {
      const rowEl = document.createElement("div");
      rowEl.className = "row";
      rowEl.append(
        ...Array(4)
          .fill()
          .map((_, j) => {
            const colEl = document.createElement("div");
            colEl.className = "column";
            // 굳이굳이 bind를 써 본다
            colEl.addEventListener("click", flipAction.bind(null, i * 4 + j));
            return colEl;
          })
      );
      return rowEl;
    })
);

// 시작 버튼 이벤트
document.querySelector("#start").addEventListener("click", start);

// 기록 초기화 이벤트
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

// hover 기능 추가. 뒤집힌 건 작동 안 하게 하려고 js로 구현
document.querySelectorAll(".column").forEach((el, i) => {
  el.addEventListener("mouseover", () => {
    if (!cardData[i].isFlipped) {
      el.style.transform = `scale(1.0${hoverAmount})`;
    }
  });

  el.addEventListener("mouseout", () => {
    el.style.transform = "scale(1)";
  });
});

// 기록 로드하기
loadHistory();
