import React from "react";

const FirstPage = ({ handleClick, attempts }) => {
  return (
    <div className="wrapper" align="center">
      <div align="center" className="layout page">
        <div className="page__header">
          <img
            className="page__logo"
            src="./public/app/images/1x/logo.png"
            alt="logo"
          />
        </div>
        <div className="page__body">
          <h1 className="page__title">LUCKYBOX</h1>
          <div className="image__wrapper">
            <img
              className="image image_m"
              src="./public/app/images/1x/present.png"
              alt="present"
            ></img>
          </div>
          <div className="text__wrapper">
            <p className="text text_s">Количество попыток: {attempts}</p>
          </div>
        </div>
        <div className="page__footer">
          <button className="button" onClick={handleClick}>
            Получить подарок
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirstPage;
