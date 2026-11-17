# Data-entry Table — bảng nhập liệu kiểu bảng tính

> Áp dụng cho **mọi bảng có ô sửa được** trong `src/features/**`: danh mục, phiếu (nhập kho, chứng từ), kế hoạch, định
> mức. Bảng chỉ đọc: `visual-hierarchy.md` + `notes/components/data-display-table.md`.
> Đúc kết từ bảng nhập thật của `vci-sbc-confluent` (smart-cells, catalog, work items) và chuẩn AG Grid · SAP Fiori ·
> Excel. Màn mẫu chạy được: **`/demo/nhap-lieu`** (`src/features/demo/entry/`).
> Vi phạm mục **⛔** → **block merge**.

---

## 0. Bảy luật vàng

```
1. MỘT CHẠM LÀ SỬA       — bấm vào ô là gõ được; KHÔNG double-click, KHÔNG nút "Sửa" từng dòng.
2. BÀN PHÍM LÀ CHÍNH     — ← → trong dòng · Enter ↓ / Shift+Enter ↑ theo cột · Ctrl+S lưu · Esc huỷ.
3. LỖI Ở TẠI CHỖ         — viền đỏ ngay ô + câu báo (`title` / dưới ô); KHÔNG xoá chữ đã gõ; KHÔNG toast từng ô.
4. THẤY ĐƯỢC THAY ĐỔI    — ô đã sửa chưa lưu có dấu; header panel đếm "n dòng chưa lưu"; rời trang thì hỏi.
5. MỘT THANG MẬT ĐỘ      — dòng 32 · 40 · 48px (`TABLE_ENTRY_ROW_HEIGHT`), mọi dòng cùng cao, control LẤP ô.
6. SỐ LÀ SỐ              — căn phải, `tabular-nums`, vi-VN `1.234.567,89`, đơn vị ở HEADER, cột tính toán chìm.
7. MỘT HUE CHO TRẠNG THÁI DÒNG — rê / đang nhập / chọn đều là xanh thương hiệu `primary-5` (6 · 10 · 14%); vàng kim = nháp & đã sửa; đỏ = lỗi.
```

---

## 1. Bộ công cụ có sẵn — ⛔ KHÔNG tự viết lại

| Cần | Dùng | Ở đâu |
|---|---|---|
| Chiều cao dòng theo mật độ | `TABLE_ENTRY_ROW_HEIGHT[density]` → `<Table rowHeight>` | `@/shared/ui` |
| Cỡ control theo mật độ | `TABLE_ENTRY_CONTROL_SIZE[density]` (sm · md · lg) | `@/shared/ui` |
| Ô có control / header / cột tính toán | `TABLE_ENTRY_CELL_CLASSES.input` · `.header` · `.derived` | `@/shared/ui` |
| Dấu "đã sửa" · lỗi ở ô không phải ô nhập | `TABLE_ENTRY_CELL_STATE_CLASSES.dirty` · `.invalid` | `@/shared/ui` |
| Dòng đang nhập · được chọn · nháp | `TABLE_ENTRY_ROW_CLASSES.active` · `.selected` · `.draft` → `rowClassName` | `@/shared/ui` |
| Control phẳng tới khi rê / focus dòng | `TABLE_INLINE_EDIT_CLASS` trên vỏ bảng | `@/shared/ui` + `styles/overrides/table-inline-edit.css` |
| ← → trong dòng | `useArrowFieldNav()` (`keyboard-navigation.md`) | `@/shared/hooks` |
| Enter ↓ · Shift+Enter ↑ theo cột | `handleEntryGridKeyDown` · `focusEntryCell` | `@/shared/utils/browser/entry-grid.utils` |
| Ctrl/⌘+S | `useSaveShortcut(onSave, { canSave })` | `@/shared/hooks` |
| Hỏi khi rời trang còn thay đổi | `useBeforeUnload` + `useBlocker` | `@/shared/hooks` · React Router |

```tsx
const [navRef, onNavKey] = useArrowFieldNav<HTMLDivElement>();
const onKeyDown = (e: React.KeyboardEvent) => {
  handleEntryGridKeyDown(e);           // Enter / Shift+Enter theo cột (bỏ qua IME)
  if (!e.defaultPrevented) onNavKey(e); // ← → trong dòng
};

<div ref={navRef} className={cn('flex min-h-0 flex-1 flex-col', TABLE_INLINE_EDIT_CLASS)} onKeyDown={onKeyDown}>
  <Table
    columns={columns}
    data={rows}
    fill
    footerCell={footerCell}
    gridBorder
    pagination={false}
    rowClassName={(row) => cn(TABLE_ENTRY_ROW_CLASSES.active, row.draft && TABLE_ENTRY_ROW_CLASSES.draft)}
    rowHeight={TABLE_ENTRY_ROW_HEIGHT[density]}
    rowKey={(row) => row.id}
  />
</div>
```

---

## 2. ⛔ Mật độ & kích thước

