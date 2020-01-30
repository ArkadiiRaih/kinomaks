import connect from "@vkontakte/vk-connect";

const fetchAttempts = async user => {
  try {
    const fetchedAttempts = await fetch(`/app/api/v1/user`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify(user)
    })
      .then(blob => blob.json())
      .then(data => data.attempts);
    return fetchedAttempts;
  } catch (e) {
    return;
  }
};

const fetchUserToken = async () => {
  try {
    const { access_token } = await connect.sendPromise("VKWebAppGetAuthToken", {
      app_id: 7257506,
      scope: "wall,photos"
    });
    return access_token;
  } catch (e) {
    return null;
  }
};

const fetchUserData = async (uid, access_token) => {
  const data = await connect
    .sendPromise("VKWebAppCallAPIMethod", {
      method: "execute.getUserData",
      params: {
        uid,
        v: "5.103",
        access_token
      }
    })
    .then(response => response.response)
    .then(data => data);
  return data;
};

const getPrize = async uid => {
  try {
    const prize = await fetch(`/app/api/v1/getPrize/${uid}`, {
      method: "get",
      headers: {
        Accept: "application/json"
      }
    }).then(data => data.json());
    return prize;
  } catch (e) {
    console.log(e);
    return {};
  }
};

const getUploadUrl = async token => {
  try {
    const { upload_url } = await connect
      .sendPromise("VKWebAppCallAPIMethod", {
        method: "photos.getUploadServer",
        request_id: "getUploadUrl",
        params: {
          group_id: 190154431,
          album_id: 269523539,
          v: "5.103",
          access_token: token
        }
      })
      .then(data => data.response);
    return upload_url;
  } catch (e) {
    return {};
  }
};

const getShareData = async (prize, upload_url) => {
  try {
    const shareData = await fetch("/app/api/v1/getShareForm", {
      headers: {
        Accept: "image/png",
        "Content-Type": "application/json"
      },
      method: "post",
      body: JSON.stringify(Object.assign(prize, { upload_url }))
    }).then(blob => blob.json());
    return shareData;
  } catch (e) {
    return {};
  }
};

const uploadPhoto = async (shareData, token) => {
  const photoData = await connect
    .sendPromise("VKWebAppCallAPIMethod", {
      method: "photos.save",
      request_id: "getUploadUrl",
      params: Object.assign(
        {
          group_id: 190154431,
          album_id: 269523539,
          v: "5.103",
          access_token: token
        },
        shareData
      )
    })
    .then(data => data.response[0]);
  return photoData;
};

const setReposted = async uid => {
  const fetchedAttempts = await fetch(
    `app/api/v1/setReposted/${uid}`
  ).then(data => data.json());
  return fetchedAttempts.attempts;
};

const vkRepost = async (owner_id, id) => {
  await connect.sendPromise("VKWebAppShowWallPostBox", {
    message: `Неожиданный и приятный подарок от КИНОМАКС! 

    Для вас подарки тоже есть: билеты в кино, вкусные наборы из кинобара, стикеры и другие призы — все раздают в приложении`,
    attachments: `photo${owner_id}_${id},https://vk.com/app7257506`
  });
};

export default {
  fetchAttempts,
  fetchUserToken,
  fetchUserData,
  getPrize,
  getUploadUrl,
  getShareData,
  uploadPhoto,
  setReposted,
  vkRepost
};
