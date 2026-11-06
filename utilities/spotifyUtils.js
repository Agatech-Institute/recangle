import * as AuthSession from "expo-auth-session";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase.config";

// This will automatically generate a valid URI for your app
const redirectUri = AuthSession.makeRedirectUri({
  scheme: "rectangle", // Must match the scheme in your app.json
  path: "spotify-auth",
});
console.log("Use this Redirect URI:", redirectUri);

const SPOTIFY_CLIENT_ID = "06378114aa954f0e995f3b3781c1840b";
const SPOTIFY_REDIRECT_URI = "exp://192.168.115.10:8081/--/spotify-auth";
const TOKEN_STORAGE_KEY = "spotifyTokens";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const CURRENTLY_PLAYING_ENDPOINT =
  "https://api.spotify.com/v1/me/player/currently-playing";

const toBase64Url = (bytes) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const createCodeVerifier = async () => {
  const bytes = await Crypto.getRandomBytesAsync(64);
  return toBase64Url(bytes);
};

const createCodeChallenge = async (verifier) => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 },
  );
  return digest.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const parseCallback = (url) => {
  const query = url.split("?")[1]?.split("#")[0] || "";
  return Object.fromEntries(new URLSearchParams(query));
};

const saveTokens = async (tokens) => {
  await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
};

const getTokens = async () => {
  const stored = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

const requestToken = async (params) => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      ...params,
    }).toString(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || "Spotify token request failed");
  }
  return data;
};

export const connectSpotify = async () => {
  const verifier = await createCodeVerifier();
  const challenge = await createCodeChallenge(verifier);
  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.searchParams.set("client_id", SPOTIFY_CLIENT_ID);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", SPOTIFY_REDIRECT_URI);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set(
    "scope",
    "user-read-currently-playing user-read-playback-state",
  );

  const result = await WebBrowser.openAuthSessionAsync(
    authUrl.toString(),
    SPOTIFY_REDIRECT_URI,
  );

  if (result.type !== "success" || !result.url) {
    throw new Error("Spotify authorization was cancelled");
  }

  const callback = parseCallback(result.url);
  if (!callback.code) {
    throw new Error(
      callback.error_description || "Spotify authorization failed",
    );
  }

  const tokens = await requestToken({
    grant_type: "authorization_code",
    code: callback.code,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    code_verifier: verifier,
  });

  await saveTokens({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  });
};

const getAccessToken = async () => {
  const tokens = await getTokens();
  if (!tokens) return null;
  if (tokens.expiresAt > Date.now() + 60000) return tokens.accessToken;

  const refreshed = await requestToken({
    grant_type: "refresh_token",
    refresh_token: tokens.refreshToken,
  });
  await saveTokens({
    ...tokens,
    accessToken: refreshed.access_token,
    expiresAt: Date.now() + refreshed.expires_in * 1000,
    refreshToken: refreshed.refresh_token || tokens.refreshToken,
  });
  return refreshed.access_token;
};

export const syncCurrentlyPlaying = async (userId) => {
  const accessToken = await getAccessToken();
  if (!accessToken || !userId) return null;

  const response = await fetch(CURRENTLY_PLAYING_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 204 || response.status === 404) {
    await setDoc(
      doc(db, "users", userId),
      { currentTrack: null },
      { merge: true },
    );
    return null;
  }
  if (response.status === 403) {
    await setDoc(
      doc(db, "users", userId),
      { currentTrack: null },
      { merge: true },
    );
    throw new Error(
      "Spotify denied playback access. Use a Premium Spotify account and reconnect Spotify.",
    );
  }
  if (response.status === 401) {
    console.warn("Spotify token expired or revoked.");
    await disconnectSpotify(userId); // Clean up dead session
    throw new Error("Spotify session expired. Please reconnect your account.");
  }

  if (!response.ok) {
    throw new Error(
      `Unable to read Spotify playback (Status: ${response.status})`,
    );
  }

  const data = await response.json();
  const item = data.item;
  if (!item || item.type !== "track") return null;

  const currentTrack = {
    id: item.id,
    name: item.name,
    artist: item.artists.map((artist) => artist.name).join(", "),
    album: item.album.name,
    imageUrl: item.album.images?.[0]?.url || "",
    spotifyUrl: item.external_urls?.spotify || "",
    isPlaying: Boolean(data.is_playing),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, "users", userId), { currentTrack }, { merge: true });
  return currentTrack;
};

export const disconnectSpotify = async (userId) => {
  await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
  if (userId) {
    await setDoc(
      doc(db, "users", userId),
      { currentTrack: null },
      { merge: true },
    );
  }
};
