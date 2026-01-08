import React from "react";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { resolve } from "path";
import api from "../../apiClient.ts";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useAppContext } from "../../AppContext.tsx";

export default function LoginWithLink(){
    const { handleSetUserFromDb } = useAppContext();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [tokenHash, setTokenHash] = useState<null | string>(null);


    const [errorMessage, setErrorMessage] = useState<string>();

    useEffect(() => {
        let params = new URLSearchParams(document.location.search);
        let tokenHash = params.get("tokenHash");
        tokenHash && setTokenHash(tokenHash);
    }, [])

    useEffect(() => {
        const login = async () => {
            try {
                const response = await api.post('/login', {tokenHash: tokenHash});
                if(response.status === 200) {
                    handleSetUserFromDb(response.data);
                    navigate('/');
                }
            } catch (error) {
                setErrorMessage("Unable to log in. Please try again or contact the system administrator.");
                setIsLoading(false);
            }
        }

        login();
    }, [tokenHash])

    return(
        <div className="background-color-2 hollow-container">
            <p>{errorMessage ? errorMessage : 'Processing...'}</p>
        </div>
    )
}