| Mật độ | Dòng | Control | Khi nào |
|---|---|---|---|
| `compact` (**mặc định màn nhập**) | 32px | `sm` 32 | Nhập dày, laptop 14" |
| `regular` | 40px | `md` 36 | Bảng có Dropdown / DatePicker nhiều |
| `comfortable` | 48px | `lg` 40 | Máy chạm, người nhập ít thao tác |

- Cho người dùng đổi mật độ (`SegmentToggle` ở header panel — mẫu `/demo/nhap-lieu`); lưu lựa chọn thì qua store `persist`.
- ⛔ KHÔNG tự đặt chiều cao dòng khác thang (24 / 28 / 34 / 36 … — `confluent` từng có 9 hằng khác nhau).
- Ô nhập `px-1 py-0`, header `px-2` → chữ header thẳng chữ trong control (lệch ≤ 2px). Control `w-full min-w-0`.
- ⛔ `Dropdown` trong ô PHẢI `className="min-w-0"` (trigger mặc định `min-w-[180px]` tràn sang cột bên).

## 3. Control phẳng — bảng đọc như bảng tính

`TABLE_INLINE_EDIT_CLASS`: control trong ô KHÔNG viền / nền tới khi dòng được rê hoặc có focus — lúc đó khung hiện lại.
Ô lỗi (`aria-invalid`) luôn giữ khung đỏ. Chỉ áp ở máy có con trỏ thật; máy chạm luôn hiện khung.

## 4. ⛔ Cột

| Loại cột | Bề rộng | Căn | Ghi chú |
|---|---|---|---|
| STT | 48 | phải | `tabular-nums text-fg-muted`, không sửa |
| Mã | 112–128 | trái | mã viết hoa, duy nhất (kiểm trùng ngay khi gõ) |
| Tên / diễn giải | ≥ 240 | trái | cột co giãn chính |
| Chọn (ĐVT, loại) | 112–210 | trái | `Dropdown size={controlSize} className="min-w-0"` |
| Số lượng · đơn giá | 112–140 | **phải** | `NumberInput hideStepper thousandSeparator className="text-right tabular-nums"` |
| Thành tiền / cột **tính toán** | 140–160 | **phải** | `TABLE_ENTRY_CELL_CLASSES.derived` — nền chìm, không phải control |
| Ghi chú | 200 | trái | `Input` |
| Chọn dòng (bulk) | 40 | giữa | `Checkbox`; xoá NHIỀU dòng qua nút đếm ở header panel + `ConfirmDialog` |

- **Đơn vị ở HEADER** (`Đơn giá (₫)`, `Khối lượng (t)`) — ô chỉ chứa số.
- `minWidth` của bảng = tổng bề rộng cột → hẹp thì CUỘN NGANG, không bóp cột. Cột mã + tên nên `frozen` khi bảng rộng.
- ⛔ KHÔNG icon sửa / xoá trên từng dòng (nhiễu × 50 dòng). Thao tác dòng: chuột phải (`ContextMenu`) hoặc chọn rồi bấm.

## 5. ⛔ Trạng thái — màu nào cho cái gì

| Trạng thái | Hình | Token |
|---|---|---|
| Rê dòng | nền `primary-5` 6% | có sẵn trong `TABLE_ROW_CLASSES` |
| Dòng đang nhập (focus) | nền `primary-5` 10% | `TABLE_ENTRY_ROW_CLASSES.active` |
| Dòng được chọn | nền `primary-5` 14% | `TABLE_ENTRY_ROW_CLASSES.selected` |
| Dòng NHÁP (mới, chưa lưu) | vạch vàng kim 3px mép trái | `TABLE_ENTRY_ROW_CLASSES.draft` |
| Ô ĐÃ SỬA chưa lưu | tam giác vàng kim 7px góc phải trên (kiểu Excel) | `TABLE_ENTRY_CELL_STATE_CLASSES.dirty` (bọc control) |
| Ô LỖI | viền đỏ control (`invalid`) + `title` câu báo | prop `invalid` của `Input` / `NumberInput`; ô không phải control: `.invalid` |
| Cột tính toán | nền `bg-subtle`, chữ `fg-muted` | `TABLE_ENTRY_CELL_CLASSES.derived` |
| Dòng tổng | dính đáy, nền `bg-pressed`, vạch 2px trên | `footerCell` của `Table` (có sẵn) |

- ⛔ KHÔNG trộn hue: dòng đang nhập xanh dương mà hover xanh lá là lỗi đã gặp ở `confluent`.
- ⛔ KHÔNG `striped` (zebra) cho bảng NHẬP — sọc tranh chấp với nền dòng đang nhập / chọn / lỗi. Zebra chỉ cho bảng đọc.
- Đã sửa KHÔNG đổi nền ô (để nền dành cho dòng đang nhập) — chỉ tam giác.

## 6. ⛔ Bàn phím

