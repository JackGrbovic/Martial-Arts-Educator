import React from "react";
import { useState } from "react"
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { resolve } from "path";
import { useNavigate } from "react-router-dom";
import api from "../../apiClient.ts";

const userFormSchema = z.object({
    firstName: z.string().nonempty('First Name is required.'),
    lastName: z.string().nonempty('Last Name is required.'),
    email: z.string().nonempty('Email is required.').email(),
    password: z.string().nonempty('Email is required.')
        .min(8, { message: "Password must be at least 8 characters." })
        .max(20, { message: "Password must be at most 20 characters." })
        .refine((password) => /[A-Z]/.test(password), {
            message: "Password must contain at least 1 uppercase character.",
        })
        .refine((password) => /[a-z]/.test(password), {
            message: "Password must contain at least 1 lowercase character.",
        })
        .refine((password) => /[0-9]/.test(password), { 
            message: "Password must contain at least 1 numerical value."
            })
        .refine((password) => /[!@#$%^&*]/.test(password), {
            message: "Password must contain at least 1 special character.",
    }),
    confirmPassword: z.string().nonempty('Email is required.').regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords must match.",
        path: ['confirmPassword'],
});

type UserForm = z.infer<typeof userFormSchema>


export default function Register(){
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
      } = useForm<UserForm>({
        resolver: zodResolver(userFormSchema)
      });

    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState<string>();

    const onSubmit: SubmitHandler<UserForm> = async (data) => {
        try{
            const response = await api.post('/register', data);

            if(response.status === 200) {
                navigate('/');
                window.location.reload();
            }
        } catch (error) {
            setErrorMessage(`Failed to create user.`);
        }
    }

    return(
        <form onSubmit={handleSubmit(onSubmit)} style={{display: 'flex', flexDirection: 'column'}}>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {errors.root && <div className="error-message">{errors.root.message}</div>}
            <label className={'color-3 primary-font'} style={{marginBottom: '10px'}}>Email Address:
                <input 
                    type="email" 
                    {...register('email')}
                    style={{width: '100%'}}
                />
                {errors.email && <div className="error-message">{errors.email.message}</div>}
            </label>
            <label className={'color-3 primary-font'} style={{marginBottom: '10px'}}>First Name:
                <input 
                    type="text" 
                    {...register('firstName')}
                    style={{width: '100%'}}
                />
                {errors.firstName && <div className="error-message">{errors.firstName.message}</div>}
            </label>
            <label className={'color-3 primary-font'} style={{marginBottom: '10px'}}>Last Name:
                <input 
                    type="text" 
                    {...register('lastName')}
                    style={{width: '100%'}}
                />
                {errors.lastName && <div className="error-message">{errors.lastName.message}</div>}
            </label>
            <label className={'color-3 primary-font'} style={{marginBottom: '10px'}}>Password:
                <input 
                    type="password" 
                    {...register('password')}
                    style={{width: '100%'}}
                />
                {errors.password && <div className="error-message">{errors.password.message}</div>}
            </label>
            <label className={'color-3 primary-font'} style={{marginBottom: '10px'}}>Confirm Password:
                <input 
                    type="password" 
                    {...register('confirmPassword')}
                    style={{width: '100%'}}
                />
                {errors.confirmPassword && <div className="error-message">{errors.confirmPassword.message}</div>}
            </label>
            <div style={{display: 'flex', width: '100%', justifyContent: 'space-between'}}>
               <div className="remove-button-style button" onClick={() => {!isSubmitting && navigate('/login')}}>
                    <span className={'primary-font color-6'}>{isSubmitting ? "Loading..." : "Log In"}</span>
                </div>
                <button disabled={isSubmitting} type="submit" className="button">
                    <span className={'primary-font'}>{isSubmitting ? "Loading..." : "Register"}</span>
                </button>
            </div>
        </form>
    )
}
