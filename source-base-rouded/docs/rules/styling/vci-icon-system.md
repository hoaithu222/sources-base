# Bộ icon VCI

Bộ icon NHẬN DIỆN của hệ thống VCI: phân hệ, chứng từ, đối tượng nghiệp vụ, thao tác chính. Vẽ riêng trên cùng một
lưới, cùng một nét, mượn ba nét nhận diện của logo VCI — người dùng nhìn icon là nhận ra "đây là app VCI" và nhận ra
nghiệp vụ trong một cái nhìn.

> Icon chrome (mũi tên, đóng, tìm, sắp xếp…) vẫn là `SystemIcon` — `icon-conventions.md`. Bộ VCI KHÔNG thay bộ hệ thống;
> nó phủ phần mà icon chung chung (wallet, cubes, chart…) không nói được nghiệp vụ.

---

## 1. Ngôn ngữ thiết kế — lấy từ logo

Logo VCI = vòng tròn ghép từ **3 cung** (dốc xanh lá → ngọc → lam), chữ **V** lệch bên ở giữa, **chấm đỏ** trên đỉnh.

| Nét nhận diện | Từ logo | Trong icon | Ví dụ |
|---|---|---|---|
| **Vòng hở 3 cung** | Vòng logo hở 3 khe | Mọi icon có vòng tròn vẽ bằng 3 cung, khe ở 10 giờ · 2 giờ · 6 giờ, khe nhìn thấy ≈ 1.6 đơn vị | `overview`, `customer`, `approval`, `reject`, `time`, `home` |
| **Chấm nhấn** | Chấm đỏ trên chữ V | Một điểm tô đặc ở TIÊU ĐIỂM của icon: đầu người, điểm dữ liệu, nút, con dấu, chấm than | `hr` (đầu), `analytics` (điểm cuối), `finance` (khuy ví), `alert` (chấm than), `bell` (chấm báo) |
| **V lệch bên** | Chữ V hai nhánh dài ngắn khác nhau | Chỉ ở biểu tượng gốc `home` | `home` |

Biểu tượng `home` là logo rút gọn (vòng hở + V + chấm) — dùng cho "Trang chủ VCI" / hub, không dùng làm icon trang trí.

## 2. Lưới & nét

| Thông số | Giá trị | Lý do |
|---|---|---|
| Lưới | `viewBox="0 0 24 24"` | Chuẩn chung, chia đôi / chia ba sạch |
| Vùng an toàn | 1 → 23 (mép ngoài nét); thân chính đặt tâm nét trong 3 → 21 | Nét 1.75 không bị cắt ở 16px |
| Nét | `1.75`, `stroke-linecap="round"`, `stroke-linejoin="round"` | ≈ 1.2px ở 16px — ngang icon outline hệ thống; đầu tròn = nét cong mềm của logo |
| Nét đậm | `2.25` (`weight="bold"`) | Glyph ≤ 16px trên nền màu (`AppTile` xs / sm) |
| Bo góc | Khung ngoài r = 2.5–3 · chi tiết trong r = 1.5 | Khớp thang bo góc giao diện (`radius.css`) |
| Chấm nhấn | r = 1.5 chuẩn · 1.25 chỗ chật · 2.25–2.75 khi là đầu người | Một icon tối đa một "cụm" chấm |
| Khe hở | ≥ 0.5 giữa chấm và nét (đã trừ nửa nét) | Không dính thành vệt ở 16px |

## 3. Ba lớp & biến thể

Mỗi SVG có tối đa 3 lớp — **không** có lớp nào khác, **không** có mã màu (thân luôn `currentColor`):

```xml
<svg viewBox="0 0 24 24" fill="none" data-group="module" xmlns="http://www.w3.org/2000/svg">
  <title>Tài chính</title>
  <g data-layer="duo" fill="currentColor" opacity="0.16">…</g>   <!-- mảng tô nhạt (tuỳ chọn) -->
  <g data-layer="line" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">…</g>
  <g data-layer="dot" fill="currentColor">…</g>                   <!-- chấm nhấn (tuỳ chọn) -->
</svg>
```

| Biến thể | Lớp `duo` | Lớp `dot` | Dùng khi |
|---|---|---|---|
| `line` (mặc định) | ẩn | màu thân | Nút, menu, ô nhập, dòng bảng — đứng cạnh icon hệ thống |
| `duo` | tô 16% màu thân | token `icon-accent` (đỏ logo `#E33D40`, tối `#F26A73`) | Icon NHẬN DIỆN: thẻ màn hình, tiêu đề khối, empty state, ô `AppTile` |

