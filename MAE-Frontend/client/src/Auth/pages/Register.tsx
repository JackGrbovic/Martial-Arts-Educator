import React from "react";
import { useState } from "react"
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { resolve } from "path";
import { useNavigate } from "react-router-dom";
import api from "../../apiClient.ts";

const userFormSchema = z.object({
    userName: z.string().nonempty('Username is required.'),
    email: z.string().nonempty('Email is required.').email(),
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
    const [successText, setSuccessText] = useState<string>("");

    const onSubmit: SubmitHandler<UserForm> = async (data) => {
        try{
            const response = await api.post('/register', data);

            if(response.status === 200) {
                setSuccessText('Link sent to inbox. Please click to complete registration.')
            }
        } catch (error) {
            setErrorMessage(`Failed to create user.`);
        }
    }

    return(
        <>
            {!errorMessage && !successText &&
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
                    <label className={'color-3 primary-font'} style={{marginBottom: '10px'}}>Username:
                        <input 
                            type="text" 
                            {...register('userName')}
                            style={{width: '100%'}}
                        />
                        {errors.userName && <div className="error-message">{errors.userName.message}</div>}
                    </label>
                    <div style={{display: 'flex', width: '100%', justifyContent: 'space-between'}}>
                    <div className="remove-button-style button" onClick={() => {!isSubmitting && navigate('/login-link-request')}}>
                            <span className={'primary-font color-6'}>{isSubmitting ? "Loading..." : "Log In"}</span>
                        </div>
                        <button disabled={isSubmitting} type="submit" className="button">
                            <span className={'primary-font'}>{isSubmitting ? "Loading..." : "Register"}</span>
                        </button>
                    </div>
                </form>
            }
            {errorMessage && <p className={'primary-font'}>{errorMessage}</p>}
            {successText && <p className={'primary-font'}>{successText}</p>}
        </>
    )
}
