import React, { useEffect, useState } from 'react';
import '../App.css';
import { loadImagesData, fetchUserData, fetchTableData, rateImage } from '../api';

let value = 0;
console.log(value);
export const InstagramViewImages = () => {
    const [isFirstTime, setIsFirstTime] = useState(true);
    const [pBtnActive, setPBtnActive] = useState(false);
    const [rBtnActive, setRBtnActive] = useState(false);
    const [timer, setTimer] = useState(false);
    const [loading, setLoading] = useState(false);
    const [instagramData, setInstagramData] = useState([]);
    const [showingRecord, setShowingRecord] = useState(1);

    const slug = "86aacb40";
    const slugFormUrl = window.location.pathname.replace('/', '');
    const previousValue = localStorage.getItem('valueWhenClicked');

    useEffect(() => {
        setIsFirstTime(true);
        setRBtnActive(false);
        setPBtnActive(false);
        setTimer(false);
    }, []);

    useEffect(() => {
        let intervalId;
        const getData = async () => {
            if (instagramData?.is_last) {
                clearInterval(intervalId);
                setTimer(false);
            } else {
                value = value + 1;
                const response = await loadImagesData(slug, value);
                if (response) {
                    if (value === response.last_id && value+1 !== Number(previousValue)) {
                        setShowingRecord(prev => prev + 1);
                    }
                    setInstagramData(response);
                    setRBtnActive(false);
                }
            }
        };
        if (!pBtnActive && timer && instagramData.last_id) {
            intervalId = setInterval(getData, `${instagramData.change_time}00`);
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
        const response = await loadImagesData(slug, 0);
        if (response) {
            value = response.last_id;
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
                // getPreviousUser();
            }
        };
        window.addEventListener('keydown', handleKeywordAction);
        return () => {
            window.removeEventListener('keydown', handleKeywordAction);
        };
    }, [pBtnActive, rBtnActive]);

    const getInstaData = async () => {
        if (value > 0) {
            const response = await loadImagesData(slug, value - 1);
            if (response) {
                localStorage.setItem('valueWhenClicked', `${value}`);
                value = value - 1;
                setInstagramData(response);
                setTimer(true);
            }
        }
    }

    const getPreviousUser = async () => {
        await getInstaData();
        setRBtnActive(false);
    };
    const getProfilesShowed = () => {
        const value = ((instagramData.last_id) / instagramData.total_records) * 100;
        return parseInt(value);
    }
    const handleClickOnR = async () => {
        setRBtnActive(true);
        await rateImage(instagramData);
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
                        <div>Profiles showed: {showingRecord}</div>
                        <div>%: {getProfilesShowed()}</div>
                        <div>ID: {instagramData?.user_id}</div>
                        <div>DB: {instagramData.last_id}</div>
                        <div>Total done: {instagramData.total_done}</div>
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
