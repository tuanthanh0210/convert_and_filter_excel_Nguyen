import React, { useState } from 'react';
import ScrollUpIcon from './top.png'
import './scroll-top.css'


const ScrollButton = () => {

    const [showScrollButton, setShowScrollButton] = useState(false);

    const handleClick = () => {
        window.scrollTo(0,0);
    }

    window.onscroll = () => {
        if(window.scrollY > 400) {
            setShowScrollButton(true);
        } else if(window.scrollY < 400) {
            setShowScrollButton(false);
        }
    }

    return (
        <i className='scroll-top-button'>
            {showScrollButton ? <img onClick={handleClick} src={ScrollUpIcon} width={40} alt=""/> : null}
        </i>
    )
};

export default ScrollButton;
