export const BASE_URL = 'https://auth.nomoreparties.co';

export const register = (email, password) => {
  return fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password })
  })
  .then((response) => {
    if(response.status === 400) {
      return Promise.reject("Некорректно заполнено одно из полей...");
    }
    return response.json();
  })
  .catch((err) => {
    console.log(`Ошибка при создании нового пользователя: ${err}.`);
  })
}

export const authorize = (email, password) => {
  return fetch(`${BASE_URL}/signin`, {
    method: 'POST',
    header: {
      "Content-Type": "application/json",

    },
    body: JSON.stringify({ email, password })
  })
  .then((response) => {
    if(response.status === 400) {
      return Promise.reject("Не передано одно из полей...");
    } else if(response.status === 401) {
      return Promise.reject(`Пользователь с идентификатором ${email} не найден...`);
    }
    return response.json();
  })
  .then((data) => {
    if(data.jwt) {
      localStorage.setItem('jwt', data.jwt);
      return data;
    }
    return Promise.reject("Ошибка при получении пользовательских данных и токена доступа...");
  })
  .catch((err) => {
    console.log(`Ошибка при попытке авторизации: ${err}`);
  })
}

const getContent = (token) => {
  return fetch(`${BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  })
  .then((response) => {
    if(response.status === 400) {
      return Promise.reject("Токен не передан или передан не в том формате...");
    } else if(response.status === 401) {
      return Promise.reject("Переданный токен некорректен...");
    }
    return response.json(); //response.json() is just a data
  })
  .catch((err) => {
    console.log(`Ошибка при попытке проверки токена авторизации: ${err}`);
  })
}
