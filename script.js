const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");

// 값 가져오면서 원본 데이터 타입 형태로 전환
const savedWeatherData = JSON.parse(localStorage.getItem("saved-weather"));
const savedTodoList = JSON.parse(localStorage.getItem("saved-items"));

const createTodo = function (storageData) {
  let todoContents = todoInput.value;
  if (storageData) {
    todoContents = storageData.contents;
  }

  // 태그 생성 -> createElement()
  const newLi = document.createElement("li");
  const newSpan = document.createElement("span");
  const newBtn = document.createElement("button");

  newBtn.addEventListener("click", () => {
    // 버튼 클릭하면 <li> 태그에 클래스 지정
    // toggle -> 한 번 누르면 클래스 지정, 다시 누르면 삭제
    newLi.classList.toggle("complete");
    saveItemsFn();
  });

  newLi.addEventListener("dblclick", () => {
    newLi.remove();
    saveItemsFn();
  });

  if (storageData?.complete) {
    newLi.classList.add("complete");
  }

  newSpan.textContent = todoContents;
  newLi.appendChild(newBtn);
  newLi.appendChild(newSpan);
  // console.log(todoList) -> html의 <ul> 태그 출력
  todoList.appendChild(newLi);
  todoInput.value = "";
  saveItemsFn();
};

const keyCodeCheck = function () {
  // 엔터키 눌렀을 때, 출력
  // console.log(window.event.keyCode === 13);
  if (window.event.keyCode === 13 && todoInput.value.trim() !== "") {
    createTodo();
  }
};

const deleteAll = function () {
  const liList = document.querySelectorAll("li");
  for (let i = 0; i < liList.length; i++) {
    liList[i].remove();
  }
  saveItemsFn();
};

const saveItemsFn = function () {
  const saveItems = [];
  // console.log(todoList.children[0].querySelector("span").textContent);
  for (let i = 0; i < todoList.children.length; i++) {
    const todoObj = {
      contents: todoList.children[i].querySelector("span").textContent,
      complete: todoList.children[i].classList.contains("complete"),
    };
    saveItems.push(todoObj);
  }

  //   if (saveItems.length === 0) {
  //     localStorage.removeItem('saved-items');
  //   } else {
  //     localStorage.setItem("saved-items", JSON.stringify(saveItems));
  //   }

  saveItems.length === 0
    ? localStorage.removeItem("saved-items")
    : localStorage.setItem("saved-items", JSON.stringify(saveItems));
};

if (savedTodoList) {
  for (let i = 0; i < savedTodoList.length; i++) {
    createTodo(savedTodoList[i]);
  }
}

const weatherDataActive = function ({ location, weather }) {
  const weatherMainList = [
    "Clear",
    "Clouds",
    "Drizzle",
    "Rain",
    "Snow",
    "ThunderStorm",
  ];
  weather = weatherMainList.includes(weather) ? weather : "Fog";
  const locationNameTag = document.querySelector("#location-name-tag");
  locationNameTag.textContent = location;
  // 백틱 써줘야 함 !!!!!!!
  document.body.style.backgroundImage = `url("./images/${weather}.jpg")`;

  if (
    !savedWeatherData ||
    savedWeatherData.location !== location ||
    savedWeatherData.weather !== weather
  ) {
    localStorage.setItem(
      "saved-weather",
      JSON.stringify({ location, weather })
    );
  }
};

const weatherSearch = function ({ latitude, longitude }) {
  // 프로토콜, 도메인, ?직전까지는 path, ?뒷부분은 파라미터 (요청을 보냈을 때, 필요한 데이터를 담는 공간)
  // https://api.openweathermap.org/data/3.0/weather?lat={lat}&lon={lon}&exclude={part}&appid={66ea5bf7c332d4a8a873119ab2dae163}
  // LAT, LON, APPID 3개의 파라미터
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=66ea5bf7c332d4a8a873119ab2dae163`
  )
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      console.log(json.name, json.weather[0].main);
      const weatherData = {
        location: json.name,
        weather: json.weather[0].main,
      };
      weatherDataActive(weatherData);
    })
    // 요청 보냈을 때, 제대로 수행되지 않았다면 그 원인이 뭔지 확인
    .catch((err) => {
      console.log(err);
    });
};

// position 안에 있는 coords 바로 뽑아올 수 있음
// 원형 : function (position) {} -> ({coords})
const accessToGeo = function ({ coords }) {
  // coords 객체의 latitude, longitude의 값 바로 뽑아와서 각 변수에 저장
  const { latitude, longitude } = coords;
  const positionObj = {
    // 필요한 데이터만 받아와서 객체 생성
    // latitude: position.coords.latitude,
    // longitude: position.coords.longitude,

    // shorthand property : 객체의 키와 값 똑같은 경우, 키 이름만 써주면 됨
    latitude,
    longitude,
  };
  weatherSearch(positionObj);
};

const askForLocation = function () {
  navigator.geolocation.getCurrentPosition(accessToGeo, (err) => {});
};
askForLocation();
