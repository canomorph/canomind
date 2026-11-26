<div align="center">

# CanoMind

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#lisans)
![Sürüm](https://img.shields.io/badge/s%C3%BCr%C3%BCm-1.0.0-blue.svg)
![Platformlar: Windows, macOS, Linux](https://img.shields.io/badge/platformlar-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
[![Tauri ile geliştirildi](https://img.shields.io/badge/geli%C5%9Ftirildi-Tauri%202-24C8DB.svg)](https://tauri.app)

**Hafif, çok platformlu bir zihin haritası ve diyagram editörü.**
Zihin haritaları, akış şemaları, organizasyon şemaları, Gantt planları ve daha fazlası, tek bir hızlı masaüstü uygulamada.

[English](README.md) · Sürüm 1.0.0 · Canomorph Creative tarafından

Genel Bakış · Özellikler · Klavye Kısayolları · Başlarken · Teknoloji Yığını · Notlar · Lisans

</div>

---

## Genel Bakış

CanoMind, Visio, XMind, MindManager ve Gantt araçlarının üretim gücünü modern, Office tarzı bir arayüzle birleştirir. [Tauri](https://tauri.app) ile geliştirilmiştir; bu sayede Windows, macOS ve Linux üzerinde küçük, hızlı ve yerel kalır.

---

## Özellikler

### Oluştur
- **Tek tıkla zihin haritaları:** bir kutu seçip **+** tuşuna basarak bağlı bir alt konu ekleyin ya da **+** işaretini başka bir kutunun üzerine sürükleyerek iki kutuyu bağlayın. Alt konular otomatik olarak numaralandırılır (1, 1.1, 1.1.1).
- **30+ şekil**, ayrıca akış şeması, ok ve açıklama balonu setleri; sürükleyip bırakarak ya da tıklayarak yerleştirilebilir.
- **Yalnızca metinden oluşan zihin haritaları:** üzerine gelindiğinde **+** tutamaçları görünen düz metin öğeleri.
- **Tablolar, grafikler** (sütun, çubuk, çizgi, pasta, halka, alan), **yapılacaklar kutuları**, not defterleri, yapışkan notlar, görseller ve bağlantılar.
- **Kutuların içinde notlar ve görseller**; taşma olmaması için büyüyen kutular.
- **Şablonlar:** zihin haritası, yapılacaklar listesi, etkinlik planlayıcı, SWOT, Eisenhower matrisi, artılar ve eksiler, iş modeli tuvali, Kanban, balık kılçığı, akış şeması, organizasyon şeması, Gantt planı ve zaman çizelgesi.
- **Otomatik düzen:** yatay veya dikey (organizasyon şeması tarzı), yerinde uygulanır.

### Düzenle
- **Office tarzı şerit:** pencere küçüldüğünde zarifçe daralır.
- **Zengin metin:** yalnızca seçili kelimeleri biçimlendirin (kalın, italik, renk, boyut, yazı tipi), madde işareti ve numaralandırma stilleri, sistem yazı tipleri.
- **Yazım ve dilbilgisi denetimi:** 35 dilde çevrimdışı çalışır, Word benzeri seçeneklerle.
- Metin ana hattı ve gölgesi, metin yönü, kutu içinde imleç ve seçim ile canlı düzenleme.
- **Temalar:** tek tıkla her zihin haritasının rengini değiştirin (ana renk ile pastel alt kutular).
- Dolgu, çizgi ve opaklık denetimleri; eklenip silinebilen ve yeniden sıralanabilen hızlı stiller ve renk şemaları.
- Hizalama, gruplama, kilitleme, biçim boyacısı, geri al ve yinele, sağ tık menüsü.

### Yapılandır
- **Birden fazla dosya sekme olarak** ve **dosya başına birden fazla sayfa**, sayfa renkleriyle.
- **Sayfa ayarları:** A ve B serileri, HD'den 8K'ya ekran boyutları veya özel boyut, dikey ya da yatay.
- Sayfa boyutu işaretli cetveller, dört ızgara türü, arka plan rengi ve arka plan görselleri.
- **Gezinme paneli:** haritanız bir ana hat olarak, arama özelliğiyle.
- Herhangi bir kutuya yorum ekleme.
- **Çizim:** kalem, vurgulayıcı, kalınlık ve opaklık ayarlı silgi.

### Sunum ve paylaşım
- **Sunum modu:** her slayt için bir kutu; görseller üstte, notlar altta.
- Tam ekran modu ve yazdırma.
- **Açma ve içe aktarma:** `.canomind`, XMind (`.xmind`), FreeMind (`.mm`), Visio (`.vsdx`, temel), Markdown (`.md`).
- **Kaydetme ve dışa aktarma:** `.canomind`, XMind, FreeMind, Visio, PDF (vektörel, seçilebilir metin), Markdown, PNG, JPG, SVG, JSON.

### Kendinize göre ayarlayın
- Temalar: açık, sepya, koyu ve siyah.
- Arayüz dilleri: İngilizce, Türkçe ve Çince. Yazım denetimi dili ayrıdır.
- Ayarlanabilir arayüz ölçeği ve yapılandırılabilir Enter tuşu davranışı.

---

## Klavye Kısayolları

| Eylem | Kısayol |
|---|---|
| Yeni, aç, kaydet, farklı kaydet | `Ctrl+N`, `Ctrl+O`, `Ctrl+S`, `Ctrl+Shift+S` |
| Alt konu ekle, kardeş ekle | `Tab`, `Enter` |
| Metni düzenle | `F2` veya çift tıklama |
| Tüm kutuları seç, tüm bağlayıcıları seç | `Ctrl+A`, `Shift+A` |
| Kopyala, kes, yapıştır, çoğalt | `Ctrl+C`, `Ctrl+X`, `Ctrl+V`, `Ctrl+D` |
| Geri al, yinele | `Ctrl+Z`, `Ctrl+Y` |
| Kaydır | orta fare tuşu, `Alt`+sürükleme, `Shift`+tekerlek |
| Yakınlaştır | `Ctrl`+tekerlek |
| Sunum | `F5` |

---

## Başlarken

**Gereksinimler:** [Node.js](https://nodejs.org) 18+, [Rust](https://rustup.rs) ve sisteminiz için [Tauri ön koşulları](https://tauri.app/start/prerequisites/).

```bash
git clone https://github.com/canomorph/canomind.git
cd canomind
npm install
npm run tauri dev      # geliştirme modunda çalıştır
npm run tauri build    # kurulum dosyaları oluştur (Windows'ta MSI ve NSIS)
```

`npm install` ayrıca yazım denetimi sözlüklerini indirir ve `public/dict` klasörüne kopyalar.

---

## Teknoloji Yığını

Tauri 2 (Rust) · React · TypeScript · Vite · Zustand · pdf-lib · JSZip · nspell (Hunspell)

---

## Notlar

- MindManager (`.mmap`) desteklenmiyor, çünkü bunu sağlayan herkese açık bir dosya formatı belirtimi yoktur.
- Visio desteği şekilleri, metinleri ve bağlayıcıları kapsar; Visio'nun tüm özelliklerini kapsamaz.

---

## Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır.

Telif hakkı (c) 2026 Canomorph Creative

Aşağıdaki MIT lisans metni, hukuki geçerliliği nedeniyle orijinal İngilizce haliyle verilmiştir.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
