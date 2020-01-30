import React, { useState, useEffect } from "react";
import connect from "@vkontakte/vk-connect";
import View from "@vkontakte/vkui/dist/components/View/View";
import Panel from "@vkontakte/vkui/dist/components/Panel/Panel";
import PopoutWrapper from "@vkontakte/vkui/dist/components/PopoutWrapper/PopoutWrapper";
import PanelSpinner from "@vkontakte/vkui/dist/components/PanelSpinner/PanelSpinner";
import Div from "@vkontakte/vkui/dist/components/Div/Div";
import "@vkontakte/vkui/dist/vkui.css";

import api from "./api";
import FirstPage from "./FirstPage";
import AnimationPage from "./AnimationPage";
import PrizePage from "./PrizePage";
import LastPage from "./LastPage";
import "./style/style.scss";

const App = () => {
  const [activePanel, setActivePanel] = useState("start-page");
  const [prize, setPrize] = useState(null);
  const [attempts, setAttempts] = useState(0);
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
      console.log(userData);
      const token = await api.fetchUserToken();
      let { liked, subscribed } = await api.fetchUserData(userData.uid, token);
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
      await api.vkRepost(owner_id, id);
      const fetchedAttempts = await api.setReposted(userData.uid);
      setAttempts(fetchedAttempts);
    } catch (e) {
      return;
    }
  };

  async function updateData() {
    let { liked, subscribed } = await api.fetchUserData(userData.uid, token);
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
            <p className="text text_l">"У вас закончились попытки"</p>
          </div>
          <div className="popout__text">
            <p className="text text_l">"Хотите получить еще?"</p>
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

export default App;
