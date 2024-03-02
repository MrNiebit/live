async function getUserToken() {
    const apiUrl = "https://jp.baiyifuhaoe.com/platform-ns/v1.0/login-device";
    const headers = {
        token: "",
        dev: 2,
        version: "6.6.6.6",
        "frond-host": "https://jp.baiyifuhaoe.com/platform-ns/v1.0/login-device",
        time: new Date().getTime(),
        "Content-Type": "application/json"
    };
    const respData = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            ...headers
        },
        body: JSON.stringify(
            {
                "agent": "77jp",
                "deviceId": "086F94F89A1AE334E58ED00176949DB189025452",
                "inviter_code": "10032",
                "ip": "13.230.205.105",
                "login_dev": 2,
                "phoneModel": "oppo-PHN110",
                "token": "9ca17ae2e6f8cda170e2e6eea7d85cf2a987b7e55cb2928eb7c45b939b9bb1d43ff6bfbb93ee5af79c008ed12af0feaec3b92a94e9988ae8338b90fcb0eb4a969a8ab6c15fa78ffcd8e43eb3eb9e92bb72aaa8ee9e"
            }
        )
    });
    console.log('process ~')
    return (await respData.json()).data.token;
}

async function getAccessToken(token) {
    const apiUrl = "https://jp.baiyifuhaoe.com/platform-ns/v1.0/sign";
    const headers = {
        token: token,
        dev: 2,
        version: "6.6.6.6",
        "frond-host": "https://jp.baiyifuhaoe.com/platform-ns/v1.0/sign",
        time: new Date().getTime()
    };
    const respData = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            ...headers
        }
    });
    return respData.json();
}

let qmaoData = {
    token: "",
    accessToken: ""
};

export async function geqmaoData() {
    return qmaoData;
}

export async function getqmAccessToken() {
    if (!qmaoData.token) {
        console.log(1);
        qmaoData.token = await getUserToken();
    }
    if (!qmaoData.accessToken) {
        console.log(2);
        let resp = await getAccessToken(qmaoData.token);
        if (resp.code === 0 && resp.data.usersig) {
            console.log(3);
            qmaoData.accessToken = resp.data.usersig;
        } else {
            console.log(4);
            qmaoData.token = await getUserToken();
            resp = await getAccessToken(qmaoData.token);
            qmaoData.accessToken = resp.data.usersig;
        }
    }
    return qmaoData.accessToken;
}

export async function getToken() {
    if (!qmaoData.token) {
        qmaoData.token = await getUserToken();
    }
    return qmaoData.data;
}

export async function refreshToken() {
    qmaoData.token = await getUserToken();
}