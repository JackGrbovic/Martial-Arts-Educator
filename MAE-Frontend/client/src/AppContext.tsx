import React, { createContext, SetStateAction, useContext, useEffect, useState, useLayoutEffect } from 'react';
import { api } from './apiClient.ts'
import { Move, MartialArt, Step, User } from './data/types.ts';
import { useNavigate } from 'react-router-dom';
import { relative } from 'path';
import { useLocation } from "react-router-dom";

  
  type AppContextType = {
    user: User | null;
    martialArts: MartialArt[];
    steps: Step[];
    unlearnedMoves: Move[];
    setUnlearnedMoves: Function;
    reviews: Move[];
    loading: boolean;
    logout: () => void;
    setUser: SetStateAction<User | null>,
    isTempUser : boolean,
    isMobile: boolean
  };
  
  export const AppContext = createContext<AppContextType | undefined>(undefined);
  
  export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
      throw new Error("useUserContext must be used within a UserContext.Provider");
    }
    return context;
  }
  
  export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [martialArts, setMartialArts] = useState<MartialArt[] | null>(null);
    const [allSteps, setAllSteps] = useState<Step[] | null>(null);
    const [unlearnedMoves, setUnlearnedMoves] = useState<Move[]>();
    const [reviews, setReviews] = useState();
    const [loading, setLoading] = useState(true);
    const [userLoading, setUserLoading] = useState<boolean>(true);
    const [isTempUser, setIsTempUser] = useState<boolean>(null)

    console.log('user', user)


    const fetchUserOnRefresh = async () => {
        
      try{
        const response = await api.post("/refresh", { withCredentials : true });
        
        console.log('fetchUserOnRefresh response', response)
        
        if (response.status == 200){
          const responseUser = response.data.user;
          setReviews(responseUser.reviews);
          setUser(responseUser);
          setUserLoading(false);
          return;
        }        
      } catch {
        const tempUserFromStorage = JSON.parse(localStorage.getItem('user'));
        if (tempUserFromStorage){
          setUser(tempUserFromStorage);
        }

        else{
            setUser({
            id: 'tempUser',
            name: '',
            learnedMoves: [],
            reviews: []
          });
        }
      } finally {
        setUserLoading(false);
      }
    };

    const updateTempUser = () => {
      localStorage.setItem('user', JSON.stringify(user));
    }

    const handleSetLessons = (user, martialArts) => {
      let movesToLearn: Move[] = [];

      if(martialArts) {
        for (let i = 0; i < martialArts.length; i++){
          for (const move of martialArts[i].moves){
            const learnedMove = user.learnedMoves && user.learnedMoves.find((lm) => { return lm.id === move.id })
            if (!learnedMove){
              movesToLearn.push(move)
            }
          }
        }
      }

      setUnlearnedMoves(movesToLearn);
    }

    const [iframeParentSize, setIframeParentSize] = useState([0,0]);
    const [windowSize, setWindowSize] = useState([0, 0]);
    const [iframeLoaded, setIframeLoaded] = useState(false)


    useLayoutEffect(() => {
      function updateSizes() {
        setWindowSize([window.innerWidth, window.innerHeight]);
        const iframeParent = document.getElementById('iframeParent')
        const iframeParentSizes = iframeParent?.getBoundingClientRect();
        setIframeParentSize([iframeParentSizes?.width, iframeParentSizes?.height]);
      }
      window.addEventListener('resize', updateSizes);
      updateSizes();
      return () => window.removeEventListener('resize', updateSizes);
    }, [iframeLoaded]);


    const [isMobile, setIsMobile] = useState<boolean>()
    useEffect(() => {
      setIsMobile(calculateIsMobile(windowSize[0]))
    },[windowSize])

    const calculateIsMobile = (width) => {
      return width > 1300 ? false : true
    }


    // const handleSetLearnedMoves = (user, martialArts: MartialArt[]) => {
    //   let learnedMoves = [];

    //   if (martialArts && user.learnedMoves) {
    //     for (let i = 0; i < martialArts.length; i++){
    //       for (const learnedMove of user.learnedMoves){
    //         const learnedMoveMoveData = martialArts[i].moves.find(m => m.id === learnedMove.moveId);
    //         if (learnedMoveMoveData){
    //           const learnedMoveToReturn = {
    //             ...learnedMoveMoveData,
    //             id: learnedMove.id,
    //             userId: learnedMove.userId,
    //             easeFactor: learnedMove.easeFactor,
    //             martialArtId: learnedMoveMoveData.martialArtId
    //           }
    //           learnedMoves.push(learnedMoveToReturn);
    //         }
    //       }
    //     }
    //   }
      
    //   //refactor
    //   const userWithScaffoldedLearnedMoves = JSON.parse(JSON.stringify(user));
    //   userWithScaffoldedLearnedMoves.learnedMoves = learnedMoves;
    //   setUser(userWithScaffoldedLearnedMoves);
    // }

    const fetchAppData = async () => {
      try {
        const response = await api.get("/get-app-data");
        localStorage.setItem('martialArts', JSON.stringify(response.data.martialArts));
        localStorage.setItem('allSteps', JSON.stringify(response.data.steps))
        handleSetAppData(response.data.martialArts, response.data.steps)

      } catch (err) {
        console.error("Failed to set MartialArts", err.message);
        setMartialArts(null);
      } finally{
        setLoading(false);
      }
    };

    //write a function to fetch and set reviews (we can get filter reviews that are ready in the controller before sending them here)

    const handleSetAppData = (martialArtsData, stepsData) =>{
      setMartialArts(prev => {
        return martialArtsData;
      });
      setAllSteps(stepsData);
    };

    useEffect(() => {
      const fetchUserOnRefreshWrapper = async () => {
        await fetchUserOnRefresh();
      };

      fetchUserOnRefreshWrapper();
    }, []);

    useEffect(() => {
      isTempUser != true && setIsTempUser(user?.id === "tempUser" ? true : false)
      isTempUser && updateTempUser();
    }, [user])


    useEffect(() => {
      if (isTempUser) return;

      const setAllData = () => {
        const storedMartialArts: string | null = localStorage.getItem('martialArts');
        const parsedMartialArts: MartialArt[] | null = storedMartialArts ? JSON.parse(storedMartialArts) : null;
        const storedSteps: string | null = localStorage.getItem('steps');
        const parsedAllSteps: Step[] | null = storedSteps ? JSON.parse(storedSteps) : null;
        parsedMartialArts !== null && parsedAllSteps !== null ? handleSetAppData(parsedMartialArts, parsedAllSteps) : fetchAppData();
        if (parsedMartialArts && user?.learnedMoves) handleSetLessons(user, parsedMartialArts);
        if (!userLoading) setLoading(false);
      }

      user && setAllData();
      
    }, [user]);

    const location = useLocation();

    useEffect(() => {
        
    }, []);

    const logout = () => {
      setUser(null);
      navigate('/');
    };

    return (
      <AppContext.Provider value={{ user, martialArts, allSteps, unlearnedMoves, reviews, loading, logout, setUser, isMobile, iframeParentSize, windowSize, setIframeLoaded, isTempUser}}>
        <div style={{position: 'relative', bottom: '30px'}}>
          {children}
        </div>
      </AppContext.Provider>
    );
  };
