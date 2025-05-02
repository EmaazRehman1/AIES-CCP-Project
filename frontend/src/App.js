import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
function App() {
  const navigate = useNavigate();

  useEffect(()=>{
    navigate('/quiz')
  })
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/quiz" element={<Quiz/>} />

      </Routes>
    </div>
  );
}

export default App;
