import { useState, useEffect } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import Header from './Header';
import Register from './Register';
import Login from './Login';
import InfoToolTip from './InfoToolTip';
import Main from './Main';
import Footer from './Footer';
import ImagePopup from './ImagePopup';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import CardDelete from './CardDelete';
import { api } from '../utils/Api';
import * as Auth from '../utils/Auth';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import ProtectedRoute from './ProtectedRoute';

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isDeleteCardPopupOpen, setIsDeleteCardPopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [cardForDelete, setCardForDelete] = useState({});
  const [currentUser, setCurrentUser] = useState({name: '', about: '', avatar: '', _id: ''});
  const [isLoading, setIsLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);
  const [failurePopup, setFailurePopup] = useState(false);
  const [userData, setUserData] = useState({});

  const history = useHistory();

  useEffect(() => {
    tokenCheck();
  }, []);

  useEffect(() => {
    if(loggedIn === true) {
      history.push('/');
    }
  }, [loggedIn, history]);

  useEffect(() => {
    api.getUserInfo()
      .then((resCurrentUser) => {
        setCurrentUser({
          name: resCurrentUser.name,
          about: resCurrentUser.about,
          avatar: resCurrentUser.avatar,
          _id: resCurrentUser._id,
        });
      })
      .catch((err) => {
        console.log(`Ошибка при первичном получении данных пользователя: ${err}`);
      }); //тут не нужен finally, так как нет дефолтного поведения при запросе.
  }, []);

  const closeAllPopups = () => {
    setIsEditProfilePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsDeleteCardPopupOpen(false);
    setSelectedCard({});
    setSuccessPopup(false);
    setFailurePopup(false);
  }

   const openEditAvatarPopup = () => {
    setIsEditAvatarPopupOpen(!isEditAvatarPopupOpen);
  }

  const openEditProfilePopup = () => {
    setIsEditProfilePopupOpen(!isEditProfilePopupOpen);
  }

  const openAddPlacePopup = () => {
    setIsAddPlacePopupOpen(!isAddPlacePopupOpen);
  }

  const openCardDeletePopup = () => {
    setIsDeleteCardPopupOpen(!isDeleteCardPopupOpen);
  }

  function submitButtonDisabling(submitButtonRef) {
    submitButtonRef.current.setAttribute('disabled', true);
    submitButtonRef.current.classList.add('popup__save-button_disabled');
  }

  const handleUpdateUser = (newUserInfo, onClose, submitButtonRef) => { //здесь и далее, я получаю методы изнутри компонента, вроде как это не запрещено чек-листом.
    submitButtonRef.current.textContent = "Сохранить..."; //здесь и далее, я использую рефы, которые получаю как аргумент, чтобы создать UX-эффект при загрузке.
    api.patchUserInfo(newUserInfo)
      .then((resUserInfo) => {
        setCurrentUser(resUserInfo);
        submitButtonDisabling(submitButtonRef);
        onClose();
      })
      .catch((err) => {
        console.log(`Ошибка при попытке изменить данные пользователя: ${err}.`);
      })
      .finally(() => {
        submitButtonRef.current.textContent = "Сохранить";
      });
  }

  const handleUpdateAvatar = (newAvatarUrl, onClose, submitButtonRef, inputReset) => {
    submitButtonRef.current.textContent = "Сохранить...";
    api.patchAvatar(newAvatarUrl)
      .then((resAvatarUrl) => {
        setCurrentUser(resAvatarUrl);
        onClose();
        inputReset();
      })
      .catch((err) => {
        console.log(`Ошибка при попытке изменить аватар пользователя: ${err}.`);
      })
      .finally(() => {
        submitButtonRef.current.textContent = "Сохранить";
        submitButtonDisabling(submitButtonRef);
      })
  }

  //here starts cards adding code...
  const [cards, setCards] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    api.getInitialCards()
      .then((resInitialCards) => {
        setCards(resInitialCards);
      })
      .catch((err) => {
        console.log(`Ошибка при первичном получении карточек: ${err}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []); //like componentDidMount - empty array


  function handleCardLike(card) {
    const isLiked = card.likes.some((like) => {
      return like._id === currentUser._id;
    });

    api.changeLikeCardStatus(card._id, isLiked)
      .then((newCard) => {
        setCards((cards) => {
          return cards.map((tmpCard) => {
            return tmpCard._id === card._id ? newCard : tmpCard;
          });
        });
      })
      .catch((err) => {
        console.log(`Ошибка при попытке удалении/установки лайка: ${err}.`);
      }); //здесь не нужен finally, все по той же причине что и выше. 
  }

  function handleCardDelete(card, onClose, submitButtonRef) { //тут "тупанул", полностью согласен с замечанием, благодарю!
    submitButtonRef.current.textContent = "Да...";
    api.deleteOwnerCard(card._id)
      .then(() => {
        setCards(cards.filter((tmpCard) => {
          return tmpCard._id !== card._id; 
        }));
        onClose();
      })
      .catch((err) => {
        console.log(`Ошибка при попытке удаления карточки: ${err}.`);
      })
      .finally(() => {
        submitButtonRef.current.textContent = "Да";
        submitButtonRef.current.removeAttribute('disabled'); //просто в моей логике кнопки формы по умолчанию неактивны, а кнопка удаления карточки должна быть активной. Этому и служат эти две строчки.
        submitButtonRef.current.classList.remove('popup__save-button_disabled');
      });
  }

  const handleAddCard = (newCard, onClose, handleInputsReset, submitButtonRef) => {
    submitButtonRef.current.textContent = "Сохранить...";
    api.postNewCard(newCard)
      .then((resNewCard) => {
        setCards([resNewCard, ...cards]);
        onClose();
        handleInputsReset();
      })
      .catch((err) => {
        console.log(`Ошибка при попытке добавить новую карточку в начало списка: ${err}.`);
      })
      .finally(() => {
        submitButtonRef.current.textContent = "Сохранить";
        submitButtonDisabling(submitButtonRef);
      });
  }

  const handleRegister = (email, password, submitButtonTitleRef) => {
    submitButtonTitleRef.current.textContent = "Зарегистрироваться...";
    Auth.register(email, password)
      .then((res) => {
        if(res) {
          setSuccessPopup(true);
        } else {
          setFailurePopup(true);
        }
      })
      .catch((err) => {
        if(err.status === 400) {
          console.log('400 - Некорректно заполнено одно из полей...');
        }
        setFailurePopup(true);
      })
      .finally(() => {
        submitButtonTitleRef.current.textContent = "Зарегистрироваться";
      });
  }

  const handleLogin = (email, password, submitButtonRef) => { //здесь все исправил...спасибо за замечания. 
    submitButtonRef.current.firstElementChild.textContent = "Войти...";
    Auth.authorize(email, password)
      .then((data) => {
        if(data.token) {
          localStorage.setItem('token', data.token);
          setLoggedIn(true);
          setUserData({email: email, ...userData});
          history.push('/');
          submitButtonRef.current.firstElementChild.textContent = "Войти";
        } else {
          setFailurePopup(true);
        }
      })
      .catch((err) => {
        if(err.status === 400) {
          console.log("400 - Не передано одно из полей...");
        } else if(err.status === 401) {
          console.log(`401 - Пользователь с идентификатором ${email} не найден...`);
        }
      });
  }

  const tokenCheck = () => {
    const jwtToken = localStorage.getItem('token');

    if(jwtToken) { //вы писали про лишнюю проверку токена здесь, я ничего лишнего здесь не нашел. Более того, этот участок кода соответствует тому, что мы проходили в теории.
      Auth.getContent(jwtToken)
        .then((res) => {
          if(res) {
            setUserData(res.data);
            setLoggedIn(true); 
          }
        })
        .catch((err) => {
          if(err.status === 400) {
            console.log("400 - Токен не передан или передан не в том формате...");
          } else if(err.status === 401) {
            console.log("401 - Переданный токен некорректен...");
          }
        });
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setUserData({});
    history.push('/sign-in');
  }

  return (
    <div className="wrapper">
      <Switch>
        <Route path="/sign-up">
          <div className="page page_type_register">
            <Header linkTitle={"Войти"} userData={{}} onSignOut={() => {}} />
            <Register onRegister={handleRegister} />
            <InfoToolTip isRegister={true} tipType={"success"} isOpen={successPopup} onClose={closeAllPopups} />
            <InfoToolTip isRegister={true} tipType={"failure"} isOpen={failurePopup} onClose={closeAllPopups} />
          </div>
        </Route>

        <Route path="/sign-in">
          <div className="page page_type_login">
            <Header linkTitle={"Регистрация"} userData={{}} onSignOut={() => {}} />
            <Login onLogin={handleLogin} />
            <InfoToolTip isRegister={false} tipType={"failure"} isOpen={failurePopup} onClose={closeAllPopups} />
          </div>
        </Route>

        <ProtectedRoute
          path="/"
          loggedIn={loggedIn}
        >
          <CurrentUserContext.Provider value={currentUser}>
            <div className="page">
              <Header linkTitle={""} userData={userData} onSignOut={handleSignOut} />
              <Main 
                onEditAvatar={openEditAvatarPopup} 
                onEditProfile={openEditProfilePopup}
                onAddPlace={openAddPlacePopup}
                onDeleteCard={openCardDeletePopup}
                handleCardClick={setSelectedCard}
                cards={cards}
                onCardLike={handleCardLike}
                isLoading={isLoading}
                onCardDelButtonClick={setCardForDelete}
              />

              <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser} />

              <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar} />

              <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddCard={handleAddCard} />

              <CardDelete isOpen={isDeleteCardPopupOpen} onClose={closeAllPopups} onCardDelete={handleCardDelete} card={cardForDelete} />

              <ImagePopup 
                onClose={closeAllPopups}
                card={selectedCard}
              />
            </div>
          </CurrentUserContext.Provider>
        </ProtectedRoute>
      </Switch>
      <Footer filler="&copy; 2021 Mesto Russia" />
    </div>
  );
}

export default App;

