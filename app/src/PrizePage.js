import React from "react";

const PrizePage = ({ switchPage, title, text, img_url }) => {
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
          <div className="image__wrapper">
            {img_url ? (
              <img className="image image_s" src={img_url} alt="present"></img>
            ) : null}
          </div>
          <p className="text text_prize text_xxl">{title}</p>
          <div className="text__wrapper" style={{ width: "100%" }}>
            <p
              className="text text_xs text_arial"
              style={{ textTransform: "none" }}
            >
              {text}
            </p>
          </div>
        </div>
        <div className="page__footer">
          <button
            size="xl"
            className="button"
            onClick={() => switchPage("last-page")}
          >
            <p className="text text_s">Далее</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrizePage;
