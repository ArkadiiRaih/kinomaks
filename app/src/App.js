import React, { useState, useEffect } from "react";
import connect from "@vkontakte/vk-connect";
import View from "@vkontakte/vkui/dist/components/View/View";
import "@vkontakte/vkui/dist/vkui.css";
import Panel from "@vkontakte/vkui/dist/components/Panel/Panel";
import PopoutWrapper from "@vkontakte/vkui/dist/components/PopoutWrapper/PopoutWrapper";
import FirstPage from "./FirstPage";
import AnimationPage from "./AnimationPage";
import PrizePage from "./PrizePage";
import LastPage from "./LastPage";
import PanelSpinner from "@vkontakte/vkui/dist/components/PanelSpinner/PanelSpinner";
import api from "./api";

import "./style/style.scss";
import Div from "@vkontakte/vkui/dist/components/Div/Div";

const App = () => {
  const [activePanel, setActivePanel] = useState("start-page");
  const [prize, setPrize] = useState(null);
  const [attempts, setAttempts] = useState();
  const [popout, setPopout] = useState(null);
  const [userData, setUserData] = useState({});
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    connect.sendPromise("VKWebAppGetUserInfo").then(user => {
      setUserData(
        Object.assign(userData, { uid: user.id, location: user.city.title })
      );
    });
  }, [userData, setUserData]);

  useEffect(() => {
    fetchData();
    async function fetchData() {
      const token = await api.getUserToken();
      const { uid } = userData;
      let { liked, subscribed } = await api.getUserData(uid, token);
      liked = liked || 0;
      const user = Object.assign(userData, { liked, subscribed });
      const fetchedAttempts = await api.fetchAttempts(user);

      setUserData(user);
      setToken(token);
      setAttempts(fetchedAttempts);
      setTimeout(() => setLoading(false), 1000);
    }
  }, [userData]);

  const onPlay = async () => {
    if (attempts < 1) {
      openDefault();
      return;
    }
    // fetch random prize and go to next panel
    const { title, text, img_url, rest_attempts } = await api.getPrize(
      userData.uid
    );
    setPrize({ title, text, img_url });
    setAttempts(rest_attempts);
    switchPage("animation-page");
  };

  const share = async () => {
    try {
      const upload_url = await api.getUploadUrl(token);
      const shareData = await api.getShareData(prize, upload_url);
      const { owner_id, id } = await api.uploadPhoto(shareData, token);

      const repostResp = await connect.sendPromise("VKWebAppShowWallPostBox", {
        message: `Неожиданный и приятный подарок от КИНОМАКС! 
  
        Для вас подарки тоже есть: билеты в кино, вкусные наборы из кинобара, стикеры и другие призы — все раздают в приложении`,
        attachments: `photo${owner_id}_${id},https://vk.com/app7257506`
      });
      const fetchedAttempts = await fetch(
        `app/api/v1/setReposted/${userData.uid}`
      ).then(data => {
        console.log(data);
        return data.json();
      });
      setAttempts(fetchedAttempts.attempts);
    } catch (e) {
      return;
    }
  };
  async function updateData() {
    const { uid } = userData;
    let { liked, subscribed } = await api.getUserData(uid, token);
    liked = liked || 0;
    const user = Object.assign(userData, { liked, subscribed });
    const fetchedAttempts = await api.fetchAttempts(user);
    setAttempts(fetchedAttempts);
    setUserData(user);
  }

  const switchPage = page => {
    setActivePanel(page);
  };

  const onReturn = () => {
    updateData();
    switchPage("start-page");
  };

  const openDefault = () => {
    setPopout(
      <PopoutWrapper v="center" h="center">
        <Div onClose={closePopout} className="popout">
          <div className="popout__text">
            <p className="text text_l">У вас закончились попытки</p>
          </div>
          <div className="popout__text">
            <p className="text text_l">Хотите получить еще?</p>
          </div>
          <button
            className="button"
            onClick={() => {
              closePopout();
              switchPage("last-page");
            }}
          >
            Да
          </button>
        </Div>
      </PopoutWrapper>
    );
  };

  const closePopout = () => {
    setPopout(null);
  };

  return (
    <View popout={popout} activePanel={activePanel}>
      <Panel id="start-page" centered={true}>
        {loading ? (
          <PanelSpinner />
        ) : (
          <FirstPage
            handleClick={onPlay}
            switchPage={switchPage}
            attempts={attempts}
          />
        )}
      </Panel>
      <Panel id="animation-page" centered={true}>
        <AnimationPage switchPage={switchPage} />
      </Panel>
      <Panel id="prize-page" centered={true}>
        <PrizePage {...prize} switchPage={switchPage} />
      </Panel>
      <Panel id="last-page" centered={true}>
        <LastPage switchPage={switchPage} onShare={share} onReturn={onReturn} />
      </Panel>
    </View>
  );
};

function compose2(fn1, fn2) {
  return function composed(v) {
    return fn1(fn2(v));
  };
}

export default App;
