// Supabase Yapılandırması
const SUPABASE_URL = 'https://iyxicqjkquyyjeztulek.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4n9Ii53f3uWvbaL6AkgcHw_2x-lBdMk';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Partikül Efekti
function createParticles() {
  const bgAnimation = document.querySelector('.bg-animation');
  if (!bgAnimation) return;
  
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
    bgAnimation.appendChild(particle);
  }
}

// Scroll Animasyonu
function initScrollAnimations() {
  const elements = document.querySelectorAll('.scroll-animate');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  
  elements.forEach(el => observer.observe(el));
}

// Mouse Parallax Efekti
function initMouseParallax() {
  document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.urun-kart, .kategori-kart');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const cardX = (rect.left + rect.width / 2) / window.innerWidth;
      const cardY = (rect.top + rect.height / 2) / window.innerHeight;
      
      const deltaX = (x - cardX) * 10;
      const deltaY = (y - cardY) * 10;
      
      card.style.transform = `perspective(1000px) rotateY(${deltaX}deg) rotateX(${-deltaY}deg)`;
    });
  });
}

// Sepet İşlemleri
let sepet = JSON.parse(localStorage.getItem('sepet')) || [];

function sepetiKaydet() {
  localStorage.setItem('sepet', JSON.stringify(sepet));
  sepetSayisiniGuncelle();
}

function sepetSayisiniGuncelle() {
  const sayiEl = document.getElementById('sepet-sayisi');
  if (sayiEl) {
    sayiEl.textContent = sepet.reduce((toplam, item) => toplam + item.adet, 0);
    sayiEl.style.animation = 'none';
    sayiEl.offsetHeight;
    sayiEl.style.animation = 'pulseBadge 0.3s ease';
  }
}

