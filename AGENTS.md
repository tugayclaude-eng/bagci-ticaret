# AGENTS.md

## Project

E-ticaret web sitesi - HTML, CSS, JavaScript ve Supabase ile

## Setup

- Supabase projesi: `https://iyxicqjkquyyjeztulek.supabase.co`
- Yerel sunucu: `python -m http.server 8000`

## Commands

- Veritabanı tabloları: Supabase SQL Editor'da çalıştırılacak
- Test: Tarayıcıda `http://localhost:8000` adresi

## Architecture

```
/
├── index.html          # Ana sayfa (öne çıkan ürünler)
├── urunler.html        # Tüm ürünler listesi
├── sepet.html          # Alışveriş sepeti
├── odeme.html          # Ödeme sayfası
├── giris.html          # Giriş sayfası
├── kayit.html          # Kayıt sayfası
├── css/
│   └── style.css       # Tüm stiller
├── js/
│   └── app.js          # Supabase ve ana mantık
└── AGENTS.md
```

## Conventions

- Supabase anon key: `sb_publishable_4n9Ii53f3uWvbaL6AkgcHw_2x-lBdMk`
- Sepet verileri localStorage'da saklanır
- Kullanıcı oturumları Supabase Auth ile yönetilir

## Company Info

- Firma Adı: Bağcı Ticaret
- Telefon: 0534 661 2200
- Adres: Bursa Kayapa
- E-posta: tugaybgc@gmail.com
