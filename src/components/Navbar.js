import React from 'react';
import './Navbar.css';

const Navbar = () => {
    return (
        <>
            <nav className='navbar'>
                <ul>
                    <li class='logo'>
                        Purple <i class="fa-solid fa-seedling"></i>
                    </li>
                    <li class='search'>
                        <form class='search'>    
                            <input type='search' placeholder='Search...' name='search' />
                            <button class='icon' type="submit"><i class="fa fa-search"></i></button>
                        </form>
                    </li>
                </ul>   
            </nav>
        </>
    )
}

export default Navbar