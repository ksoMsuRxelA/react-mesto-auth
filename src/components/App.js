import { useState, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
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

  return (
    <Switch>
      <Route path="/signin">
        <div className="wrapper">
          <div className="page page_type_register">
            <Header linkTitle={"Регистрация"} email={""}/>
            <Login />
            <Footer filler="&copy; 2021 Mesto Russia"/>
            <InfoToolTip />
          </div>
        </div>
      </Route>

      <Route path="/signup">
      <div className="wrapper">
          <div className="page page_type_login">
            <Header linkTitle={"Войти"} email={""}/>
            <Register />
            <Footer filler="&copy; 2021 Mesto Russia"/>
          </div>
        </div>
      </Route>

      <ProtectedRoute
        path="*"
        loggedIn={loggedIn}
      >
        <CurrentUserContext.Provider value={currentUser}>
          <div className="wrapper">
            <div className="page">
              <Header linkTitle={"Выйти"} email={"email@mail.com"}/>
              <Main 
                onEditAvatar={openEditAvatarPopup} 
                onEditProfile={openEditProfilePopup}
                onAddPlace={openAddPlacePopup}
                onDeleteCard={openCardDeletePopup}
                handleCardClick={setSelectedCard}
                cards={cards}
                onCardLike={handleCardLike}
                // onCardDelete={handleCardDelete}
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
