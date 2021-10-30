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
        onClose();
      })
      .catch((err) => {
        console.log(`Ошибка при попытке изменить данные пользователя: ${err}.`);
      })
      .finally(() => {
        submitButtonRef.current.textContent = "Сохранить";
        submitButtonDisabling(submitButtonRef);
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
        submitButtonRef.current.removeAttribute('disabled');
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
        console.log(err.status);
      })
      .finally(() => {
        submitButtonTitleRef.current.textContent = "Зарегистрироваться";
      });
  }

  const handleLogin = (email, password, submitButtonRef) => {
    submitButtonRef.current.firstElementChild.textContent = "Войти...";
    Auth.authorize(email, password)
      .then((data) => {
        if(data) {
          if(data.token) {
            localStorage.setItem('token', data.token);
            Auth.getContent(localStorage.getItem('token'))
              .then((res) => {
                setUserData(res.data);
                setLoggedIn(true);
                history.push('/');
              })
              .catch((err) => {
                console.log(err);
              });
          } 
        } else {
          setFailurePopup(true);
          submitButtonDisabling(submitButtonRef);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        submitButtonRef.current.firstElementChild.textContent = "Войти";
      });
  }

  const tokenCheck = () => {
    const jwtToken = localStorage.getItem('token');

    if(jwtToken) {
      Auth.getContent(jwtToken)
        .then((res) => {
          if(res) {
            setUserData(res.data);
            setLoggedIn(true); 
          }
        })
        .catch((err) => {
          console.log(err);
        })
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setUserData({});
    history.push('/sign-in');
  }

  return (
    <Switch>
      <Route path="/sign-up">
        <div className="wrapper">
          <div className="page page_type_register">
            <Header linkTitle={"Войти"} userData={{}} onSignOut={() => {}} />
            <Register onRegister={handleRegister} />
            <Footer filler="&copy; 2021 Mesto Russia"/>
            <InfoToolTip isRegister={true} tipType={"success"} isOpen={successPopup} onClose={closeAllPopups} />
            <InfoToolTip isRegister={true} tipType={"failure"} isOpen={failurePopup} onClose={closeAllPopups} />
          </div>
        </div>
      </Route>

      <Route path="/sign-in">
        <div className="wrapper">
          <div className="page page_type_login">
            <Header linkTitle={"Регистрация"} userData={{}} onSignOut={() => {}} />
            <Login onLogin={handleLogin} />
            <Footer filler="&copy; 2021 Mesto Russia"/>
            <InfoToolTip isRegister={false} tipType={"failure"} isOpen={failurePopup} onClose={closeAllPopups} />
          </div>
        </div>
      </Route>

      <ProtectedRoute
        path="/"
        loggedIn={loggedIn}
      >
        <CurrentUserContext.Provider value={currentUser}>
          <div className="wrapper">
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
              <Footer filler="&copy; 2021 Mesto Russia" />

              <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser} />

              <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar} />

              <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddCard={handleAddCard} />

              <CardDelete isOpen={isDeleteCardPopupOpen} onClose={closeAllPopups} onCardDelete={handleCardDelete} card={cardForDelete} />

              <ImagePopup 
                onClose={closeAllPopups}
                card={selectedCard}
              />
            </div>
          </div>
        </CurrentUserContext.Provider>
      </ProtectedRoute>
    </Switch>
  );
}

export default App;

