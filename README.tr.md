# CanoMind

**Hafif ve çok platformlu bir zihin haritası ve diyagram editörü.**
Zihin haritaları, akış şemaları, organizasyon şemaları, Gantt planları ve daha fazlası, tek bir hızlı masaüstü uygulamasında.

`100% Free` `Windows` `macOS` `Linux` `License: MIT` `Status: v0.9.0`

#### [Click for English](README.md)

## Ekran Görüntüleri
<img width="800" alt="Canomind 0 4 0 screenshot" src="https://github.com/user-attachments/assets/bbac6ff8-42f1-4276-9bc4-08c2a30501b7" />
<img width="400" alt="Ekran görüntüsü 2026-11-15 175254" src="https://github.com/user-attachments/assets/1981d986-7b21-467e-9969-8b656aa5e569" />
<img width="400" alt="Ekran görüntüsü 2026-11-15 175322" src="https://github.com/user-attachments/assets/e875a5f7-c7fe-4fcd-b9a5-bd1053132f52" />
<img width="400" alt="Ekran görüntüsü 2026-11-15 175351" src="https://github.com/user-attachments/assets/7ca940cd-3963-42fb-8894-e8c9af48995d" />
<img width="400" alt="Ekran görüntüsü 2026-11-15 175415" src="https://github.com/user-attachments/assets/40abae39-f6a4-422a-9ba0-c2353071283c" />

---

## Genel bakış

CanoMind, Visio, XMind, MindManager ve Gantt araçlarının üretim gücünü modern, Office tarzı bir arayüzde birleştirir. [Tauri](https://tauri.app) ile geliştirildiği için küçük, hızlı ve Windows, macOS ve Linux'ta yereldir.

## Özellikler

### Oluştur
- **Tek tıkla zihin haritası:** bir kutuyu seçip **+** ile bağlı alt konu ekle ya da **+** işaretini başka bir kutuya sürükleyerek bağla. Alt konular otomatik numaralanır (1, 1.1, 1.1.1).
- **30'dan fazla şekil**, ayrıca akış şeması, ok ve balon setleri. Sürükle-bırak ya da tıklayarak yerleştirilir.
- **Tablolar, grafikler** (sütun, çubuk, çizgi, pasta, halka, alan), **yapılacak kutuları**, not defteri, yapışkan not, görsel ve bağlantılar.
- **Kutu içinde not ve görsel.** Kutular büyüyerek hiçbir yazının dışarı taşmasını önler.
- **Şablonlar:** zihin haritası, yapılacaklar listesi, etkinlik planlayıcı, SWOT, Eisenhower matrisi, artılar ve eksiler, iş modeli tuvali, Kanban, balık kılçığı, akış şeması, organizasyon şeması, Gantt planı ve zaman çizelgesi.
- **Otomatik yerleşim:** yatay ya da dikey (organizasyon şeması düzeni), bulunduğu yerde uygulanır.

### Düzenle
- **Office tarzı ribbon.** Pencere küçüldükçe gruplar açılır menülere dönüşür.
- **Zengin metin:** yalnızca seçili kelimeleri biçimlendir (kalın, italik, renk, boyut, yazı tipi), madde işareti ve numaralandırma, sistem fontları.
- **Yazım ve dil bilgisi denetimi:** 35 dilde, çevrimdışı çalışır. Word'e benzer seçenekler sunar.
- Dolgu, çizgi ve saydamlık ayarları. Eklenebilen, silinebilen ve sıralanabilen hızlı stiller ve renk şemaları.
- Hizalama, gruplama, kilitleme, biçim boyacısı, geri alma ve yineleme, sağ tık menüsü.

### Düzenle ve yönet
- **Sekmeli çoklu dosya** ve **dosya içinde çoklu sayfa**, sayfa renkleriyle.
- **Sayfa ayarı:** A ve B serileri, HD'den 8K'ya ekran boyutları ya da özel boyut, dikey veya yatay.
- Sayfa boyutu işaretli cetvel, dört grid türü, arka plan rengi ve görselleri.
- **Gezinti bölmesi:** haritan liste olarak görünür, arama yapılabilir.
- Her kutuya yorum eklenebilir.

### Sun ve paylaş
- **Sunum modu:** her kutu bir sayfa, görseller üstte, notlar altta.
- Tam ekran modu ve yazdırma.
- **Açma ve içe aktarma:** `.canomind`, XMind (`.xmind`), FreeMind (`.mm`), Visio (`.vsdx`, temel).
- **Kaydetme ve dışa aktarma:** `.canomind`, XMind, FreeMind, Visio, PDF (vektör, seçilebilir yazı), Markdown, PNG, JPG, SVG, JSON.

### Sana göre ayarla
- Temalar: açık, sepya, koyu ve siyah.
- Arayüz dilleri: İngilizce ve Türkçe. Yazım denetimi dili ayrıdır.
- Ayarlanabilir arayüz ölçeği ve Enter tuşu davranışı.

## Klavye kısayolları

| İşlem | Kısayol |
|---|---|
| Yeni, aç, kaydet, farklı kaydet | `Ctrl+N`, `Ctrl+O`, `Ctrl+S`, `Ctrl+Shift+S` |
| Alt konu ekle, kardeş konu ekle | `Tab`, `Enter` |
| Metni düzenle | `F2` veya çift tık |
| Tüm kutuları, tüm çizgileri seç | `Ctrl+A`, `Shift+A` |
| Kopyala, kes, yapıştır, çoğalt | `Ctrl+C`, `Ctrl+X`, `Ctrl+V`, `Ctrl+D` |
| Geri al, yinele | `Ctrl+Z`, `Ctrl+Y` |
| Kaydırma | orta tuş, `Alt`+sürükle, `Shift`+tekerlek |
| Yakınlaştırma | `Ctrl`+tekerlek |
| Sunum | `F5` |

## Başlarken

**Gereksinimler:** [Node.js](https://nodejs.org) 18+, [Rust](https://rustup.rs) ve sisteminiz için [Tauri ön koşulları](https://tauri.app/start/prerequisites/).

```bash
git clone https://github.com/canomorph/canomind.git
cd canomind
npm install
npm run tauri dev      # geliştirme modunda çalıştır
npm run tauri build    # kurulum dosyalarını üret (Windows'ta MSI ve NSIS)
```

`npm install` ayrıca yazım denetimi sözlüklerini indirip `public/dict` klasörüne kopyalar.

## Teknolojiler

Tauri 2 (Rust) · React · TypeScript · Vite · Zustand · pdf-lib · JSZip · nspell (Hunspell)

## Notlar

- Visio desteği şekilleri, yazıları ve bağlayıcıları kapsar, Visio'nun tüm özelliklerini değil.