| Phím | Hành vi |
|---|---|
| ← → | sang ô trái / phải trong DÒNG (`useArrowFieldNav` — chỉ khi con trỏ ở mép chữ) |
| Enter · Shift+Enter | xuống / lên ô CÙNG CỘT (`handleEntryGridKeyDown`) |
| Tab · Shift+Tab | ô kế / trước (trình duyệt); cuối dòng → đầu dòng sau |
| Ctrl/⌘+S | lưu cả phiếu (`useSaveShortcut`, `canSave` = có dòng chờ lưu) — còn lỗi thì báo dòng lỗi, KHÔNG im lặng |
| Esc | huỷ sửa ô đang gõ (control tự lo); Esc lần 2 rời bảng |

⛔ **IME tiếng Việt**: Telex / VNI chốt chữ bằng Enter — handler PHẢI bỏ qua `isComposing` / `keyCode 229`
(`handleEntryGridKeyDown` đã làm). Tự viết `onKeyDown` bắt Enter mà quên điều này = mất dấu khi gõ.

## 7. Dòng nháp, lưu, rời trang

- "Thêm dòng" ở header panel → dòng NHÁP ở **cuối** bảng, focus vào ô bắt buộc đầu tiên. Nháp bỏ trống hoàn toàn thì
  không chặn lưu (bỏ qua khi lưu).
- Hai kiểu lưu, chọn MỘT cho mỗi màn: **phiếu** (sửa nhiều rồi "Lưu phiếu" / Ctrl+S — mẫu demo) hoặc **từng ô** (PATCH khi
  rời ô, lạc quan; lỗi thì giữ chữ đã gõ, hoàn cache). Không toast từng ô — dùng badge / pill trạng thái lưu.
- Lỗi chặn lưu: báo MỘT toast tổng ("Còn 2 dòng có lỗi") + viền đỏ tại ô; không nhảy modal.
- Còn thay đổi chưa lưu mà rời trang / đóng tab → hỏi (`useBeforeUnload`, `useBlocker`).
- Lọc / trang / `?id=` trên URL; nháp sống ở state trang để đổi bộ lọc không mất.

### 7.1. Trạng thái lưu — MỘT chỗ, không nút chết

Mẫu: `src/features/demo/entry/components/EntrySaveState.tsx` (màn `/demo/nhap-lieu`).

| Phiếu | Hiện | Vì sao |
|---|---|---|
| Không có dòng chờ lưu | nhãn mờ "Đã lưu ✓" (`role="status"`) — KHÔNG có nút | Nút xám khoá đọc ra "app treo / không bấm được"; nhãn trả lời đúng câu người dùng hỏi |
| Có dòng sửa / thêm | nút chính "Lưu phiếu" + số dòng chờ lưu, tooltip nhắc "Ctrl S" | Một chỗ cho cả trạng thái lẫn hành động; số đếm nói lưu bao nhiêu |
| Còn lỗi | nút VẪN bấm được → toast tổng + viền đỏ tại ô (gạch trên) | Nút khoá im lặng không nói lỗi ở đâu |

- Cùng một hàm cho nút và Ctrl/⌘+S; `useSaveShortcut(onSave, { canSave: dirtyCount > 0 })`.
- ⛔ Không đặt thêm nút "Lưu" thứ hai (chân trang, toolbar) và không tách nhãn "Đã lưu" ra chỗ khác — trạng thái lưu nằm
  ở MỘT chỗ (header panel phiếu).

## 8. Dán từ Excel, điền xuống

Khi màn cần (danh mục lớn): dán TSV nhiều ô neo ở ô đang focus, báo "Đã dán n ô · m ô bị chặn"; Ctrl+D điền giá trị ô
trên xuống. Lấy mẫu từ `vci-sbc-confluent/fe/src/shared/widgets/smart-cells` (`smart-grid.utils.ts`) và đưa vào
`shared/utils/browser` khi phân hệ đầu tiên cần — đừng viết lại trong từng feature.

## 9. Checklist PR bảng nhập

- [ ] `rowHeight` từ `TABLE_ENTRY_ROW_HEIGHT`, control cỡ `TABLE_ENTRY_CONTROL_SIZE`, `pagination={false}` cho phiếu
- [ ] Vỏ bảng: `TABLE_INLINE_EDIT_CLASS` + `useArrowFieldNav` + `handleEntryGridKeyDown`
- [ ] Số căn phải, `tabular-nums`, vi-VN; đơn vị ở header; cột tính toán `derived`
- [ ] Ô đã sửa có dấu `dirty`; lỗi qua `invalid` + câu báo, không xoá chữ; bấm Lưu khi còn lỗi → toast tổng + viền đỏ (§7)
- [ ] Dòng nháp `draft`, thêm ở cuối; xoá nhiều dòng qua chọn + xác nhận (không icon từng dòng)
- [ ] Trạng thái lưu MỘT chỗ (§7.1): "Đã lưu ✓" khi sạch · nút "Lưu phiếu" + số dòng chờ khi bẩn — không nút xám chết
- [ ] Ctrl/⌘+S lưu; hỏi khi rời trang còn thay đổi
- [ ] Không `striped`; không trộn hue trạng thái dòng
