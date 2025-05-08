import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
const Layout = ({ children }) => {
    return (_jsxs("div", { className: "min-h-screen flex flex-col", children: [_jsx(TopBar, {}), _jsx(Header, {}), _jsx(Navigation, {}), _jsx("main", { className: "flex-grow", children: children || _jsx(Outlet, {}) }), _jsx(Footer, {})] }));
};
export default Layout;
