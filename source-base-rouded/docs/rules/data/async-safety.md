# Async Safety — tác vụ bất đồng bộ phải đúng thứ tự, đúng chủ (BẮT BUỘC)

> Lỗi bất đồng bộ không làm `tsc`, lint hay render đỏ — chỉ cho kết quả SAI khi hai lời gọi về
> không theo thứ tự gọi. Mỗi luật dưới đây từng là lỗi thật trong repo và có test khoá
> (`tests/shared/*`, `tests/domains/*`). Viết tác vụ async mới: đọc §1, viết test theo §7, tự kiểm bằng checklist §8.

---

## 1. Năm luật

| # | Luật | Vi phạm trông thế nào |
|---|---|---|
| 1 | **Latest-wins**: chỉ lượt gọi MỚI NHẤT được ghi state; lượt cũ về muộn bị bỏ | Gõ A rồi B; API của A trả sau → field hiện lỗi của A dù giá trị là B |
| 2 | **Gắn kết quả với chủ của nó**: handler, đích, phiên của lượt nào thì dùng đúng của lượt đó | Hàng đợi giữ MỘT `uploader` toàn cục → tệp của lô A chạy bằng handler của lô B |
| 3 | **Huỷ / reset = sang đời mới**: kết quả muộn của đời cũ bị bỏ, và KHÔNG được chặn việc mới | `cancel()` đợi handler lờ `AbortSignal` settle → lô sau kẹt mãi |
| 4 | **Thao tác bất đồng bộ gắn với phiên nó bắt đầu**: sau `await` phải kiểm phiên còn là phiên đó | Logout A chậm xoá luôn phiên B vừa đăng nhập |
| 5 | **Mọi nhánh đều kết thúc**: `catch` + `finally`, không để unhandled rejection, không kẹt `loading` | `try/finally` không `catch` → API lỗi thành unhandled rejection, danh sách cũ ở lại |

Unmount là một dạng "huỷ": sau unmount không `setState`, không bắn debounce còn treo.

---

## 2. Công cụ có sẵn — dùng, đừng tự chế

| Cần | Dùng | Ghi chú |
|---|---|---|
| Latest-wins trong component | `useLatestRequest()` (`@/shared/hooks`) | `const isCurrent = begin()` trước khi gọi, `if (!isCurrent()) return` sau MỖI `await`; `invalidate()` khi reset / đổi cha; tự vô hiệu khi unmount |
| Kiểm tra bất đồng bộ có debounce | `useAsyncValidation` | latest-wins, dùng `fn` / `errorMessage` mới nhất ở mỗi lượt gọi |
| Select tải qua API | `AsyncSelectField` · `CascadeSelectField` | lỗi tải → danh sách rỗng + dòng lỗi; đổi cấp cha vô hiệu và xoá lựa chọn cấp sâu hơn |
| Hàng đợi tải lên toàn app | `useUploadQueue().enqueue(files, handler)` | mỗi tệp chạy bằng handler của lần `enqueue` tạo ra nó, kể cả "Thử lại" |
| Tải lên trong một form | `useUpload` | `multiple=false` chỉ nhận tệp hợp lệ đầu tiên; huỷ / thay tệp thì kết quả muộn bị bỏ |
| Dựng thứ tự hoàn thành trong test | `createDeferred()` (`@tests/helpers/deferred`) | không ngủ thật |

Cần latest-wins ở NGOÀI React (store, module): giữ một "đời" (generation / runner / epoch) và so
sánh sau mỗi `await` — mẫu: `upload-queue.store.ts` (runner), `session.lifecycle.ts` (epoch).

---

## 3. Mẫu viết

```ts
const { begin, invalidate } = useLatestRequest();

const load = useCallback(async (query: string) => {
  const isCurrent = begin();
  setLoading(true);
  try {
    const next = await fetchOptions(query);
    if (!isCurrent()) return;
    setOptions(next);
  } catch {
    if (!isCurrent()) return;
    setOptions([]);
    setFailed(true);
  } finally {
    if (isCurrent()) setLoading(false);
  }
}, [begin, fetchOptions]);
```

- Hàm cuối `finally` cũng phải kiểm `isCurrent()`: lượt cũ không được tắt `loading` của lượt mới.
- Callback gọi từ debounce / timer đọc giá trị MỚI NHẤT qua ref hoặc tham số, không đóng băng ở
  render đầu (`useRef(debounce(…))` bắt `fn` của render đầu — lỗi đã gặp).
- Nhiều request chồng nhau thì `isLoading` = "lượt MỚI NHẤT đang chạy", không phải "có lượt nào về".

