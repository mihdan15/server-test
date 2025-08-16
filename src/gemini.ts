import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("Missing GOOGLE_API_KEY/GEMINI_API_KEY in project/.env");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateSeriousContent(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        // Atur agar output tidak terlalu acak (baik untuk konten serius)
        temperature: 0.5,
        // Atur ulang filter keamanan untuk mencegah blokir yang tidak perlu
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          // Anda bisa menambahkan kategori lain jika perlu
        ],
      },
    });
    // Ambil teks dari respons
    const text = response.text;

    // PERBAIKAN: Periksa apakah teks ada sebelum mengembalikannya
    if (text === undefined) {
      // Jika tidak ada teks, anggap sebagai kegagalan
      throw new Error("Model tidak menghasilkan respons teks.");
    }

    // Jika ada, kembalikan teksnya
    return text;
  } catch (error) {
    // Logging error Anda sudah cukup informatif
    console.error("Error generating serious content:", error);
    throw new Error("Gagal menghasilkan konten dari model AI.");
  }
}

export async function* generateInfiniteContent(
  prompt: string
): AsyncGenerator<string> {
  try {
    // 1. Panggil 'generateContentStream' langsung dari 'ai.models'
    const stream = await ai.models.generateContentStream({
      // Gunakan model yang sudah terbukti bekerja untuk akun Anda
      model: "gemini-2.0-flash",

      // Struktur 'contents' Anda sudah benar
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],

      // 2. Tambahkan konfigurasi terpusat di dalam objek 'config'
      config: {
        temperature: 0.7, // Sedikit lebih kreatif untuk streaming
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      },
    });

    // 3. Iterasi langsung pada 'stream', bukan 'stream.stream'
    for await (const chunk of stream) {
      // 4. Akses teks sebagai properti, bukan metode: 'chunk.text'
      // Gunakan '?? ""' untuk menangani kasus undefined dan memastikan yield selalu string
      yield chunk.text ?? "";
    }
  } catch (error) {
    console.error("Error in generateInfiniteContent:", error);
    throw new Error("Gagal melakukan streaming konten dari model AI.");
  }
}

// export async function* generateInfiniteContent(
//   prompt: string
// ): AsyncGenerator<string, void, unknown> {
//   try {
//     const model = genAI.getGenerativeModel({ model: MODEL_NAME });

//     const stream = await model.generateContentStream({
//       contents: [
//         {
//           role: "user",
//           parts: [{ text: prompt }],
//         },
//       ],
//     });

//     for await (const chunk of stream.stream) {
//       const t = chunk.text();
//       if (t) yield t;
//     }
//   } catch (error: any) {
//     console.error("Error generating infinite content:", {
//       message: error?.message,
//       status: error?.status,
//       statusText: error?.statusText,
//       errorDetails: error?.errorDetails,
//     });
//     throw new Error("Failed to generate streaming content");
//   }
// }
