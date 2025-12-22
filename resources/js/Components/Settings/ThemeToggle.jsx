import { useState } from 'react';
import { Dropdown } from 'react-bootstrap';

export default function ThemeToggle({ type = '' }) {
    const [darkMode, setDarkMode] = useState(document.body.classList.contains('dark-mode'));

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        document.body.classList.toggle('dark-mode', newMode);
        localStorage.setItem('darkMode', newMode);
    };

    return type === 'dropdown' ? (
        <Dropdown.Item onClick={toggleTheme}>
            <i className={`bi ${darkMode ? 'bi-sun' : 'bi-moon'}`}></i>{' '}
            {darkMode ? 'Turn on the Lights' : 'Turn off the Lights'}
        </Dropdown.Item>
    ) : (
        <a href="#" onClick={toggleTheme}>
            <i className={`bi ${darkMode ? 'bi-sun' : 'bi-moon'}`}></i>{' '}
            {darkMode ? 'Light' : 'Dark'}
        </a>
    );
}