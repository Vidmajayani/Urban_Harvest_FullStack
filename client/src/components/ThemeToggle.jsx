import { FaSun, FaMoon } from "react-icons/fa";
import { useAppContext } from "../context/AppContext";

function ThemeToggle(props) {
    const { theme, toggleTheme } = useAppContext();

    const handleClick = () => {
        toggleTheme();
    };

    if (props.mode === 'text-only') {
        return theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }

    return (
        <button
            onClick={handleClick}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 shadow-sm hover:shadow-md"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <FaMoon className="text-gray-700 text-lg" />
            ) : (
                <FaSun className="text-yellow-400 text-lg" />
            )}
        </button>
    );
}

export default ThemeToggle;