---

## 4. Phiên đăng nhập (`domains/session`)

- Mọi thao tác `await` rồi mới đổi phiên (`logout`, refresh) phải gắn với phiên nó bắt đầu:
  `epoch` + id người dùng. `epoch` tăng mỗi lần phiên xác lập / kết thúc / đổi sang người khác — kể cả khi
  refresh đa tab trả hồ sơ người khác — nên A → B → A cũng là phiên mới.
- `onSessionEnd(listener)`: mỗi listener chạy riêng trong try/catch; lỗi chỉ `console.error`,
  không chặn listener khác, không làm `clearSession` / `refreshSession` ném.
- Khoá đa tab (`navigator.locks`) chỉ là TỐI ƯU: nó hỏng, hoặc chờ quá hạn (15 giây — tab khác giữ
  khoá không nhả), thì refresh chạy không khoá đúng một lần, và `restoreSession` luôn thoát `restoring`.
- Tin nhắn giữa các tab là dữ liệu ngoài: kiểm hình dạng trước khi phản ứng, tin lạ bị bỏ qua.

---

## 5. State thuộc tài khoản vs thuộc thiết bị

| Loại | Ví dụ | Khi hết phiên / đổi tài khoản |
|---|---|---|
| Thuộc tài khoản | TanStack Query cache, hàng đợi tải lên, thẻ tác vụ nhập / xuất | Xoá — `resetAccountScopedState()` ở `app/bootstrap.ts` (`queryClient.clear()` + `resetProgressCenter()`) |
| Thuộc thiết bị | theme, chế độ TV / cỡ chữ, bố cục header, cấu hình dock | Giữ |

Store mới chứa dữ liệu gắn với người dùng PHẢI nối vào `resetAccountScopedState()`. Chỉ xoá phần
hiển thị / hàng đợi phía trình duyệt — việc máy chủ đã nhận thì cứ chạy tiếp.

---

## 6. Dữ liệu đọc từ ngoài vào: kiểm tra mỗi lần

`localStorage`, URL, `BroadcastChannel`, `JSON.parse`: TypeScript không kiểm lúc chạy.

- Store `persist`: sanitise ở CẢ `merge` (mỗi lần rehydrate) lẫn `migrate` (đổi version); chỉ nhận
  field được phép, field sai về mặc định từng cái một, bỏ field lạ.
- `useLocalStorage(key, initial, { parse })`: `parse` trả `undefined` → dùng `initial`; đổi `key` thì
  đọc lại; ghi storage ngoài updater (updater phải thuần).
- `useQueryParams`: số nguyên nghiêm ngặt (`"12abc"` không phải 12), `pageSize` có trần,
  `clearParams()` chỉ xoá param hook sở hữu.

---

## 7. Test bắt buộc cho tác vụ async mới

Mỗi hợp đồng ở §1 một test, viết TRƯỚC khi sửa và thấy nó đỏ đúng lý do:

1. Hai lượt về NGƯỢC thứ tự (cũ chậm, mới nhanh) — và cả thứ tự ngược lại.
2. `reset()` / huỷ / đổi dữ liệu cha khi lượt cũ còn bay.
3. Unmount khi đang chờ — không `setState`, không cảnh báo `act`.
4. API từ chối rồi gọi lại thành công.
5. Handler lờ `AbortSignal` và không bao giờ settle — việc mới vẫn chạy.
6. Hai lô khác handler / khác đích trong cùng hàng đợi.

Test hành vi như trên có giá trị hơn tăng coverage bằng test lặp lại cài đặt.

---

## 8. Checklist

- [ ] Mọi `await` trong component có `isCurrent()` / kiểm đời trước khi ghi state
- [ ] Có `catch`; `loading` luôn kết thúc; không unhandled rejection
- [ ] Callback trong debounce / timer / ref dùng giá trị mới nhất
- [ ] Kết quả gắn đúng chủ (handler, phiên, cấp cha) — không đọc từ biến toàn cục "lần gần nhất"
- [ ] Huỷ / reset sang đời mới và không bị kẹt bởi handler không phản hồi
- [ ] State gắn tài khoản đã nối vào `resetAccountScopedState()`
- [ ] Dữ liệu đọc từ storage / URL / kênh đã kiểm hình dạng
- [ ] Đủ test §7

---

## 9. Cross-references

`api-patterns.md` · `state-management.md` · `code-optimization.md` · `security-checklist.md §7` ·
`quality-gates.md` · `notes/code/domains.md` · `notes/code/widgets.md` · `notes/code/hooks.md`
