import React, { useEffect, useRef } from "react";
import Div from "@vkontakte/vkui/dist/components/Div/Div";

const AnimationPage = ({ switchPage }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    videoRef.current.play();
  });
  return (
    <Div className="wrapper" style={{ padding: "0px", margin: "0px" }}>
      <video
        onEnded={() => switchPage("prize-page")}
        className="video"
        ref={videoRef}
        src="./public/app/images/loading_animation_01.mp4"
      />
    </Div>
  );
};

export default AnimationPage;
