import React, { useEffect, useState, useRef } from 'react';
import '../App.css';
import { fetchInstagramData, fetchUserData, rateImage } from '../api';

export const InstagramViewImages = () => {
    const [isFirstTime, setIsFirstTime] = useState(true);
    const [pBtnActive, setPBtnActive] = useState(false);
    const [rBtnActive, setRBtnActive] = useState(false);
    const [timer, setTimer] = useState(false);
    const [loading, setLoading] = useState(false);
    const [instagramData, setInstagramData] = useState([]);
    const [userInfoData, setUserInfoData] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentShowingRef = useRef(0);
    useEffect(() => {
        setIsFirstTime(true);
        setRBtnActive(false);
        setPBtnActive(false);
        setTimer(false);
        const getUserData = async () => {
            const data = await fetchUserData();
            setUserInfoData(data);
        }
        getUserData();
    }, []);

    useEffect(() => {
        let intervalId;
        const getData = async () => {
            console.log(currentShowingRef)
            if (userInfoData[currentShowingRef.current].last_id === 0) {
                clearInterval(intervalId);
                setTimer(false);
            } else {
                currentShowingRef.current = currentShowingRef.current + 1;
                const response = await fetchInstagramData(userInfoData[currentShowingRef.current].username);
                setInstagramData(response);
                setRBtnActive(false);
                setCurrentIndex(prev => prev + 1);
            }
        };
        if (!pBtnActive && timer) {
            intervalId = setInterval(getData, 5000);
        } else {
            clearInterval(intervalId);
            setTimer(false);
        }
        return () => {
            clearInterval(intervalId);
        };
    }, [pBtnActive, timer]);

    const handleOnClick = async () => {
        setLoading(true);
        setIsFirstTime(false);
        const response = await fetchInstagramData(userInfoData[0]?.username);
        currentShowingRef.current = 0;
        setInstagramData(response);
        setTimer(true);
        setLoading(false);
    };
    useEffect(() => {
        const handleKeywordAction = (event) => {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setPBtnActive(!pBtnActive);
            }
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                handleClickOnR();
            }
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                getPreviousUser();
            }
        };
        window.addEventListener('keydown', handleKeywordAction);
        return () => {
            window.removeEventListener('keydown', handleKeywordAction);
        };
    }, [pBtnActive, rBtnActive]);
    const getInstaData = async (index) => {
        const response = await fetchInstagramData(userInfoData[index]?.username);
        currentShowingRef.current = index;
        setCurrentIndex(index);
        setInstagramData(response);
        setTimer(true);
    }
    const getPreviousUser = () => {
        const index = currentIndex === 0 ? userInfoData.length - 1 : currentIndex - 1;
        getInstaData(index);
        setRBtnActive(false);
    };
    const currentObject = userInfoData[currentIndex];
    const getProfilesShowed = (item) => {
        const index = userInfoData.findIndex(item => item?.username === currentObject?.username);
        if (item === 'percent') {
            const value = ((index + 1) / userInfoData.length) * 100;
            return parseInt(value);
        } else {
            return index + 1;
        }
    }
    const handleClickOnR = async ()=> {
        setRBtnActive(true);
        await rateImage(currentObject, instagramData?.accountId);
    }
    return (
        <>
            {isFirstTime ? <div className='header'>
                <button onClick={handleOnClick} type='button' className='btn-primary'>Start</button>
            </div> : loading ? <div className='header'>loading....</div> : <div>
                <div className='menu-main'>
                    <div className='menu1'>
                        <button onClick={getPreviousUser} className='menu-btn'>{'<'}</button>
                        <button onClick={() => { setPBtnActive(!pBtnActive); setTimer(true) }} className={`menu-btn ${pBtnActive && 'btn-active'}`}>P</button>
                    </div>
                    <div className='menu2'>
                        <button onClick={handleClickOnR} className={`menu-btn ${rBtnActive && 'btn-active'}`}>R</button>
                        <div>Profiles showed: {getProfilesShowed('value')}</div>
                        <div>%: {getProfilesShowed('percent')}</div>
                        <div>ID: {currentObject?.user_id}</div>
                        <div>DB: 16290</div>
                        <div>Total done: 1</div>
                    </div>
                </div>
                <div className='img-section'>
                    <div className='row-header'>
                        <div className='row'>
                            {instagramData?.imagesData?.map((item, idx) => {
                                return <div key={idx} className='img-block'>
                                    <img crossorigin="anonymous" src={item} alt='insta-img' className='img-styled' />
                                </div>
                            })}
                        </div>
                    </div>
                </div>
            </div>}
        </>
    )
}
