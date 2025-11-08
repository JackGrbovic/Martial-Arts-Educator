import React from "react";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { resolve } from "path";
import api from "../../apiClient.ts";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';

const loginFormSchema = z.object({
    email: z.string().nonempty('Email is required.').email(),
    password: z.string().nonempty('Password is required.')
})

type LoginForm = z.infer<typeof loginFormSchema>

export default function LogIn(){
    const navigate = useNavigate();

    const [userLoggedIn, setUserLoggedIn] = useState(false);

    const [errorMessage, setErrorMessage] = useState<string>();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
      } = useForm<LoginForm>({
        resolver: zodResolver(loginFormSchema)
      });

    const onSubmit: SubmitHandler<LoginForm> = async (data) => {
        console.log("submitting")
        try {
            const response = await api.post('/login', data);
            if(response.status === 200) {
                navigate('/');
                window.location.reload();
            }
          } catch (error) {
            setErrorMessage('Username or Password incorrect.')
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
            </label>
            {errors.email && <div className="error-message">{errors.email.message}</div>}
            <label className={'color-3 primary-font'} style={{marginBottom: '10px'}}>Password:
                <input 
                    type="password" 
                    {...register('password')}
                    style={{width: '100%'}}
                />
            </label>
            {errors.password && <div className="error-message">{errors.password.message}</div>}
            <div style={{display: 'flex', width: '100%', justifyContent: 'space-between'}}>
                <div className="remove-button-style button" onClick={() => {!isSubmitting && navigate('/register')}}>
                    <span className={'primary-font color-6'}>{isSubmitting ? "Loading..." : "Register"}</span>
                </div>
                <button disabled={isSubmitting} type="submit" className="button" style={{maxWidth: '80px'}}>
                    <span className={'primary-font'}>{isSubmitting ? "Loading..." : "Log In"}</span>
                </button>
            </div>
        </form>
    )
}
