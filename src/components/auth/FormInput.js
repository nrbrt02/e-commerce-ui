import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const FormInput = ({ id, name, label, type = 'text', value, placeholder, onChange, required = false, error = null, className = '', }) => {
    return (_jsxs("div", { className: `mb-4 ${className}`, children: [_jsxs("label", { htmlFor: id, className: "block text-gray-700 text-sm font-medium mb-2", children: [label, required && _jsx("span", { className: "text-red-500 ml-1", children: "*" })] }), _jsx("input", { id: id, name: name, type: type, value: value, placeholder: placeholder, onChange: onChange, required: required, className: `w-full px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500
                  ${error ? 'border-red-500' : 'border-gray-300'}` }), error && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: error }))] }));
};
export default FormInput;
