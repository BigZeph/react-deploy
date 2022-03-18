import React from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';

function Home () {
    return(
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh'}}>
            <Link style ={{color: '#000'}} to='/build'>
                <h1>Begin Build</h1>
            </Link>
        </div>
    );
};

export default Home;