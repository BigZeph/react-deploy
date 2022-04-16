import React from 'react';
import '../../App.css';
import FormView from '../FormView';

function View () {
    return(
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh'}}>
	    <FormView />
        </div>
    );
};

export default View;
