import React, { useContext } from "react";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { resolve } from "path";
import api from "../../apiClient.ts";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useAppContext } from "../../AppContext.tsx";

export default function CompleteRegistration(){
    const { user } = useAppContext();

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
        const completeRegistration = async () => {
            try {
                const response = await api.post('/complete-registration', {tokenHash: tokenHash, tempUserLearnedMoves: user?.learnedMoves});
                if(response.status === 200) {
                    localStorage.removeItem('user');
                    navigate('/');
                    window.location.reload();
                }
            } catch (error) {
                setErrorMessage(JSON.stringify(error));
                setIsLoading(false);
            }
        }

        tokenHash && user && completeRegistration();
    }, [tokenHash, user])

    return(
        <p>{errorMessage ? errorMessage : 'Processing...'}</p>
    )
}
