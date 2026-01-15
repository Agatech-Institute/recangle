import * as yup from "yup";

export const signupValidation = yup.object({
    email: yup.string().email().required(),
    password: yup.string()
    .min(8, "Password must be at least 8 characters long.")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter.")
    .matches(/\d/, "Password must contain at least one number.")
    .matches(/[!@#$%^&*]/, "Password must contain at least one special character.")
    .required("Password is required"),
    passwordConfirmation: yup.string().required().oneOf([yup.ref("password"),null]),
    firstName: yup.string()
    .min(3,"First name must be at least 3 characters")
    .max(36,"First name must not be more than 36 characters")
    .required("First name is required"),
    lastName: yup.string()
    .min(3,"Last name must be at least 3 characters")
    .max(36,"Last name must not be more than 36 characters")
    .required("Last name is required"),
    phoneNumber: yup.string()
    .min(10,"Phone number must be at least 10 characters")
    .max(14,"Phone number must not be more than 14 characters")
    .required("Phone number is required"),
});