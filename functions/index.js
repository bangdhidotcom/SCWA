// 1. Panggil "Suku Cadang" yang kita butuhkan
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");

// 2. Panggil "Tukang Pos" Expo yang baru kita instal
const { Expo } = require("expo-server-sdk");

// Buat "Tukang Pos" baru
const expo = new Expo();

// ========================================================================
// INI ADALAH FUNGSI "PENJAGA OTOMATIS" KITA
// ========================================================================
exports.onLdrChangeSendNotification = onDocumentUpdated(
  "rbw/rbw_utama", // <-- DOKUMEN YANG HARUS "DIDENGAR"
  (event) => {
    // 4. Ambil data SEBELUM dan SESUDAH perubahan
    const dataBefore = event.data.before.data();
    const dataAfter = event.data.after.data();

    // 5. Cek Kondisi: Apakah LDR berubah menjadi "TERANG"?
    if (
      dataBefore.statusLdr !== "TERANG" &&
      dataAfter.statusLdr === "TERANG"
    ) {
      // --- KONDISI TERPENUHI! LDR MENJADI "TERANG" ---
      logger.info("TERDETEKSI KEBOCORAN CAHAYA! Mengirim notifikasi...");

      // 6. GANTI INI DENGAN "ALAMAT TOKEN" ANDA!
      const pushToken = "ExponentPushToken[oaxGvhLAlEnv-ewNFk_Xb8]";

      // 7. Cek apakah token-nya valid
      if (!Expo.isExpoPushToken(pushToken)) {
        logger.error(`Token ${pushToken} tidak valid.`);
        return;
      }

      // 8. Siapkan "Surat" (Notifikasi)
      const message = {
        to: pushToken,
        sound: "default",
        title: "PERINGATAN SCWA!",
        body: "Terdeteksi kebocoran cahaya di dalam RBW!",
        data: { someData: "goes here" },
      };

      // 9. KIRIM "Surat" menggunakan "Tukang Pos" Expo
      return expo.sendPushNotificationsAsync([message])
        .then((ticket) => {
          logger.info("Notifikasi terkirim:", ticket);
          return;
        })
        .catch((error) => {
          logger.error("Error mengirim notifikasi:", error);
          return;
        });

    } else {
      // Jika LDR tidak berubah, atau berubah jadi "GELAP",
      // "Penjaga" tidak melakukan apa-apa.
      logger.info("Perubahan data LDR aman, tidak ada notifikasi.");
      return;
    }
  },
);