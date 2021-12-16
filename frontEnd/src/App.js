import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

// Importing contexts
import UserState from './myComponents/context/authenticate/userState';
import MssgState from './myComponents/context/message/mssgState';
import CircleState from './myComponents/context/friendcirle/circleState';

// Importing components
import Home from './myComponents/Home/Home';
import Messenger from './myComponents/Messsenger/Messenger';
import Navbar from './myComponents/Home/HomeNavbar';
import Login from './myComponents/Login';
import Signup from './myComponents/Signup';
import UserProfile from './myComponents/Home/UserProfile';
import Explore from "./myComponents/Home/Explore";
import Requests from "./myComponents/Home/Requests";

function App() {

  const user = localStorage.getItem("user");
  document.body.style.margin = "0";
  document.body.style.padding = "0";

  return (
    <>
      <UserState>
        <MssgState>
          <CircleState>
            <Router>
              <Switch>
                <Route path="/home/">
                  <div>
                    <Home />
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
                  <Redirect to={!user ? "/login/" : `/home/?user=${user}`} />
                </Route>
                <Route path="/explore/">
                  <Explore />
                </Route>
                <Route path="/requests/">
                  <Requests />
                </Route>
              </Switch>
            </Router >
          </CircleState>
        </MssgState>
      </UserState>
    </>
  );
}

export default App;
