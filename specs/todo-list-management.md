# Todo Listesi Yönetimi — Test Planı

## Uygulama ve kapsam

- **Uygulama:** [TodoMVC](https://demo.playwright.dev/todomvc)
- **Amaç:** Todo ekleme, düzenleme, tamamlama, filtreleme ve silme akışlarının yanı sıra boş girişler ve liste sınır durumlarını doğrulamak.
- **Kapsam dışı:** Uygulamanın kaynak kodu ve tarayıcılar arası görsel farklılıklar.

## Ortak ön koşullar

- Her senaryo bağımsız çalıştırılır ve uygulama boş Todo listesiyle başlatılır.
- Senaryo başına eklenen Todo'lar benzersiz başlıklar kullanır.
- Metin girişinde **Enter** kullanılır; durum ve sayaç kontrolleri değişiklikten sonra yapılır.
- Düzenleme sırasında **Escape**'in değişiklikleri iptal etmesi, boş başlıkla düzenlemenin Todo'yu silmesi beklenir.

## Locator stratejisi

Öncelik kullanıcıya görünen semantik locator'lardır:

| Öğe | Önerilen locator |
|---|---|
| Yeni Todo alanı | `getByRole('textbox', { name: 'What needs to be done?' })` veya `getByPlaceholder('What needs to be done?')` |
| Todo satırı | `getByRole('listitem').filter({ hasText: başlık })` |
| Todo tamamlandı kutusu | Satır içinde `getByRole('checkbox')` |
| Düzenleme alanı | Todo satırı içinde `getByRole('textbox')` |
| Filtreler | `getByRole('link', { name: 'All' \| 'Active' \| 'Completed' })` |
| Tamamlananları temizle | `getByRole('button', { name: 'Clear completed' })` |
| Kalan Todo sayacı | `getByText('1 item left', { exact: true })` veya çoğul karşılığı |
| Tek Todo'yu sil | Satır üzerine gelindikten sonra satır kapsamındaki `getByRole('button')` |
| Tümünü tamamla | `getByRole('checkbox', { name: 'Mark all as complete' })` |

Uygulamanın erişilebilir adı farklıysa önce erişilebilirlik ağacındaki kullanıcıya görünen ad tercih edilmelidir. Test ID yalnızca erişilebilir locator bulunmayan öğelerde ve uygulama tarafından sağlanıyorsa kullanılmalıdır. Kırılgan CSS/XPath seçicileri kullanılmamalıdır.

## Senaryo matrisi

### TLM-01 — Bir veya daha fazla Todo ekleme ve kalan sayısını gösterme

**Tür:** Pozitif

**Arrange**
1. Boş listeyi ve yeni Todo alanını görüntüle.

**Act**
1. Yeni Todo alanına `Buy groceries` yaz ve Enter'a bas.
2. `Call the dentist` başlığını gir ve Enter'a bas.

**Assert**
- Her iki Todo listede girilme sırasıyla görünür.
- İlk eklemeden sonra sayaç `1 item left`, ikinciden sonra `2 items left` gösterir.
- Yeni Todo alanı her eklemeden sonra temizlenir.

### TLM-02 — Boş ve yalnızca boşluk içeren girişleri reddetme

**Tür:** Negatif / Sınır

**Arrange**
1. Boş listeyi görüntüle.

**Act**
1. Yeni Todo alanı boşken Enter'a bas.
2. Alana yalnızca boşluk karakterleri yaz ve Enter'a bas.

**Assert**
- Liste boş kalır ve kalan sayaç değeri sıfır olur.
- Boş veya boşluklardan oluşan bir Todo oluşturulmaz.
- Uygulama hata vermeden yeni giriş kabul edebilir durumda kalır.

### TLM-03 — Bir Todo'yu tamamlandı ve etkin durumları arasında değiştirme

**Tür:** Pozitif

**Arrange**
1. `Read a book` ve `Water plants` Todo'larını ekle.

**Act**
1. `Read a book` satırındaki checkbox'ı işaretle.
2. Aynı checkbox'ın işaretini kaldır.

**Assert**
- İşaretlendiğinde ilk Todo tamamlanmış, ikincisi etkin görünür ve sayaç `1 item left` olur.
- İşaret kaldırıldığında iki Todo da etkin görünür ve sayaç `2 items left` olur.

### TLM-04 — Tüm Todo'ları tamamlandı/etkin durumuna topluca değiştirme

**Tür:** Pozitif / Sınır

**Arrange**
1. `Finish report` ve `Send invoice` Todo'larını ekle.

**Act**
1. “Mark all as complete” checkbox'ını işaretle.
2. Checkbox'ın işaretini kaldır.

**Assert**
- İlk işlemden sonra tüm Todo'lar tamamlanır ve kalan sayaç sıfır olur.
- İkinci işlemden sonra tüm Todo'lar etkin olur ve sayaç `2 items left` gösterir.
- Kontroller, listedeki her iki Todo durumunu da yansıtır.

### TLM-05 — Todo başlığını düzenleme ve Escape ile düzenlemeyi iptal etme

**Tür:** Pozitif / Negatif

**Arrange**
1. `Draft notes` Todo'sunu ekle.

**Act**
1. Başlığa çift tıklayıp düzenleme alanında `Draft meeting notes` yaz ve Enter'a bas.
2. Başlığı yeniden düzenlemeye aç, farklı bir metin gir ve Escape'e bas.

**Assert**
- Enter sonrasında yeni başlık görünür; eski başlık görünmez.
- Düzenleme sırasında Todo etkin kalır ve sayaç `1 item left` değerini korur.
- Escape sonrasında iptal edilen metin kaydedilmez; son kaydedilen başlık korunur.

### TLM-06 — Düzenleme sırasında boş başlıkla Todo'yu kaldırma

**Tür:** Negatif / Sınır

**Arrange**
1. `Remove me` Todo'sunu ekle.

**Act**
1. Todo başlığına çift tıkla, düzenleme alanındaki metni tamamen sil ve Enter'a bas.

**Assert**
- Boş başlıklı Todo listede kalmaz.
- Kalan sayaç sıfır olur ve boş liste durumu gösterilir.

### TLM-07 — Tüm, etkin ve tamamlanmış filtrelerini kullanma

**Tür:** Pozitif

**Arrange**
1. `Finish report` ve `Send invoice` Todo'larını ekle.
2. `Finish report` Todo'sunu tamamla.

**Act**
1. Sırasıyla Active, Completed ve All filtrelerini seç.

**Assert**
- Active filtresinde yalnızca `Send invoice` görünür.
- Completed filtresinde yalnızca `Finish report` görünür.
- All filtresinde iki Todo da önceki durumlarıyla görünür.
- Filtre değiştirmek Todo durumlarını veya kalan sayısını değiştirmez.

### TLM-08 — Tek bir Todo'yu silme

**Tür:** Pozitif

**Arrange**
1. `Temporary task` ve `Keep this task` Todo'larını ekle.

**Act**
1. `Temporary task` satırının üzerine gel ve o satırdaki silme düğmesini etkinleştir.

**Assert**
- `Temporary task` listeden kaldırılır.
- `Keep this task` görünür ve etkin kalır.
- Kalan sayaç `1 item left` olur.

### TLM-09 — Tamamlananları temizlerken etkin Todo'ları koruma

**Tür:** Pozitif / Sınır

**Arrange**
1. `Completed task` ve `Active task` Todo'larını ekle.
2. `Completed task` Todo'sunu tamamla.

**Act**
1. “Clear completed” düğmesine bas.

**Assert**
- Tamamlanmış Todo kaldırılır; etkin Todo listede kalır.
- Kalan sayaç `1 item left` olarak kalır.

### TLM-10 — Tamamlanmış Todo yokken temizleme kontrolünü doğrulama

**Tür:** Negatif / Sınır

**Arrange**
1. `Active task` Todo'sunu ekle ve etkin bırak.

**Act**
1. “Clear completed” kontrolünün görünürlüğünü ve kullanılabilirliğini doğrula; kontrol kullanılabiliyorsa etkinleştir.

**Assert**
- Tamamlanmış Todo bulunmadığında kontrol gizli veya devre dışıdır; kontrol görünür ve kullanılabilir durumdaysa etkinleştirilmesi etkin Todo'yu silmez.
- Etkin Todo ve `1 item left` sayacı korunur.

## Tamamlanma ölçütü

Senaryoların tüm beklenen sonuçları doğrulanmalı; liste, durumlar ve kalan sayaç tutarlı olmalıdır. Her senaryo boş başlangıç durumundan bağımsız yürütülebilmelidir.
