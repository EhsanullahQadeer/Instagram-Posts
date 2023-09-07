import React, { useEffect, useState, useRef } from 'react';
import '../App.css';
import { loadNextImagesData, loadPerviousImagesData, fetchUserData, fetchTableData, rateImage } from '../api';

export const InstagramViewImages = () => {
    const [isFirstTime, setIsFirstTime] = useState(true);
    const [pBtnActive, setPBtnActive] = useState(false);
    const [rBtnActive, setRBtnActive] = useState(false);
    const [timer, setTimer] = useState(false);
    const [loading, setLoading] = useState(false);
    const [instagramData, setInstagramData] = useState([]);
    const [usersData, setUsersData] = useState([]);
    const [userInfo, setUserInfo] = useState({});
    const [currentIndex, setCurrentIndex] = useState(userInfo.last_id);
    const currentShowingRef = useRef(userInfo.last_id);
    const slug = "86aacb40";
    const getUserData = async () => {
        const [data, userInformation] = await Promise.all([fetchTableData(), fetchUserData(slug)]);
        setUsersData(data);
        setUserInfo(userInformation);
    }
    useEffect(() => {
        setIsFirstTime(true);
        setRBtnActive(false);
        setPBtnActive(false);
        setTimer(false);
        getUserData();
    }, []);

    useEffect(() => {
        let intervalId;
        const getData = async () => {
            if (usersData[currentShowingRef.current].last_id === 0) {
                clearInterval(intervalId);
                setTimer(false);
            } else {
                currentShowingRef.current = currentShowingRef.current + 1;
                const response = await loadNextImagesData(usersData[currentShowingRef.current].username, slug);
                setInstagramData(response);
                setCurrentIndex(pev=> pev +1);
                setRBtnActive(false);
            }
        };
        if (!pBtnActive && timer) {
            intervalId = setInterval(getData, `${userInfo.change_time}000`);
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
        const response = await loadNextImagesData(usersData[userInfo]?.username, slug);
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
        const response = await loadPerviousImagesData(usersData[index]?.username);
        setCurrentIndex(index);
        setInstagramData(response);
        setTimer(true);
    }
    const getPreviousUser = () => {
        const index = currentIndex === 0 ? usersData.length - 1 : currentIndex - 1;
        getInstaData(index);
        setRBtnActive(false);
    };
    const currentObject = usersData[currentIndex];
    const getProfilesShowed = () => {
        const value = ((userInfo.last_id) / usersData.length) * 100;
        return parseInt(value);
    }
    const handleClickOnR = async () => {
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
                        <div>Profiles showed: {userInfo?.last_id}</div>
                        <div>%: {getProfilesShowed('percent')}</div>
                        <div>ID: {userInfo?.id}</div>
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
