---
name: git
description: Git workflow chuẩn cho base-project — stage, security scan, split commit theo scope, conventional commits. Dùng khi cần commit/push/tạo PR.
---

# Git Workflow

## Quy trình 4 bước

1. **Stage + phân tích**: `git status` (không `-uall`) rồi `git diff --cached
--stat` — biết chính xác cái gì sẽ vào commit trước khi viết message.
2. **Quét bí mật trước khi commit**:
   ```bash
   git diff --cached | grep -iE "(api[_-]?key|token|password|secret|credential|AKIA[0-9A-Z]{16}|-----BEGIN.*PRIVATE KEY-----)"
   ```
   Có match → DỪNG, không commit. Kiểm xem có phải false positive (biến
   test/placeholder) không; nếu là secret thật → thêm vào `.gitignore`,
   `git restore --staged` file đó, báo cho user.
   File cần cảnh giác thêm: `.env.local` / `.env.*.local` (đã ignore — không bao giờ `git add -f`), `*.key`, `*.pem`,
   `*.p12`, bất kỳ file tên `credentials*`. `.env.example` chỉ ghi TÊN biến; secret thật (biến server-only như
   `API_PROXY_TARGET`, mã xác minh site…) chỉ ở `.env.local` hoặc biến môi trường của host. Biến `NEXT_PUBLIC_*` nằm trong
   bundle gửi cho trình duyệt — cấm đặt secret ở đó.
3. **Quyết định tách commit hay gộp**:
   - Tách khi: nhiều `type`/`scope` khác nhau trộn lẫn, config lẫn với code
     nghiệp vụ, hoặc >10 file không liên quan nhau.
   - Gộp 1 commit khi: cùng `type`+`scope`, ≤3 file, thay đổi nhỏ liền mạch.
4. **Commit**: `type(scope): mô tả` — xem convention bên dưới.

## Conventional commit — thứ tự ưu tiên type

`feat` · `fix` · `docs` · `style` · `refactor` · `test` · `chore` · `perf` ·
`build` · `ci`

- Dòng đầu ≤72 ký tự, thì hiện tại mệnh lệnh ("add", không "added"), không
  chấm cuối câu.
- Mô tả CÁI GÌ thay đổi, không phải CÁCH nào (đó là việc của diff).
- `scope` nên có khi sửa 1 vùng rõ ràng (`feat(auth): ...`, `fix(ui): ...`, `feat(i18n): ...`, `feat(seo): ...`).
- Hook husky (`.husky/`): `pre-commit` = lint-staged (Prettier + ESLint trên file đã stage) rồi `scripts/verify-commit.mjs --quick`
  (package-lock + file sinh khớp nguồn; KHÔNG build — build bản stage chạy chủ động `npm run verify:commit`); `commit-msg` = commitlint
  (`@commitlint/config-conventional`) — message sai dạng `type(scope): mô tả` bị chặn; `pre-push` = `npm run check:fast`. CI:
  `.github/workflows/ci.yml` (máy dev: `npm run check:ci`). Chi tiết: `docs/rules/foundations/quality-gates.md`. Đổi route / env /
  `next.config.ts` → chạy thêm `npm run build` trước khi mở PR.

## Attribution — theo đúng chỉ dẫn hiện tại của session, KHÔNG có luật cố định ở đây

Có 2 trường phái đối lập từng thấy trong các repo tương tự: (a) cấm hoàn
toàn dòng "Co-Authored-By: Claude"/"Generated with Claude", (b) bắt buộc có
dòng đó. **Skill này KHÔNG áp đặt cái nào** — luôn theo system-reminder/chỉ
dẫn attribution đang có hiệu lực trong phiên làm việc hiện tại (nếu có yêu
cầu cụ thể từ user hoặc từ cấu hình session, ưu tiên nó hơn bất kỳ quy ước
mặc định nào ở đây).

## An toàn — bảo vệ nhánh & remote

- KHÔNG BAO GIỜ force-push `main`/`master`/`production`/`release/*` trừ khi
  user yêu cầu tường minh, và vẫn cảnh báo trước khi làm.
- So sánh diff với remote thật (`origin/main...origin/feature`) khi cần biết
  trạng thái đồng bộ, không chỉ tin local.
- Lệnh phá huỷ (`reset --hard`, `checkout -- .`, `clean -f`, `branch -D`) chỉ
  chạy khi user yêu cầu rõ ràng — `git status` trước để biết có gì sẽ mất.

## Output format gợi ý sau khi commit

```
✓ staged: N file (+X/-Y)
✓ security: passed
✓ commit: <hash> type(scope): message
✓ pushed: yes/no
```

## Xử lý lỗi thường gặp

- Pre-commit hook fail → sửa lỗi, `git add` lại, tạo commit MỚI — KHÔNG
  `--amend` (commit chưa từng thành công do hook chặn, amend sẽ sửa nhầm
  commit TRƯỚC ĐÓ). KHÔNG `--no-verify` trừ khi user yêu cầu tường minh.
- Cảnh báo "Git hook CHƯA được cài" (từ `npm run check:hooks` / `predev`) → chạy `npm install` (hoặc `npx husky`) ở thư mục dự án.
- Muốn huỷ merge đang dở → `git merge --abort`.
- Cần bỏ staged (không phải bỏ thay đổi) → `git restore --staged <file>`.
