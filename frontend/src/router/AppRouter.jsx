import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home.jsx";
import Auth from "../pages/Auth.jsx";

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        {/* <Route path="/Home" element={<Home />} /> */}
      </Routes>
    </Router>
  );
}

export default AppRouter;
