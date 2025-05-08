import { jsx as _jsx } from "react/jsx-runtime";
import { CheckoutProvider } from './CheckoutContenxt';
const CheckoutContextWrapper = ({ children }) => {
    return _jsx(CheckoutProvider, { children: children });
};
export default CheckoutContextWrapper;
