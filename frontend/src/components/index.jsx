import React, { useEffect, useState, useRef } from 'react';
import '../App.css';
import { fetchInstagramData, fetchUserData } from '../api';

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
    const dummyData = [
        {
            change_time: 180,
            change_url: "176.9.113.112:11126/changeip/client/23108983551657110673",
            id: 1,
            input_table: "input_table",
            last_id: 1,
            output_table: "output_table",
            proxy: "http://user26:8PFNYUSu@176.9.113.112:11026",
            slug: "86aacb40",
            name: "hermes",
        },
        {
            change_time: 180,
            change_url: "176.9.113.112:11126/changeip/client/23108983551657110673",
            id: 2,
            input_table: "input_table",
            last_id: 2,
            output_table: "output_table",
            proxy: "http://user26:8PFNYUSu@176.9.113.112:11026",
            slug: "86aacb40",
            name: "its_shahzad8",
        },
        {
            change_time: 180,
            change_url: "176.9.113.112:11126/changeip/client/23108983551657110673",
            id: 3,
            input_table: "input_table",
            last_id: 0,
            output_table: "output_table",
            proxy: "http://user26:8PFNYUSu@176.9.113.112:11026",
            slug: "86aacb40",
            name: "ehsanullah",
        },
    ];
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
            if (dummyData[currentShowingRef.current].last_id === 0) {
                clearInterval(intervalId);
            } else {
                currentShowingRef.current = currentShowingRef.current + 1;
                const response = await fetchInstagramData(dummyData[currentShowingRef.current].name);
                setInstagramData(response);
                setCurrentIndex(prev=> prev + 1);
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
        const response = await fetchInstagramData(dummyData[0]?.name);
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
                setRBtnActive(true);
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
        const response = await fetchInstagramData(dummyData[index]?.name);
        currentShowingRef.current = index;
        setInstagramData(response);
        setTimer(true);
    }
    const getPreviousUser = () => {
        const newIndex = currentIndex === 0 ? dummyData.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
        getInstaData(newIndex);
    };
    const currentObject = dummyData[currentIndex];
    const getProfilesShowed = (item) => {
        const index = dummyData.findIndex(item => item?.name === currentObject?.name);
        if (item === 'percent') {
            const value = ((index + 1) / dummyData.length) * 100;
            return parseInt(value);
        } else {
            return index + 1;
        }
    }
    console.log(instagramData)
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
                        <button onClick={() => setRBtnActive(true)} className={`menu-btn ${rBtnActive && 'btn-active'}`}>R</button>
                        <div>Profiles showed: {getProfilesShowed('value')}</div>
                        <div>%: {getProfilesShowed('percent')}</div>
                        <div>ID: {currentObject.id}</div>
                        <div>DB: 16290</div>
                        <div>Total done: 1</div>
                    </div>
                </div>
                <div className='img-section'>
                    <div className='row-header'>
                        <div className='row'>
                            {instagramData?.map((item, idx) => {
                                return <div key={idx} className='img-block'>
                                    <img src={item} alt='insta-img' className='img-styled' />
                                </div>
                            })}
                        </div>
                    </div>
                </div>
            </div>}
        </>
    )
}
