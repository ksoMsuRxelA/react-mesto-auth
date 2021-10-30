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
    if(response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  })
  .catch((err) => {
    if(err.status === 400) {
      console.log('400 - Некорректно заполнено одно из полей...');
    }
  });
}

export const authorize = (email, password) => {
  return fetch(`${BASE_URL}/signin`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password })
  })
  .then((response) => {
    if(response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  })
  .catch((err) => {
    if(err.status === 400) {
      console.log("400 - Не передано одно из полей...");
    } else if(err.status === 401) {
      console.log(`401 - Пользователь с идентификатором ${email} не найден...`);
    }
  });
}

export const getContent = (token) => {
  return fetch(`${BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  })
  .then((response) => {
    if(response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  })
  .catch((err) => {
    if(err.status === 400) {
      console.log("400 - Токен не передан или передан не в том формате...");
    } else if(err.status === 401) {
      console.log("401 - Переданный токен некорректен...");
    }
  });
}
