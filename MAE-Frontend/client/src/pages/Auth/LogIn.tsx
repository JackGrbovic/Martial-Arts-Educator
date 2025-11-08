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
    password: z.string().nonempty('Email is required.')
})

type LoginForm = z.infer<typeof loginFormSchema>

export default function LogIn(){
    const navigate = useNavigate();

    const [userLoggedIn, setUserLoggedIn] = useState(false);

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
                navigate('/')
            }
          } catch (error) {
            console.error('Submission error:', error);
            throw error;
          }
    }

    return(
        <form onSubmit={handleSubmit(onSubmit)} style={{display: 'flex', flexDirection: 'column'}}>
            <label className={'color-3 primary-font'} style={{marginBottom: '10px'}}>Email Address:
                <input 
                    type="email" 
                    {...register('email')}
                    style={{width: '100%'}}
                />
            </label>
            {errors.email && <div>{errors.email.message}</div>}
            <label className={'color-3 primary-font'} style={{marginBottom: '10px'}}>Password:
                <input 
                    type="password" 
                    {...register('password')}
                    style={{width: '100%'}}
                />
                {errors.password && <div>{errors.password.message}</div>}
            </label>
            <div style={{display: 'flex', width: '100%', justifyContent: 'space-between'}}>
                <button disabled={isSubmitting} className="remove-button-style button" onClick={() => {navigate('/register')}}>
                    <span className={'primary-font color-6'}>{isSubmitting ? "Loading..." : "Register"}</span>
                </button>
                <button disabled={isSubmitting} type="submit" className="button" style={{maxWidth: '80px'}}>
                    <span className={'primary-font'}>{isSubmitting ? "Loading..." : "Log In"}</span>
                </button>
            </div>
            
            {errors.root && <div>{errors.root.message}</div>}
        </form>
    )
}
