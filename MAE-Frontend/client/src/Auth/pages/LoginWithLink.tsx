import React from "react";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { resolve } from "path";
import api from "../../apiClient.ts";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';

export default function LoginWithLink(){
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
                    navigate('/');
                    window.location.reload();
                }
            } catch (error) {
                setErrorMessage(JSON.stringify(error));
                setIsLoading(false);
            }
        }

        login();
    }, [tokenHash])

    return(
        <p>{errorMessage ? errorMessage : 'Processing...'}</p>
    )
}
