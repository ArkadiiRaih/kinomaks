import React from "react";

const LastPage = ({ switchPage, onShare, onReturn }) => {
  return (
    <div className="wrapper" align="center">
      <div align="center" className="page layout">
        <div className="page__header">
          <img
            className="page__logo"
            src="./public/app/images/1x/logo.png"
            alt="logo"
          />
        </div>
        <div className="page__body">
          <div className="text__wrapper">
            <p className="text_blue text_xl">
              ты можешь получить дополнительные попытки
            </p>
          </div>
          <div className="button-group">
            <button className="button" onClick={onShare}>
              <p className="text text_xs">Поделиться результатом</p>
            </button>
            <p className="text text_xs">+1 попытка</p>
            <a
              className="button"
              href="https://vk.com/public190154431?w=wall-190154431_1"
              target="_parent"
            >
              <p className="text text_xs">
                Поставить лайк
                <br />
                на&nbsp;промо&nbsp;пост
              </p>
            </a>
            <p className="text text_xs">+1 попытка</p>
            <a
              className="button"
              href="https://vk.com/public190154431"
              target="_parent"
            >
              <p className="text text_xs">Подписаться на группу</p>
            </a>
            <p className="text text_xs">+2 попытки</p>
          </div>
        </div>
        <div className="page__footer">
          <button className="button" onClick={onReturn}>
            <p className="text text_s">Вернуться в игру</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LastPage;
