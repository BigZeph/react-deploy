import React from 'react'
import './Contact.css'

const ContactSection = () =>{
    return (
        <>
        <div className="contact">
            <h1>Let us hear from YOU!</h1>
            <h2>Your information</h2>
            <form class="contactform">
                <input type="text" name="name" placeholder="Name" />
                <input type="text" name="email" placeholder="Email" />
                <textarea type="text" name="message" placeholder="Message" />
                <button type="submit">Submit</button>
            </form>
            <p>Whether it'd be questions on functionality, or general feedback, we are here for you.</p>
        </div>
        </>

    )
}

export default ContactSection;
