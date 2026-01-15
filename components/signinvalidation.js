import * as yup from "yup";

export const signinValidation = yup.object({
    email: yup.string().email().required(),
    password: yup.string()
    .required("Password is required"),
});