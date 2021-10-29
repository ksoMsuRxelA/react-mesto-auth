import { Route, Redirect } from 'react-router-dom';

const ProtectedRoute = ({ children, ...props }) => {
  return (
    <Route path={props.path}>
      {() => 
        props.loggedIn ? children : <Redirect to="/signin" /> 
      }
    </Route>
  );
};

export default ProtectedRoute;