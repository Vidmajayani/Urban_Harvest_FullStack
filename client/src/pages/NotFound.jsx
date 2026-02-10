import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            <h1 className="text-9xl font-bold text-ecoGreen dark:text-ecoLight mb-4 animate-bounce">
                404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6 font-ecoFont">
                Page Not Found
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md">
                Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link
                to="/"
                className="px-8 py-3 bg-ecoGreen hover:bg-ecoDark text-white font-semibold rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl flex items-center gap-2"
            >
                <FaHome className="text-xl" />
                <span>Back to Home</span>
            </Link>
        </div>
    );
};

export default NotFound;
