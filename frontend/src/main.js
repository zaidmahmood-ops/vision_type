import './style.css'
import * as typingTestView from './views/typingTest.js';
import {navigateTo, initNavigation} from './navigation.js';


document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    console.log("VisionType SPA initialized.");
})


navigateTo('typing');   