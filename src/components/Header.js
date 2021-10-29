import { Link } from 'react-router-dom';

const Header = ({ linkTitle, email }) => {
  return (
    <header className="header page__header">
      <a href="#" className="header__logo" target="_self"></a>
      <p className="header__email">{email}</p>
      <Link to="/signup" className="header__link">{linkTitle}</Link>
    </header>
  );
}

export default Header;