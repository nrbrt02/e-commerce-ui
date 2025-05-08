import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const ErrorAlert = ({ error }) => {
    if (!error)
        return null;
    return (_jsx("div", { className: "mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "aria-hidden": "true", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm text-red-700", children: error }) }), _jsx("div", { className: "ml-auto pl-3", children: _jsx("div", { className: "-mx-1.5 -my-1.5", children: _jsxs("button", { type: "button", className: "inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500", onClick: () => {
                                // Here you would typically call a function to dismiss the error
                                // Since the error is controlled by the parent component, we'll leave this empty
                            }, children: [_jsx("span", { className: "sr-only", children: "Dismiss" }), _jsx("svg", { className: "h-5 w-5", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) })] }) }) })] }) }));
};
export default ErrorAlert;
