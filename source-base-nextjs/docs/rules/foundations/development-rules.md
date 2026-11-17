# Development Rules — nguyên tắc chung

> Nguyên tắc tối cao, áp khi rule cụ thể chưa nói tới trường hợp đang gặp. Bổ sung `code-style.md` /
> `clean-code-standards.md`.

## YAGNI — You Aren't Gonna Need It

KHÔNG xây abstraction / config / prop cho nhu cầu "có thể sau này cần" — chỉ xây cho nhu cầu ĐANG có. 3 dòng
lặp lại còn tốt hơn 1 abstraction sai (phải viết lại khi nhu cầu thật xuất hiện, tốn công gấp đôi).

## KISS — Keep It Simple

Giải pháp đơn giản nhất giải quyết đúng vấn đề, không phải giải pháp "chuẩn mực nhất về lý thuyết". Cần giải
thích dài mới hiểu vì sao code viết như vậy thì thường có cách viết đơn giản hơn.

## DRY — tách ra dùng chung ở lần lặp thứ 3

Nguồn DUY NHẤT của ngưỡng tách logic / hook / component ra **dùng chung giữa nhiều nơi** (nhiều file, nhiều feature):

| Số nơi lặp | Hành động |
|---|---|
| 1 | Giữ nguyên tại chỗ |
| 2 | Cân nhắc tách nếu logic phức tạp; giữ nguyên nếu đơn giản |
| 3+ | BẮT BUỘC tách thành hàm / hook / component dùng chung (`shared/` hoặc `domains/`) |

Tách sớm quá (lần 1–2) tạo abstraction sai vì chưa đủ ca để thấy đúng hình dạng chung. Trước khi tách, tìm cái
đã có (`reuse-first.md` — vd `useDeleteWithConfirm` đã có, đừng viết `useDeleteAction`).

Khối JSX lặp trong CÙNG một file là ngưỡng khác (≥ 2 lần → phần con nội bộ): `clean-code-standards.md §1`.

## Đặt tên — rõ ràng hơn ngắn gọn

Tên file là thứ được grep nhiều nhất trong ngày làm việc. Quy ước tên file theo vai trò (`PascalCase.tsx`,
`useXxx.ts`, `kebab-case.<vai>.ts`): `folder-structure.md §4`. Tên dài mà rõ tốt hơn tên ngắn mà mơ hồ.

## Không tạo file "-v2" / "-new" / "-enhanced"

Sửa trực tiếp file gốc thay vì tạo bản sao "cải tiến" song song — lịch sử là việc của git. Ngoại lệ DUY NHẤT: đang
migrate có chủ đích, có kế hoạch xoá bản cũ trong PR gần (không để treo vô thời hạn).

## Trước khi commit / push

- `npm run check` xanh (`quality-gates.md`); đụng route / metadata / env thì chạy thêm `npm run build` và đọc bảng `Route (app)` — không có `ƒ` lạ.
- Test không được skip để "qua được build" — test đỏ nghĩa là có gì đó sai thật; sửa nguyên nhân, không
  comment-out test.
- Không commit secret / credential — skill `git` §quét bí mật. Message theo conventional commit — skill `git`.

## Liên quan

`code-style.md` (tên, mẫu export, `'use client'`) · `clean-code-standards.md` (một file một việc) · `folder-structure.md`
(giới hạn, tên file) · `server-client-boundary.md` (server / client) · skill `git` · skill `fix` (quy trình sửa bug)
