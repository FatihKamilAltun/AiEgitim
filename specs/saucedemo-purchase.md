# SauceDemo E-Ticaret Satın Alma — Test Planı

## Uygulama ve kapsam

- **Uygulama:** [SauceDemo](https://www.saucedemo.com)
- **Amaç:** `standard_user` ile girişten sipariş onayına kadar temel satın alma akışını doğrulamak.
- **Kapsam:** Giriş, fiyata göre artan sıralama, ilk iki ürünü sepete ekleme, sepet doğrulaması, checkout formu ve sipariş onayı.
- **Kapsam dışı:** Ödeme sağlayıcısı entegrasyonu, görsel regresyon ve farklı kullanıcı rolleri.

## Ortak ön koşullar ve test verileri

- Her senaryo yeni tarayıcı oturumunda başlatılır; testler birbirinden bağımsızdır.
- Pozitif akış için kullanıcı adı `standard_user`, parola `secret_sauce` kullanılır.
- Ürün kataloğunun varsayılan verisinde fiyata göre düşükten yükseğe ilk iki ürün:
  1. `Sauce Labs Onesie` — `$7.99`
  2. `Sauce Labs Bike Light` — `$9.99`
- Checkout için geçerli örnek bilgiler: ad `Ada`, soyad `Lovelace`, posta kodu `12345`.
- Testler demo uygulamasının sabit ürün verilerine dayanır. Ürün veya fiyat kataloğu değişirse test verileri yeniden doğrulanmalıdır.

## Locator stratejisi

Öncelik kullanıcıya görünen, erişilebilir locator'lardadır:

| Öğe | Önerilen locator |
|---|---|
| Kullanıcı adı | `getByRole('textbox', { name: 'Username' })` veya `getByPlaceholder('Username')` |
| Parola | `getByRole('textbox', { name: 'Password' })` veya `getByPlaceholder('Password')` |
| Giriş düğmesi | `getByRole('button', { name: 'Login' })` |
| Ürün sıralama seçimi | `getByRole('combobox', { name: 'Sort' })`; seçenek olarak `Price (low to high)` |
| Ürün adı | `getByRole('link', { name: ürün adı })` |
| Ürün ekleme düğmesi | `getByRole('button', { name: 'Add to cart' }).nth(indeks)`; sıralı listeyle birlikte kullan |
| Sepet bağlantısı | `getByRole('link', { name: /shopping cart/i })` |
| Sepetteki ürün | `getByText(ürün adı, { exact: true })`; miktar ve fiyatı görünür metinlerden doğrula |
| Checkout düğmeleri | `getByRole('button', { name: 'Checkout' \| 'Continue' \| 'Finish' })` |
| Checkout alanları | `getByRole('textbox', { name: 'First Name' \| 'Last Name' \| 'Zip/Postal Code' })` |
| Sipariş onayı | `getByText('Thank you for your order!', { exact: true })` |

Erişilebilir adlar uygulamanın gerçek erişilebilirlik ağacında farklıysa görünen etiketler temel alınmalıdır. Test ID yalnızca uygun kullanıcıya dönük locator bulunmadığında ve uygulama tarafından sağlanıyorsa tercih edilmelidir. Kırılgan CSS/XPath seçicileri kullanılmamalıdır.

## Senaryo matrisi

### SD-01 — Fiyatı artan ilk iki ürünü satın alma

**Tür:** Pozitif / Uçtan uca

**Arrange**
1. SauceDemo giriş sayfasını aç.
2. `standard_user` ve `secret_sauce` bilgileriyle oturum aç.

**Act**
1. Ürün sıralamasını `Price (low to high)` olarak değiştir.
2. Sıralanmış listede ilk ürün olan `Sauce Labs Onesie` ürününü sepete ekle.
3. İkinci ürün olan `Sauce Labs Bike Light` ürününü sepete ekle.
4. Sepet simgesini seçerek sepete git.
5. Checkout'u başlat, ad, soyad ve posta kodu alanlarını geçerli değerlerle doldur ve `Continue` düğmesini seç.
6. Sipariş özeti doğruysa `Finish` düğmesini seç.

**Assert**
- Giriş başarılı olur; ürünler sayfası ve ürün listesi görünür.
- Fiyat sıralaması artandır; ilk iki ürün yukarıdaki ad ve fiyatlarla eşleşir.
- Her iki ürün sepete eklendikten sonra sepet sayacı `2` olur.
- Sepette yalnızca `Sauce Labs Onesie` ve `Sauce Labs Bike Light` bulunur; her birinin miktarı `1`, fiyatları sırasıyla `$7.99` ve `$9.99` olur.
- Checkout bilgi adımındaki alanlar girilen değerleri kabul eder ve devam edilir.
- Özet sayfasında her iki ürün, miktarları ve fiyatları görünür; ürün ara toplamı `$17.98` olur. Vergi ve toplam, gösterilen değerlerle tutarlı biçimde hesaplanır.
- `Finish` sonrasında sipariş tamamlanma başlığı `Thank you for your order!` görünür; başarı mesajı veya tamamlanma görseli siparişin verildiğini doğrular.

### SD-02 — Geçersiz kullanıcı bilgileriyle girişin reddedilmesi

**Tür:** Negatif

**Arrange**
1. Giriş sayfasını aç.

**Act**
1. Hatalı bir parola ile geçerli kullanıcı adı girerek `Login` düğmesini seç.

**Assert**
- Oturum açılmaz ve ürünler sayfasına geçilmez.
- Giriş formunda anlaşılır bir hata mesajı görünür.
- Hata durumu sonrası kullanıcı adı ve parola alanları yeniden düzenlenebilir.

### SD-03 — Ürün sıralamasını artan fiyata göre uygulama

**Tür:** Pozitif / Sınır

**Arrange**
1. `standard_user` ile giriş yap ve ürünler sayfasını aç.

**Act**
1. Sıralama kutusundan `Price (low to high)` seç.
2. Görünen ürün kartlarının fiyatlarını baştan sona kontrol et.

**Assert**
- Ürün kartları artan fiyat sırasındadır; hiçbir ürünün fiyatı kendisinden önceki ürünün fiyatından düşük değildir.
- Aynı fiyatlı ürünler varsa aralarındaki sıra ayrıca sabitlenmez.
- İlk iki ürün `Sauce Labs Onesie` (`$7.99`) ve `Sauce Labs Bike Light` (`$9.99`) olur.
- Sıralamayı değiştirmek ürünleri sepete eklemez veya sepet sayacını değiştirmez.

### SD-04 — Sepet boşken checkout başlatılamaması

**Tür:** Negatif / Sınır

**Arrange**
1. `standard_user` ile giriş yap ve boş sepeti aç.

**Act**
1. Boş sepetin görünümünü doğrula.

**Assert**
- Sepette ürün bulunmaz ve ürün sayacı görünmüyorsa sıfır ürünlü durumu doğrulanır.
- Sepet görünümünde sipariş özeti veya sipariş onay mesajı bulunmaz.
- Bu senaryo, boş sepetten sipariş tamamlanabileceği varsayımında bulunmaz; sipariş yalnızca ürünlü sepet akışında doğrulanır.

### SD-05 — Checkout zorunlu alan doğrulaması

**Tür:** Negatif / Sınır

**Arrange**
1. `standard_user` ile giriş yap ve sepete bir ürün ekle.
2. Sepetten checkout bilgi adımına ilerle.

**Act**
1. Tüm alanları boş bırakıp `Continue` düğmesini seç.
2. Ardından yalnızca ad alanını doldurup tekrar devam etmeyi dene.

**Assert**
- Zorunlu alanlar tamamlanmadan sipariş özeti aşamasına geçilmez.
- Eksik alan için kullanıcıya görünür doğrulama mesajı gösterilir.
- Form hatası ürünün sepetten silinmesine veya sipariş onayı oluşmasına neden olmaz.

### SD-06 — Sipariş özeti ve geri dönüşte sepet içeriğinin korunması

**Tür:** Pozitif / Sınır

**Arrange**
1. `standard_user` ile giriş yap, düşükten yükseğe sıralama uygula ve ilk iki ürünü sepete ekle.
2. Checkout bilgi adımını geçip sipariş özeti sayfasına ilerle.

**Act**
1. Sipariş özetindeki ürün ve tutarları doğrula.
2. Tarayıcı geri dönüşüyle sepet veya bilgi adımına dön.

**Assert**
- Sipariş özeti iki ürünü, doğru miktarları ve `$17.98` ara toplamı gösterir; toplam, ara toplam ve vergiyle tutarlıdır.
- Geri dönüşte ürünler ve miktarları korunur.
- `Finish` seçilmeden sipariş onayı görünmez.

## Tamamlanma ölçütü

SD-01 akışı baştan sona başarıyla tamamlanmalı; negatif ve sınır senaryolarında uygulama siparişin yanlışlıkla tamamlanmasına izin vermemelidir. Her senaryo beklenen kullanıcıya dönük sonuçları ve sepet/sipariş verilerinin tutarlılığını doğrulamalıdır.
