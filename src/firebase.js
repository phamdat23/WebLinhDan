import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import {
  getRemoteConfig,
  fetchAndActivate,
  getString,
  getBoolean,
  isSupported as isRemoteConfigSupported,
} from "firebase/remote-config";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBtNjamDTGT_RTgXbFZ6Xx0b0cvpffmgUo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "weblinhdan.firebaseapp.com",
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    "https://weblinhdan-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "weblinhdan",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "weblinhdan.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "264842701636",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:264842701636:web:e85437363a5187c4238511",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5XJ053G40H",
};

// Initialize Firebase App & Realtime Database
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app, firebaseConfig.databaseURL);

// Initialize Analytics asynchronously
export let analytics = null;
if (typeof window !== "undefined") {
  isAnalyticsSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((err) => {
      console.warn("Firebase Analytics is not supported in this environment:", err);
    });
}

// Initialize Remote Config asynchronously
export let remoteConfig = null;
if (typeof window !== "undefined") {
  isRemoteConfigSupported()
    .then((supported) => {
      if (supported) {
        remoteConfig = getRemoteConfig(app);
        remoteConfig.settings.minimumFetchIntervalMillis = 0; // Realtime / instant fetch
        remoteConfig.defaultConfig = {
          remote_ip: "",
          enable_remove_category: false,
        };
      }
    })
    .catch((err) => {
      console.warn("Firebase Remote Config is not supported:", err);
    });
}

/**
 * Lấy IP thiết bị của người dùng ngay khi vào web, log ra console và so sánh với key remote_ip trong Remote Config
 */
export const checkAdminAccessByIP = async () => {
  if (typeof window === "undefined") return false;

  let userIp = "";
  const hostname = window.location.hostname.toLowerCase();

  // 1. Lấy IP thiết bị của người dùng lập tức từ API ipify hoặc myip
  try {
    const res = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
    const data = await res.json();
    userIp = (data.ip || "").trim().toLowerCase();
  } catch (err) {
    try {
      const res2 = await fetch("https://api.myip.com", { cache: "no-store" });
      const data2 = await res2.json();
      userIp = (data2.ip || "").trim().toLowerCase();
    } catch (err2) {
      userIp = hostname;
    }
  }

  // 2. Lấy cấu hình remote_ip từ Firebase Remote Config
  let remoteIpStr = "";
  try {
    const supported = await isRemoteConfigSupported();
    if (supported) {
      const rc = getRemoteConfig(app);
      rc.settings.minimumFetchIntervalMillis = 0;
      rc.defaultConfig = {
        remote_ip: "",
        enable_remove_category: false,
      };
      try {
        await fetchAndActivate(rc);
        remoteIpStr = getString(rc, "remote_ip");
      } catch (e) {
        remoteIpStr = getString(rc, "remote_ip") || "";
      }
    }
  } catch (err) {
    console.warn("⚠️ Remote Config fetch notice:", err);
  }

  const allowedIps = (remoteIpStr || "")
    .split(/[\s,;\n]+/)
    .map((ip) => ip.trim().toLowerCase())
    .filter(Boolean);

  // 3. So sánh IP client với danh sách cấu hình remote_ip
  let isAllowed = false;
  if (allowedIps.includes("*") || allowedIps.includes("all") || allowedIps.includes("true")) {
    isAllowed = true;
  } else {
    isAllowed = allowedIps.some((allowed) => {
      if (allowed === userIp || allowed === hostname) return true;
      if (userIp && userIp.startsWith(allowed)) return true;
      if (
        (userIp === "127.0.0.1" || hostname === "localhost") &&
        (allowed === "127.0.0.1" || allowed === "localhost")
      )
        return true;
      return false;
    });
  }

  // 4. Log IP và kết quả kiểm tra nổi bật ra Console để người dùng kiểm tra
  console.log("%c==================================================", "color: #1578E9; font-weight: bold;");
  console.log(
    `🌐 %c[USER DEVICE IP]: %c${userIp || "N/A"} %c(Host: ${hostname})`,
    "color: #1578E9; font-weight: bold;",
    "color: #e11d48; font-weight: bold; font-size: 14px;",
    "color: #64748b;"
  );
  console.log(
    `📡 %c[REMOTE CONFIG remote_ip]: %c"${remoteIpStr}"`,
    "color: #1578E9; font-weight: bold;",
    "color: #16a34a; font-weight: bold; font-size: 13px;"
  );
  console.log(
    `🔒 %c[ADMIN TAB STATUS]: %c${isAllowed ? "✅ HIỂN THỊ (ALLOWED)" : "❌ ẨN (DENIED)"}`,
    "color: #1578E9; font-weight: bold;",
    isAllowed
      ? "color: #16a34a; font-weight: bold; font-size: 14px;"
      : "color: #dc2626; font-weight: bold; font-size: 14px;"
  );
  console.log("%c==================================================", "color: #1578E9; font-weight: bold;");

  return isAllowed;
};

/**
 * Lấy cấu hình boolean enable_remove_category từ Firebase Remote Config
 * Trả về true nếu Remote Config cho phép xóa category, ngược lại trả về false
 */
export const checkRemoveCategoryPermission = async () => {
  if (typeof window === "undefined") return false;

  let isAllowed = false;
  try {
    const supported = await isRemoteConfigSupported();
    if (supported) {
      const rc = getRemoteConfig(app);
      rc.settings.minimumFetchIntervalMillis = 0;
      rc.defaultConfig = {
        remote_ip: "",
        enable_remove_category: false,
      };
      try {
        await fetchAndActivate(rc);
      } catch (e) {
        // use cached / activated config
      }

      const boolVal = getBoolean(rc, "enable_remove_category");
      if (boolVal === true) {
        isAllowed = true;
      } else {
        const strVal = getString(rc, "enable_remove_category");
        if (strVal && (strVal.toLowerCase() === "true" || strVal === "1")) {
          isAllowed = true;
        }
      }
    }
  } catch (err) {
    console.warn("⚠️ Remote Config fetch notice for enable_remove_category:", err);
  }

  console.log(
    `🗑️ %c[REMOTE CONFIG enable_remove_category]: %c${isAllowed ? "✅ TRUE (HIỆN NÚT XÓA CATEGORY)" : "❌ FALSE (ẨN NÚT XÓA CATEGORY)"}`,
    "color: #1578E9; font-weight: bold;",
    isAllowed
      ? "color: #16a34a; font-weight: bold; font-size: 13px;"
      : "color: #dc2626; font-weight: bold; font-size: 13px;"
  );

  return isAllowed;
};

// Tự động kích hoạt lấy và log IP thiết bị ngay khi truy cập trang web
if (typeof window !== "undefined") {
  checkAdminAccessByIP();
  checkRemoveCategoryPermission();
}

export default app;
