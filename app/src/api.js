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

const getUserToken = async () => {
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

const getUserData = async (uid, access_token) => {
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
  const prize = await fetch(`/app/api/v1/getPrize/${uid}`, {
    method: "get",
    headers: {
      Accept: "application/json"
    }
  })
    .then(data => data.json())
    .catch(err => console.error(err));
  return prize;
};

const getUploadUrl = async token => {
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
};

const getShareData = async (prize, upload_url) => {
  const shareData = await fetch("/app/api/v1/getShareForm", {
    headers: {
      Accept: "image/png",
      "Content-Type": "application/json"
    },
    method: "post",
    body: JSON.stringify(Object.assign(prize, { upload_url }))
  }).then(blob => blob.json());
  return shareData;
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

export default {
  fetchAttempts,
  getUserToken,
  getUserData,
  getPrize,
  getUploadUrl,
  getShareData,
  uploadPhoto
};
