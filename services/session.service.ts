import { supabase } from "@/lib/supabase";

const SESSION_TOKEN_KEY =
  "aknur_student_session_token";

function getOrCreateSessionToken() {
  if (typeof window === "undefined") {
    return "";
  }

  let token = localStorage.getItem(
    SESSION_TOKEN_KEY
  );

  if (!token) {
    token = crypto.randomUUID();

    localStorage.setItem(
      SESSION_TOKEN_KEY,
      token
    );
  }

  return token;
}

function getBrowserName() {
  if (typeof navigator === "undefined") {
    return "Белгісіз браузер";
  }

  const userAgent = navigator.userAgent;

  if (userAgent.includes("Edg/")) {
    return "Microsoft Edge";
  }

  if (userAgent.includes("Chrome/")) {
    return "Google Chrome";
  }

  if (userAgent.includes("Firefox/")) {
    return "Mozilla Firefox";
  }

  if (
    userAgent.includes("Safari/") &&
    !userAgent.includes("Chrome/")
  ) {
    return "Safari";
  }

  return "Белгісіз браузер";
}

function getOperatingSystem() {
  if (typeof navigator === "undefined") {
    return "Белгісіз жүйе";
  }

  const userAgent = navigator.userAgent;

  if (userAgent.includes("Windows")) {
    return "Windows";
  }

  if (
    userAgent.includes("iPhone") ||
    userAgent.includes("iPad")
  ) {
    return "iOS";
  }

  if (userAgent.includes("Android")) {
    return "Android";
  }

  if (userAgent.includes("Mac OS")) {
    return "macOS";
  }

  if (userAgent.includes("Linux")) {
    return "Linux";
  }

  return "Белгісіз жүйе";
}

function getDeviceName() {
  if (typeof navigator === "undefined") {
    return "Белгісіз құрылғы";
  }

  const userAgent = navigator.userAgent;

  if (
    userAgent.includes("iPhone") ||
    userAgent.includes("Android") ||
    userAgent.includes("Mobile")
  ) {
    return "Телефон";
  }

  if (userAgent.includes("iPad")) {
    return "Планшет";
  }

  return "Компьютер";
}

export async function registerStudentSession(
  studentId: number,
  authUserId: string
) {
  const sessionToken =
    getOrCreateSessionToken();

  if (!sessionToken) {
    throw new Error(
      "Сессия токені жасалмады."
    );
  }

  const { error } = await supabase
    .from("student_sessions")
    .upsert(
      {
        student_id: studentId,
        auth_user_id: authUserId,
        session_token: sessionToken,
        device_name: getDeviceName(),
        browser_name: getBrowserName(),
        operating_system:
          getOperatingSystem(),
        current_path:
          window.location.pathname,
        is_active: true,
        last_seen_at:
          new Date().toISOString(),
        logged_out_at: null,
      },
      {
        onConflict: "session_token",
      }
    );

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateStudentSession(
  currentPath: string,
  currentVideoId?: number
) {
  const sessionToken =
    getOrCreateSessionToken();

  if (!sessionToken) {
    return;
  }

  const updateData: {
    current_path: string;
    last_seen_at: string;
    is_active: boolean;
    current_video_id?: number;
  } = {
    current_path: currentPath,
    last_seen_at: new Date().toISOString(),
    is_active: true,
  };

  if (currentVideoId !== undefined) {
    updateData.current_video_id =
      currentVideoId;
  }

  const { error } = await supabase
    .from("student_sessions")
    .update(updateData)
    .eq("session_token", sessionToken);

  if (error) {
    console.error(
      "Сессияны жаңарту қатесі:",
      error
    );
  }
}

export async function closeStudentSession() {
  const sessionToken =
    getOrCreateSessionToken();

  if (!sessionToken) {
    return;
  }

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("student_sessions")
    .update({
      is_active: false,
      last_seen_at: now,
      logged_out_at: now,
    })
    .eq("session_token", sessionToken);

  if (error) {
    console.error(
      "Сессияны жабу қатесі:",
      error
    );
  }
}