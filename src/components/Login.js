import { useState } from 'react';

const Login = ({ onLogin,  }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleEmailChange(evt) {
    setEmail(evt.target.value);
  }

  function handlePasswordChange(evt) {
    setPassword(evt.target.value);
  }

  function handleSubmit(evt) {
    evt.preventDefault();
    if(!email || !password) {
      return;
    }
    onLogin(email, password);
    setEmail('');
    setPassword('');
  }

  return (
    <section className="popup popup_type_login popup_opened">
      <div className="popup__container popup__container_theme_black">
        <form className="popup__edit-form" name="personal_info" onSubmit={handleSubmit}>
          <h2 className="popup__title popup__title_theme_black">Вход</h2>
          <fieldset className="popup__info">
            <input id="email-input" type="email" value={email} onChange={handleEmailChange} placeholder="Email" className="popup__input popup__input_theme_black popup__input-name" name="email" required/>
            {/* <span className="popup__error-element name-input-error"></span> */}
            <input id="password-input" type="password" value={password} onChange={handlePasswordChange} placeholder="Пароль" className="popup__input popup__input_theme_black popup__input-role" name="password" required />
            {/* <span className="popup__error-element role-input-error"></span> */}
            <button type="submit" aria-label="Кнопка Сохранить" className="popup__save-button popup__save-button_theme_white"><span className="popup__save-button-title">Войти</span></button>
          </fieldset>
        </form>
      </div>
    </section>
  );
}

export default Login;