function sepeteEkle(urun) {
  const mevcut = sepet.find(item => item.id === urun.id);
  if (mevcut) {
    mevcut.adet++;
  } else {
    sepet.push({ ...urun, adet: 1 });
  }
  sepetiKaydet();
  
  // Animasyonlu bildirim
  const bildirim = document.createElement('div');
  bildirim.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: linear-gradient(135deg, #4caf50, #66bb6a);
    color: white;
    padding: 20px 30px;
    border-radius: 15px;
    box-shadow: 0 10px 40px rgba(76, 175, 80, 0.4);
    z-index: 1000;
    animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
  `;
  bildirim.innerHTML = '<span style="font-size: 24px;">✓</span> Ürün sepete eklendi!';
  document.body.appendChild(bildirim);
  
  setTimeout(() => {
    bildirim.style.animation = 'slideOutRight 0.5s ease';
    setTimeout(() => bildirim.remove(), 500);
  }, 2500);
}

function sepettekiUrunuSil(urunId) {
  const kart = document.querySelector(`[data-urun-id="${urunId}"]`);
  if (kart) {
    kart.style.animation = 'fadeOut 0.5s ease';
    setTimeout(() => {
      sepet = sepet.filter(item => item.id !== urunId);
      sepetiKaydet();
      sepetiGoster();
    }, 500);
  } else {
    sepet = sepet.filter(item => item.id !== urunId);
    sepetiKaydet();
    sepetiGoster();
  }
}

function urunAdetiniDegistir(urunId, fark) {
  const urun = sepet.find(item => item.id === urunId);
  if (urun) {
    urun.adet += fark;
    if (urun.adet <= 0) {
      sepettekiUrunuSil(urunId);
    } else {
      sepetiKaydet();
      sepetiGoster();
    }
  }
}

// Ürünleri Getir
async function urunleriGetir() {
  const { data, error } = await supabaseClient
    .from('urunler')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Ürünler yüklenirken hata:', error);
    return [];
  }
  return data;
}

// Ürünleri Göster
async function urunleriGoster() {
  const container = document.getElementById('urun-listesi');
  if (!container) return;

  container.innerHTML = '<div style="text-align:center; grid-column:1/-1; padding:3rem;"><div class="loading"></div> Ürünler yükleniyor...</div>';
  
  const urunler = await urunleriGetir();
  
  if (urunler.length === 0) {
    container.innerHTML = '<p style="text-align:center; grid-column:1/-1; padding:3rem;">Henüz ürün bulunmuyor.</p>';
    return;
  }

  container.innerHTML = urunler.map((urun, index) => `
    <div class="urun-kart scroll-animate" style="animation-delay: ${index * 0.1}s" data-urun-id="${urun.id}">
      <img src="${urun.resim_url || 'https://via.placeholder.com/300x280?text=Ürün'}" alt="${urun.ad}">
      ${urun.stok > 0 ? '<span class="urun-badge">Stokta</span>' : '<span class="urun-badge" style="background:linear-gradient(135deg,#999,#777);">Tükendi</span>'}
      <div class="urun-favori" onclick="favoriEkle(${urun.id})">
        <i class="far fa-heart"></i>
      </div>
      <div class="urun-bilgi">
        <div class="urun-kategori">${urun.kategori || 'Genel'}</div>
        <h3 class="urun-ad">${urun.ad}</h3>
        <div class="urun-fiyat">
          <span class="fiyat-yeni">${urun.fiyat} ₺</span>
        </div>
        <p class="urun-stok ${urun.stok <= 0 ? 'tukendi' : ''}">
          ${urun.stok > 0 ? `<span style="color:var(--success);">●</span> Stok: ${urun.stok} adet` : '<span style="color:var(--danger);">●</span> Stokta yok'}
        </p>
        ${urun.stok > 0 ? `
          <button class="btn btn-kucuk urun-ekle" onclick='sepeteEkle(${JSON.stringify(urun)})'>
            Sepete Ekle
          </button>
        ` : `
          <button class="btn btn-kucuk urun-ekle" disabled style="background:linear-gradient(135deg,#555,#444); cursor:not-allowed; opacity:0.6;">
            Stokta Yok
          </button>
        `}
      </div>
    </div>
  `).join('');
  
  initScrollAnimations();
}

// Sepeti Göster
function sepetiGoster() {
  const container = document.getElementById('sepet-listesi');
  const toplamEl = document.getElementById('sepet-toplam');
  if (!container) return;

  if (sepet.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:4rem; background:linear-gradient(145deg, #1e1e32, #151528); border-radius:20px; border:1px solid var(--border);">
        <div style="font-size:5rem; margin-bottom:1rem; opacity:0.3;">🛒</div>
        <p style="font-size:1.2rem; color:var(--text-light);">Sepetiniz boş</p>
        <a href="urunler.html" class="btn" style="margin-top:1.5rem;">Alışverişe Başla</a>
      </div>
    `;
    if (toplamEl) toplamEl.textContent = 'Toplam: 0 ₺';
    return;
  }

  container.innerHTML = sepet.map(item => `
    <div class="sepet-item" data-urun-id="${item.id}">
      <div class="sepet-item-bilgi">
        <img src="${item.resim_url || 'https://via.placeholder.com/90x90?text=Ürün'}" alt="${item.ad}" class="sepet-item-resim">
        <div>
          <div class="sepet-item-ad">${item.ad}</div>
          <div class="sepet-item-fiyat">${item.fiyat} ₺</div>
        </div>
      </div>
      <div class="sepet-adet">
        <button class="btn-adet" onclick="urunAdetiniDegistir(${item.id}, -1)">−</button>
        <span>${item.adet}</span>
        <button class="btn-adet" onclick="urunAdetiniDegistir(${item.id}, 1)">+</button>
      </div>
      <button class="btn-sil" onclick="sepettekiUrunuSil(${item.id})">
        ✕
      </button>
    </div>
  `).join('');

  const toplam = sepet.reduce((sum, item) => sum + (item.fiyat * item.adet), 0);
  if (toplamEl) toplamEl.textContent = `Toplam: ${toplam.toFixed(2)} ₺`;
}

// Favori Ekle
function favoriEkle(urunId) {
  const bildirim = document.createElement('div');
  bildirim.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: linear-gradient(135deg, #ff9800, #ffb74d);
    color: white;
    padding: 20px 30px;
    border-radius: 15px;
    box-shadow: 0 10px 40px rgba(255, 152, 0, 0.4);
    z-index: 1000;
    animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
  `;
  bildirim.innerHTML = '<span style="font-size: 24px;">❤️</span> Favorilere eklendi!';
  document.body.appendChild(bildirim);
  
  setTimeout(() => {
    bildirim.style.animation = 'slideOutRight 0.5s ease';
    setTimeout(() => bildirim.remove(), 500);
  }, 2000);
}

// Animasyon Stilleri
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(150%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(150%); opacity: 0; }
  }
  @keyframes fadeOut {
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0; transform: scale(0.8); }
  }
  @keyframes pulseBadge {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }
  .loading {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Sayfa Yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  initScrollAnimations();
  initMouseParallax();
  sepetSayisiniGuncelle();
  
  if (document.getElementById('urun-listesi')) {
    urunleriGoster();
  }
  
  if (document.getElementById('sepet-listesi')) {
    sepetiGoster();
  }
});
