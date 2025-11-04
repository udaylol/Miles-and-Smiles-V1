import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home.jsx";
import Auth from "../pages/Auth.jsx";
import TicTacToe from "../pages/TicTacToe.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";


function AppRouter() {
  return (
    <Router>
      <Routes>

        <Route 
          path="/" 
          element={<Auth />} 
        />

        <Route
          path="/home"          
          element={<ProtectedRoute><Home /></ProtectedRoute>}
        />

        <Route
          path="/games/tictactoe" element={<TicTacToe />} 
        />
        
      </Routes>
    </Router>
  );
}

export default AppRouter;
