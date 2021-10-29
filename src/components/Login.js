const Login = (props) => {
  return (
    <section className="popup popup_type_login popup_opened">
      <div className="popup__container popup__container_theme_black">
        <form className="popup__edit-form" name="personal_info" noValidate>
          <h2 className="popup__title popup__title_theme_black">Вход</h2>
          <fieldset className="popup__info">
            <input id="name-input" type="email" placeholder="Email" className="popup__input popup__input_theme_black popup__input-name" name="email" />
            {/* <span className="popup__error-element name-input-error"></span> */}
            <input id="role-input" type="password" placeholder="Пароль" className="popup__input popup__input_theme_black popup__input-role" name="password" required />
            {/* <span className="popup__error-element role-input-error"></span> */}
            <button type="submit" aria-label="Кнопка Сохранить" className="popup__save-button popup__save-button_theme_white" disabled><span className="popup__save-button-title">Войти</span></button>
          </fieldset>
        </form>
      </div>
    </section>
  );
}

export default Login;