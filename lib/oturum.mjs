// ============================================================
//  OTURUM — imzalı çerez (express-session yerine)
//  Vercel fonksiyonları stateless. Çerezi HMAC ile imzalıyoruz.
// ============================================================

import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_AD = "tavaci_panel";
const SURE_MS = 1000 * 60 * 60 * 8; // 8 saat

function gizli() {
  const s = process.env.COOKIE_SECRET;
  if (!s || s.length < 16) throw new Error("COOKIE_SECRET en az 16 karakter olmalı");
  return s;
}

function imzala(govde) {
  return createHmac("sha256", gizli()).update(govde).digest("base64url");
}

export function cerezOlustur() {
  const gov = Buffer.from(JSON.stringify({ exp: Date.now() + SURE_MS })).toString("base64url");
  const imza = imzala(gov);
  const deger = `${gov}.${imza}`;
  return `${COOKIE_AD}=${deger}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${SURE_MS / 1000}`;
}

export function cerezSil() {
  return `${COOKIE_AD}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}

export function girisliMi(req) {
  const cookieBasligi = req.headers?.cookie || "";
  const cerezler = Object.fromEntries(
    cookieBasligi.split(/;\s*/).filter(Boolean).map((p) => {
      const i = p.indexOf("=");
      return i < 0 ? [p, ""] : [p.slice(0, i), p.slice(i + 1)];
    })
  );
  const deger = cerezler[COOKIE_AD];
  if (!deger) return false;
  const [gov, imza] = deger.split(".");
  if (!gov || !imza) return false;
  let beklenen;
  try {
    beklenen = imzala(gov);
  } catch {
    return false;
  }
  const a = Buffer.from(imza);
  const b = Buffer.from(beklenen);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(gov, "base64url").toString("utf8"));
    return Date.now() < exp;
  } catch {
    return false;
  }
}

export function sifreDogru(verilen) {
  const beklenen = process.env.ADMIN_SIFRE || "";
  if (!beklenen || !verilen) return false;
  const a = Buffer.from(String(verilen));
  const b = Buffer.from(beklenen);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
