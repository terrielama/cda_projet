import { BrowserRouter , Routes, Route } from "react-router-dom"
import MainLayout from "./layout/MainLayout.jsx";
import Home from "./components/home/Home.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
        </Route>
      </Routes>
  </BrowserRouter>
  );
};

export default App;
