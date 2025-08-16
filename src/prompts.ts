export interface PromptParams {
  topic: string;
  lang: string;
  tone: string;
  targetWords?: number;
  continuation?: boolean;
}

const LANGUAGE_NAMES: Record<string, string> = {
  id: "Indonesia",
  en: "Inggris",
};

const TONE_DESCRIPTIONS: Record<string, Record<string, string>> = {
  id: {
    netral: "netral dan informatif",
    formal: "formal dan akademis",
    santai: "santai dan mudah dipahami",
    persuasif: "persuasif dan meyakinkan",
    naratif: "naratif dan bercerita",
  },
  en: {
    netral: "neutral and informative",
    formal: "formal and academic",
    santai: "casual and easy to understand",
    persuasif: "persuasive and convincing",
    naratif: "narrative and storytelling",
  },
};

export function buildSeriousPrompt(
  topic: string,
  lang: string,
  tone: string,
  targetWords: number
): string {
  const langName = LANGUAGE_NAMES[lang] || "Indonesia";
  const toneDesc =
    TONE_DESCRIPTIONS[lang]?.[tone] ??
    TONE_DESCRIPTIONS["id"]?.[tone] ??
    "netral";

  const systemPrompt = `Kamu adalah asisten penulis yang menghasilkan esai dalam Bahasa ${langName} dengan struktur rapi, paragraf mengalir, dan nada sesuai instruksi. Hindari daftar bullet dan data/angka spekulatf, hindari kata hubung "-", hindari kata bercetak tebal, awal paragraf jangan gunakan kata hubung atau konjungsi, Tulis alami sesuai kebiasaan penulisan ${langName}.`;

  const userPrompt = `Topik: "${topic}"
Bahasa: ${langName}
Nada: ${toneDesc}
Target: ~${targetWords} kata

Instruksi:
1) Struktur:
   - Pendahuluan (1 paragraf)
   - Pembahasan (2–4 paragraf)
   - Penutup (1 paragraf)
2) Jangan gunakan bullet/penomoran.
3) Gunakan paragraf mengalir.
4) Sertakan contoh yang relevan dengan konteks ${langName} bila cocok.
5) Jangan menambahkan referensi palsu/tautan.
Keluarkan hanya isi esai (tanpa judul/penanda tambahan).`;

  return `${systemPrompt}\n\n${userPrompt}`;
}

export function buildInfinitePrompt(
  topic: string,
  lang: string,
  tone: string,
  continuation: boolean
): string {
  const langName = LANGUAGE_NAMES[lang] || "Indonesia";
  const toneDesc =
    TONE_DESCRIPTIONS[lang]?.[tone] ??
    TONE_DESCRIPTIONS["id"]?.[tone] ??
    "netral";

  if (!continuation) {
    return `Tulis paragraf pertama esai dalam Bahasa ${langName} tentang: '${topic}'.
Nada: ${toneDesc}. Panjang paragraf: ±80–120 kata. Hindari bullet.
Jangan menutup esai; akhiri dengan pembahasan tetap terbuka.`;
  } else {
    return `Lanjutkan esai dari paragraf sebelumnya dalam Bahasa ${langName}.
Nada: ${toneDesc}. Panjang paragraf: ±80–120 kata.
Hindari pengulangan. Jangan menutup esai.`;
  }
}
