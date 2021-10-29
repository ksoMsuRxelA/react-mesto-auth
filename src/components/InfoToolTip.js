import success from "../images/success.svg";
import fail from "../images/fail.svg";

const InfoToolTip = (props) => {  
  return (
    <section className="popup popup_type_info-tool-tip">
      <div className="popup__container">
        <form className="popup__edit-form" name="personal_info" noValidate>
          <div className="popup__sign" style={{backgroundImage: `url(${success})`}}></div>
          <h2 className="popup__title popup__title_type_info-tool-tip">Вы успешно зарегистрировались!</h2>
          <button type="button" aria-label="Закрыть всплывающее окно" className="popup__close-button"></button>
        </form>
      </div>
    </section>
  );
}

export default InfoToolTip;