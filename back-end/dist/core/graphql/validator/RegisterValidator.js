"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerValidate = void 0;
const registerValidate = ({ email, username, password, }) => {
    if (!email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
        return {
            field: 'email',
            message: 'incorrect email format',
        };
    }
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(username)) {
        return {
            field: 'username',
            message: 'username exits  special characters',
        };
    }
    if (password.length < 6) {
        return {
            field: 'password',
            message: 'password length must be greater than 6',
        };
    }
    if (username.length < 3) {
        return {
            field: 'username',
            message: 'username length must be greater than 3',
        };
    }
    if (password.length > 12) {
        return {
            field: 'password',
            message: 'password length more than 12',
        };
    }
    return null;
};
exports.registerValidate = registerValidate;
//# sourceMappingURL=RegisterValidator.js.map