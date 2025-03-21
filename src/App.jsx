import {Routes, Route, BrowserRouter} from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import NotFound from './pages/NotFound';
import './App.css'


function App() {

    return (
        <BrowserRouter>
            <div className="app-container">
                <Header />
                <main className="content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App
