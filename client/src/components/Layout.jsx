import { Outlet, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
    const { isAdmin } = useAuth();

    // Strict Admin Separation: Admins cannot view public pages while logged in
    if (isAdmin()) {
        return <Navigate to="/admin" replace />;
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen p-5 pt-20 md:pt-20">
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default Layout;
