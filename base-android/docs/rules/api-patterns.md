# Gọi API

## Ba tầng

```
{ten}.api.ts       hằng số đường dẫn
{ten}.service.ts   async, bọc apiClient, CHUẨN HOÁ tên trường backend
{ten}.queries.ts   hook React Query
```

⛔ Component **không** gọi `apiClient` trực tiếp. Luôn qua hook trong
`queries/`, để cache · trạng thái tải · thử lại · làm mới đều do React Query lo.

## Interceptor đã làm sẵn gì

`src/core/api/client.ts` lo tập trung, feature **không cần tự làm**:

- gắn `Authorization` từ access token trong bộ nhớ;
- xoá `Content-Type` khi body là `FormData` (bắt buộc, nếu không upload hỏng);
- serialize mảng thành `key=a&key=b` (hợp .NET; mặc định axios ra `key[]=` mà
  model binder .NET không nhận — và nó trả danh sách RỖNG chứ không báo lỗi);
- phát hiện **lỗi nghiệp vụ kèm HTTP 2xx** (`{ status: false }`) rồi reject;
- làm mới token khi 401, có **xếp hàng** để 5 request cùng 401 chỉ sinh một lượt refresh;
- toast lỗi **đúng một lần**, câu tiếng Việt map từ mã lỗi backend.

## Cờ cho từng request

```ts
apiClient.get(url, { skipErrorToast: true }); // caller tự hiện lỗi
apiClient.post(url, body, { skipAuthRefresh: true }); // ⛔ BẮT BUỘC cho login/refresh
apiClient.get(url, { skipBusinessErrorHandling: true }); // caller tự xử lý status:false
```

⛔ `skipAuthRefresh` cho lượt **đăng nhập** là bắt buộc. Sai mật khẩu trả 401;
không có cờ này thì interceptor tưởng phiên hết hạn và đi làm mới token — trong
khi chưa hề có phiên nào. Mỗi lần gõ sai mật khẩu là một lượt refresh vô nghĩa,
và với backend có đếm số lần dùng refresh token thì đó là tín hiệu bất thường.

## Xử lý lỗi ở tầng feature

Interceptor đã toast rồi. Chỉ toast thêm khi nó chưa xử lý:

```ts
onError: (error) => {
  if (isErrorHandled(error)) return; // interceptor đã toast
  showToast('error', toErrorMessage(error));
};
```

`toErrorMessage(unknown)` nhận **mọi** loại lỗi, kể cả thứ không phải
`AxiosError`. ⛔ Đừng ép kiểu `as AxiosError` ở tầng màn hình: ép sai thì đọc
`error.response` trên một `TypeError` sẽ ném lỗi mới ngay trong lúc đang hiển
thị lỗi cũ.

## queryKey

Đưa **mọi tham số ảnh hưởng tới kết quả** vào key, kể cả phạm vi (tổ chức, dự
án, phòng ban) nếu dự án có:

```ts
queryKey: ['reports', { projectId, status, page }];
```

Thiếu một tham số thì đổi bộ lọc mà dữ liệu không đổi — và người dùng đọc ra là
"bộ lọc hỏng".

## Bóc response

`unwrapData(response)` nhận cả `{ data: X }` lẫn `X` trần, vì backend nội bộ
không nhất quán giữa các endpoint.

⚠️ Ca nhập nhằng KHÔNG tự giải quyết được: khi chính dữ liệu nghiệp vụ cũng có
trường tên `data`. Lúc đó đọc `response.data` trực tiếp và ghi chú lý do tại chỗ.
