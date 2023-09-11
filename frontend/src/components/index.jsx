import React, { useEffect, useState } from "react";
import "../App.css";
import { loadImagesData, rateImage } from "../api";

let reservelastIdToPre = 0;
let intervalId;
let lastIdWhenClickedOnPrevious = 0;
export const InstagramViewImages = ({ useData }) => {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [pBtnActive, setPBtnActive] = useState(false);
  const [rBtnActive, setRBtnActive] = useState(false);
  const [timer, setTimer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [instagramData, setInstagramData] = useState([]);
  const [showingRecord, setShowingRecord] = useState(1);

  useEffect(() => {
    setIsFirstTime(true);
    setRBtnActive(false);
    setPBtnActive(false);
    setTimer(false);
    reservelastIdToPre = useData.last_id;
  }, []);

  useEffect(() => {
    const getData = async () => {
      if (useData.last_id >= useData.count) {
        clearInterval(intervalId);
        setTimer(false);
      } else {
        if (useData.last_id == reservelastIdToPre) {
          useData.last_id += 1;
        }
        reservelastIdToPre += 1;
        const response = await loadImagesData(
          reservelastIdToPre,
          useData.id,
          useData.last_id == reservelastIdToPre
        );
        setInstagramData(response);
        setRBtnActive(false);
        if (useData.last_id > lastIdWhenClickedOnPrevious) {
          setShowingRecord((pre) => (pre += 1));
        }
      }
    };
    if (!pBtnActive && timer) {
      intervalId = setInterval(getData, `${useData.change_time}000`);
    } else {
      clearInterval(intervalId);
    }
  }, [pBtnActive, timer]);

  // Start click
  const handleOnClick = async () => {
    setLoading(true);
    setIsFirstTime(false);
    useData.last_id += 1;
    reservelastIdToPre += 1;
    const response = await loadImagesData(useData.last_id, useData.id, true);
    setLoading(false);
    setInstagramData(response);
    setTimer(true);
  };

  useEffect(() => {
    const handleKeywordAction = (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setPBtnActive(!pBtnActive);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        handleClickOnR();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        getPreviousUser();
      }
    };
    window.addEventListener("keydown", handleKeywordAction);
    return () => {
      window.removeEventListener("keydown", handleKeywordAction);
    };
  }, [pBtnActive, rBtnActive]);

  const getPreviousUser = async () => {
    setTimer(false);
    lastIdWhenClickedOnPrevious = reservelastIdToPre;
    reservelastIdToPre -= 1;
    const response = await loadImagesData(
      reservelastIdToPre,
      useData.id,
      false
    );
    setInstagramData(response);
    setTimer(true);
    setRBtnActive(false);
  };
  const getProfilesShowed = () => {
    const value = (useData.last_id / useData.count) * 100;
    return parseInt(value);
  };
  const handleClickOnR = async () => {
    setRBtnActive(true);
    await rateImage(
      instagramData?.username,
      instagramData?.accountId,
      useData.id
    );
  };
  //   render 12 images
  const images = [];
  for (let i = 0; i < 12; i++) {
    images.push(
      <div key={i} className="img-block">
        <img
          crossorigin="anonymous"
          src=""
          alt="insta-img"
          className="img-styled"
        />
      </div>
    );
  }
  //   update images src
  useEffect(() => {
    if (instagramData?.imagesData) {
      const imageElements = document.querySelectorAll(".img-styled");
      imageElements.forEach((element, index) => {
        element.src = instagramData.imagesData[index];
      });
    }
  }, [instagramData]);

  return (
    <>
      {isFirstTime ? (
        <div className="header">
          <button onClick={handleOnClick} type="button" className="btn-primary">
            Start
          </button>
        </div>
      ) : loading ? (
        <div className="header">loading....</div>
      ) : (
        <div>
          <div className="menu-main">
            <div className="menu1">
              <button
                disabled={reservelastIdToPre <= 0}
                onClick={getPreviousUser}
                className="menu-btn"
              >
                {"<"}
              </button>
              <button
                onClick={() => {
                  setPBtnActive(!pBtnActive);
                  setTimer(true);
                }}
                className={`menu-btn ${pBtnActive && "btn-active"}`}
              >
                P
              </button>
            </div>
            <div className="menu2">
              <button
                onClick={handleClickOnR}
                className={`menu-btn ${rBtnActive && "btn-active"}`}
              >
                R
              </button>
                <div>Profiles showed: {showingRecord}</div>
                <div>%: {getProfilesShowed()}</div>
                <div>ID: {instagramData?.accountId}</div>
                <div>DB: {useData.last_id}</div>
                <div>Total done: {instagramData?.totalDone}</div>
            </div>
          </div>
          <div className="img-section">
            <div className="row-header">
              <div className="row">{images}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
