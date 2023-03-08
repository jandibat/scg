class Bar {
  constructor(종류, 시작, 끝, 담당자, 색) {
    this.종류 = 종류;
    this.시작 = 시작;
    this.끝 = 끝;
    this.담당자 = 담당자;
    this.색 = 색;
  }
}

const initBarData = [
  new Bar(),
  new Bar("책상정리", 11, 12, "이강훈", "#A8C8F9"),
  new Bar("버그수정", 12, 16, "권민성", "#FFCCCC"),
  new Bar("회의준비", 14, 15, "박민지", "#B8F3B8"),
  new Bar("실습준비", 12, 14, "한태혁", "#FFDDA6"),
  new Bar("학습준비", 16, 17, "고현수", "#CCD1FF"),
  new Bar("리액트 개발 강의 구매 요청", 13, 14, "홍길동", "#ccccdd"),
];

function generate() {
  document.querySelector("table").innerHTML = initBarData
    .map(({ 종류, 시작, 끝, 담당자, 색 }) => {
      if (시작 > 끝) return;
      if (!종류) {
        return `<tr>${Array(8)
          .fill("3/1")
          .map((a, i) => `<th>${(i !== 0 && a + i) || ""}</th>`)
          .join("")}</tr>`;
      }

      const td = `<td></td>`;
      let content = `
      <td class="종류">${종류}</td>
      ${td.repeat(시작 - 11)}
      <td class="bar" onclick="window.open('https://naver.com')" colspan="${
        끝 - 시작 + 1
      }", style="background-color: ${색}">${담당자}</td>
    `;
      content += td.repeat(17 - 끝);
      return `<tr>${content}</tr>`;
    })
    .join("");
}

generate();

document.querySelector("#submit").addEventListener("click", (e) => {
  const 과목명 = document.querySelector("#과목명").value;
  const 담당자명 = document.querySelector("#담당자명").value;
  const 시작 = document.querySelector("#시작").value;
  const 끝 = document.querySelector("#끝").value;

  if (!과목명 || !담당자명) return;

  initBarData.push(
    new Bar(
      과목명,
      Number(시작.slice(-2)),
      Number(끝.slice(-2)),
      담당자명,
      "#e5e5e5"
    )
  );

  generate();
});
