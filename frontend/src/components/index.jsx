import React, { useEffect, useState } from 'react';
import '../App.css';
import { loadImagesData, fetchUserData, fetchTableData, rateImage } from '../api';

export const InstagramViewImages = () => {
    const [isFirstTime, setIsFirstTime] = useState(true);
    const [pBtnActive, setPBtnActive] = useState(false);
    const [rBtnActive, setRBtnActive] = useState(false);
    const [timer, setTimer] = useState(false);
    const [loading, setLoading] = useState(false);
    const [instagramData, setInstagramData] = useState([]);
    const [usersData, setUsersData] = useState([]);
    const [userInfo, setUserInfo] = useState({});
    const [currentShowing, setCurrentShowing] = useState(userInfo.last_id);
    useEffect(() => {
        setCurrentShowing(userInfo.last_id);
    }, [userInfo])
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
            if (usersData[instagramData.last_id] === usersData.length) {
                clearInterval(intervalId);
                setTimer(false);
            } else {
                const response = await loadImagesData(usersData[instagramData.last_id].username, slug, 'next');
                if (response) {
                    setCurrentShowing(perv => perv + 1);
                    setInstagramData(response);
                    setRBtnActive(false);
                }
            }
        };
        if (!pBtnActive && timer && instagramData.last_id) {
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
        const response = await loadImagesData(usersData[userInfo?.last_id]?.username, slug, 'next');
        if (response) {
            setInstagramData(response);
            setTimer(true);
        }
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
    }, [pBtnActive, rBtnActive, currentShowing]);

    const getInstaData = async () => {
        const index = currentShowing === 0 ? usersData.length - 1 : currentShowing - 1;
        const response = await loadImagesData(usersData[index]?.username, slug, 'previous');
        if (response) {
            setInstagramData(response);
            setTimer(true);
        }
    }

    const getPreviousUser = async () => {
        await getInstaData();
        await setCurrentShowing(perv => perv - 1);
        setRBtnActive(false);
    };
    const getProfilesShowed = () => {
        const value = ((instagramData.last_id) / usersData.length) * 100;
        return parseInt(value);
    }
    const currentObject = usersData[currentShowing];
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
                        <div>Profiles showed: {instagramData?.last_id}</div>
                        <div>%: {getProfilesShowed('percent')}</div>
                        <div>ID: {instagramData?.accountId}</div>
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
