import React from 'react';
import {Nav, Bars, NavMenu, NavLink} from './NavbarElements';

const Navbar = () => {
  return (
    <>
      <Nav>
        <NavLink to='/'>
          Purple <i class="fa-solid fa-seedling"></i>  
        </NavLink>
        <Bars />
        <NavMenu>
          <NavLink to='/build' activeStyle>
            Build
          </NavLink>
          <NavLink to='/view' activeStyle>
            View
          </NavLink>
          <NavLink to='/about' activeStyle>
            About
          </NavLink>
          <NavLink to='/contact' activeStyle>
            Contact
          </NavLink>
        </NavMenu>
      </Nav>
    </>
  )
}

export default Navbar