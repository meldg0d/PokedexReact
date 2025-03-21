import { NavLink } from 'react-router-dom';

function Navigation() {
    return (
        <nav className="main-nav">
            <ul>
                <li>
                    <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
                        About
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/random-link" className={({ isActive }) => isActive ? 'active' : ''}>
                        Not Found
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
}

export default Navigation;