Trên nền màu (`AppTile`), chấm nhấn đổi sang vàng kim bằng cách ghi đè biến `--color-icon-accent` ở phần tử bọc — đỏ
chìm trên nền xanh. ⛔ Không dùng `duo` trong cột trạng thái của bảng: chấm đỏ đọc nhầm thành "lỗi".

## 4. Nhóm

| `data-group` | Nghĩa | Icon |
|---|---|---|
| `brand` | Mốc thương hiệu / điều hướng gốc | `home` `apps` `overview` |
| `module` | Phân hệ | `finance` `ledger` `purchase` `sales` `warehouse` `logistics` `production` `hr` `payroll` `report` `analytics` `customer` `partner` `asset` `project` `quality` |
| `business` | Chứng từ & đối tượng nghiệp vụ | `invoice` `contract` `order` `item` `lot` `scan` `bank` `cashflow` `budget` `timesheet` `time` `folder` |
| `action` | Thao tác & trạng thái | `approval` `reject` `pending` `alert` `add-doc` `import` `export` `settings` `ai` `bell` |

Xem tất cả: `/demo#vci-icons`.

## 5. Dùng

```tsx
import { AppIcon, AppTile, VciIcon } from '@/shared/ui';

<VciIcon name="warehouse" size={24} variant="duo" className="text-primary-7" />   // icon nhận diện
<Button startIcon={<VciIcon name="import" size={16} />}>Nhập Excel</Button>        // trong nút: line
<AppTile icon="finance" tone="primary" size="lg" />                              // ô phân hệ (tự duo + chấm vàng)
<AppIcon name={module.icon} size={20} />                                          // tên đến từ cấu hình
```

- **Meta route / phân hệ** (`meta.icon`, `meta.navIcon`) có kiểu `AppIconName` = tên VCI **hoặc** tên `SystemIcon`. Phân hệ
  mới: ưu tiên tên VCI. Cùng kiểu đó: `icon` của mục Dock, thanh tab điện thoại, bảng lệnh, `HeaderModule` và
  `InsetGroupRow`. Nơi vẽ dùng `AppIcon` / `AppTile`, không tự rẽ nhánh.
- Màu thân bằng `text-*` (`text-primary-7` cho icon nhận diện trên nền sáng, `dark:text-primary-4`). Không thêm biến thể
  màu vào component.
- Cỡ bằng prop `size` (inline style, như `SystemIcon`); `size-*` không có tác dụng.
- Icon mặc định `aria-hidden` — nghĩa do chữ / `aria-label` của phần tử bọc ngoài nói.

## 6. Thêm icon

1. Vẽ trên lưới 24 theo §1–§3 (Figma: frame 24×24, nét 1.75 center, round cap/join; xuất SVG rồi gom lớp vào 3 nhóm
   `data-layer`, thêm `<title>` tiếng Việt + `data-group`).
2. Đặt vào `src/assets/vci-icons/{ten-kebab}.svg` — tên KHÔNG kết thúc bằng `-bold` / `-outline` (dành cho bộ hệ thống).
3. `npm run generate:vci-icons` → ghi `src/shared/ui/icons/vci-icon/vci-icons.generated.ts` (dữ liệu từng lớp; Prettier bỏ
   qua file này).
4. Xem ở `/demo#vci-icons` cả 16 / 20 / 24 / 48px, line / duo, trên `AppTile`.
5. `tests/policy/styling/vci-icons.test.tsx` gác: lưới, nét, lớp, nhãn, nhóm, vùng an toàn, dữ liệu sinh khớp nguồn
   (`generate:vci-icons -- --check`).

| File | Vai trò |
|---|---|
| `src/assets/vci-icons/*.svg` | NGUỒN — sửa ở đây |
| `scripts/generate-vci-icons.mjs` | SVG → dữ liệu (`--check` chỉ so) |
| `src/shared/ui/icons/vci-icon/` | `VciIcon` · bảng class · kiểu · dữ liệu sinh |
| `src/shared/ui/icons/app-icon/` (`AppIcon.tsx` · `app-icon.utils.ts`) | Vẽ theo tên bất kỳ bộ nào · `AppIconName` · `isVciIconName` |
