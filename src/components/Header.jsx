import { Link } from 'react-router-dom';
import Navigation from './Navigation';

function Header() {
    return (
        <header className="site-header">
            <div className="logo">
                <Link to="/">My React App</Link>
            </div>
            <Navigation />
        </header>
    );
}

export default Header;