# Documentation Management — tài liệu một nguồn, khớp code

> Mục lục, ranh giới ba loại tài liệu (rule / note / khối tài liệu trong code) và danh sách hướng dẫn
> (`docs/guides/`): `docs/README.md`. File này nói KHI NÀO tạo / sửa tài liệu và cách giữ nó không lệch code.

## 1. Mỗi chủ đề MỘT nguồn

- Một luật chỉ được VIẾT ở một file; nơi khác trỏ tới (`xem folder-structure.md §1`), KHÔNG chép đoạn văn hay
  bảng. Hai bản là hai chỗ sẽ lệch nhau.
- Nguồn đã chốt cho các chủ đề hay bị chép: giới hạn số dòng + tên file → `folder-structure.md`; cây folder
  feature → `feature-structure.md`; ngưỡng DRY → `development-rules.md` (nhiều nơi) và `clean-code-standards.md §1`
  (trong một file); mẫu export component + vị trí `'use client'` → `code-style.md`; file nào cần `'use client'` →
  `server-client-boundary.md`; chữ hiển thị / ngôn ngữ → `rules/i18n/i18n.md`; metadata / sitemap / JSON-LD →
  `rules/seo/seo.md`; biến môi trường → `architecture.md §15` + `quality-gates.md §2b`; catalog component → `reuse-first.md §3`;
  lệnh và cổng kiểm → `quality-gates.md`; quyết định kiến trúc + vì sao → `docs/architecture.md`.
- Checklist cuối mỗi rule chỉ ghi `npm run check` xanh (`quality-gates.md`), không liệt kê lại từng lệnh.

## 2. Viết ở đâu

| Có gì cần ghi | Đặt ở |
|---|---|
| Luật áp LẶP LẠI nhiều nơi, kiểm được đúng / sai | rule mới hoặc mục mới trong rule có sẵn (`docs/rules/<nhóm>/`) |
| "Vì sao" của MỘT component / file, không hiển nhiên từ code | mục `## Tên` trong note (`docs/notes/…`, ≤ 6 gạch, mỗi gạch ≤ 2 dòng) |
| Cách dùng một component / hook / hằng | khối tài liệu ngay trong code (`comment-policy.md`) |
| Cách làm một việc thường gặp, từng bước, xuyên nhiều file (thêm trang, thêm phân hệ, thêm chuỗi dịch, thêm trang vào sitemap…) | **guide** — hướng dẫn từng bước, khớp code thật: `docs/guides/<vùng>.md`. Mẫu code dùng đúng tên / chữ ký thật; gặp luật thì trỏ về rule, KHÔNG chép |
| Quyết định kiến trúc khó đảo ngược | `docs/architecture.md` (quyết định · vì sao · luật ở đâu) |
| Lỗi / nợ thấy được mà chưa sửa | `docs/known-issues.md` (một dòng, có trạng thái) |
| Một lần đổi (bug đã sửa, đổi tên) | commit message / PR — KHÔNG vào docs |

Tạo **rule mới** chỉ khi quy ước lặp lại, viết được thành luật đúng / sai, và chưa rule nào cover (tra
`docs/README.md` trước). Tạo xong thêm MỘT dòng vào `docs/README.md` — không thêm bảng index ở nơi khác.

## 3. Giữ tài liệu khớp code

- **Sửa code mà rule / note / guide có ví dụ hay claim liên quan → sửa tài liệu TRONG CÙNG PR.** Không "update doc
  sau".
- Đọc một rule cũ thì đối chiếu với code thật trước khi tin (`Grep` tên hàm / component / đường dẫn được nhắc).
  Code là nguồn thật; rule chỉ là tài liệu.
- Claim tuyệt đối ("không file nào vượt…", "luôn…") phải kiểm bằng `Grep` / `Glob`, hoặc tốt hơn: có test /
  rule ESLint giữ (`quality-gates.md §6` — một luật chỉ nằm trong tài liệu là luật sẽ bị quên).
- Đổi tên / dời file: grep đường cũ trong `docs/`, `README.md`, `.claude/` (`folder-structure.md §6`). Phần cơ học do máy giữ: test
  `foundations/docs-links` (link `.md` và đường `@/…` · `src/…` · `tests/…` trong backtick phải có thật — `testing.md §5`).
- Thêm / đổi route, biến môi trường, khoá `messages`, lệnh `npm run`: sửa `README.md` gốc (bảng lệnh, cấu trúc, danh sách kiểm) và
  `.env.example` cùng PR — hai nơi đầu tiên người mới đọc.
- Không kể lịch sử trong tài liệu ("trước đây…", "đã đổi tên từ…") — tên cũ chỉ làm người đọc grep nhầm.

## 4. Định dạng

- Tiếng Việt; tiêu đề rule `# Tên — một câu nói nó giữ gì`. Nhãn **(BẮT BUỘC)** ở tiêu đề chỉ dành cho rule mà vi
  phạm là lỗi thật cho người dùng (danh sách ở `docs/README.md`).
- Ví dụ code chép từ file thật (ghi đường dẫn), không bịa API.
- `.md` không chạy Prettier — giữ dòng ≤ ~120 ký tự bằng tay; đừng format lại cả file chỉ để đổi vài dòng.

## Liên quan

`docs/README.md` (mục lục) · `comment-policy.md` (comment trong code, note) · skill `docs` (quy trình cập nhật)
