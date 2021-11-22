import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import UserState from './myComponents/context/authenticate/userState';
import MssgState from './myComponents/context/message/mssgState';
import ContactsList from './myComponents/Home/Home';
import Messenger from './myComponents/Messsenger/Messenger';
import Navbar from './myComponents/Home/HomeNavbar';
import Login from './myComponents/Login';
import Signup from './myComponents/Signup';
import UserProfile from './myComponents/Home/UserProfile';

console.log(process.env.REACT_APP_HELLO);

function App() {

  const user = localStorage.getItem("user");
  document.body.style.margin = "0";
  document.body.style.padding = "0";

  return (
    <>
      <UserState>
        <MssgState>
          <Router>
            <Switch>
              <Route path="/home/">
                <div>
                  <ContactsList />
                </div>
              </Route>
              <Route path="/profile/">
                <Navbar />
                <UserProfile />
              </Route>
              <Route exact path="/login">
                <Login />
              </Route>
              <Route exact path="/signup">
                <Signup />
              </Route>
              <Route path="/chat/">
                <Messenger />
              </Route>
              <Route exact path="/">
                <Redirect to={ !user? "/login/" : `/home/?user=${user}` } />
              </Route>
            </Switch>
          </Router >
        </MssgState>
      </UserState>
    </>
  );
}

export default App;
