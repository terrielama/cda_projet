import { BrowserRouter , Routes, Route } from "react-router-dom"
import MainLayout from "./layout/MainLayout.jsx";
import Home from "./components/home/Home.jsx";
import ProductList from "./components/product/ProductList.jsx";
import Cart from "./components/cart/Cart.jsx";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/panier" element={<Cart/>} />
          <Route path="produits/:category" element={<ProductList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// const App = () =>  {
  
  // const[numCartItems,setNuberCartitems] = useState(0);
  // const cart_code = localStorage.getItem("cart_code")

  // useEffect(function(){
  //   if(cart_code){
  //     api.get(`get_cart_stat?cart_code=${cart_code}`)
  //     .then(res => {
  //       console.log(res.data)
  //       setNuberCartitems(res.date.num_of_items)
  //     })

  //     .catch(err => {
  //       console.log(err.message)
  //     })
  //   }

  // },[])