# Split Room - Ứng dụng chia tiền nhóm

Ứng dụng web chia tiền nhóm đơn giản, sử dụng mã mời để tham gia và quản lý chi tiêu realtime.

## Tính năng

- 🔐 **2 Flow đăng nhập:**
  - **Anonymous**: Nhập mã phòng → nhập tên → vào phòng
  - **Email/Password**: Đăng nhập → tạo phòng mới hoặc vào phòng có sẵn
- 📱 **Giao diện mobile-first** với PWA support
- 💰 **Quản lý giao dịch realtime** với Firestore
- 📊 **Tính toán số dư** và đề xuất chuyển tiền tối thiểu
- 🔄 **Lưu trữ phòng** - refresh không bị mất phòng

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Database**: Firebase Firestore (realtime)
- **Authentication**: Firebase Auth (Anonymous + Email/Password)
- **PWA**: next-pwa với manifest
- **Deployment**: Vercel (frontend) + Firebase (backend)

## Cài đặt

1. **Clone repository:**
```bash
git clone https://github.com/quanganhtapcode/gpac-2025.git
cd gpac-2025
```

2. **Cài đặt dependencies:**
```bash
npm install
```

3. **Tạo file `.env.local` với Firebase config:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Chạy development server:**
```bash
npm run dev
```

## Cấu hình Firebase

1. **Tạo project trên Firebase Console**
2. **Bật Authentication:**
   - Anonymous (cho flow vào phòng nhanh)
   - Email/Password (cho flow đăng nhập)
3. **Tạo Firestore Database** (production mode)
4. **Cập nhật Security Rules** (copy nội dung từ `firestore.rules`)
5. **Thêm domain Vercel** vào Auth → Authorized domains

## Cách sử dụng

### Flow 1: Vào phòng (Anonymous)
1. Truy cập trang chủ
2. Tab "Vào phòng" → nhập mã phòng
3. Nhập tên của bạn
4. Vào phòng và bắt đầu thêm giao dịch

### Flow 2: Đăng nhập (Email/Password)
1. Tab "Đăng nhập" → nhập email/password
2. Sau khi đăng nhập có thể:
   - Tạo phòng mới (sinh mã mời)
   - Vào phòng có sẵn

### Trong phòng
- **Thêm giao dịch**: Số tiền, mô tả, người trả, danh sách người được chia
- **Xem số dư**: Mỗi người nợ/được bao nhiêu
- **Gợi ý chuyển tiền**: Thuật toán tối ưu để ít lượt chuyển nhất

## Cấu trúc dữ liệu Firestore

```
rooms/{roomCode}/
├── createdAt: timestamp
├── type: "created" | "joined"
├── participants/{userId}/
│   ├── name: string
│   ├── joinedAt: timestamp
│   └── type: "anonymous" | "email"
└── transactions/{transactionId}/
    ├── amount: number
    ├── description: string
    ├── payerUid: string
    ├── participants: string[]
    └── timestamp: number

users/{userId}/
├── name: string
├── lastRoomCode: string
├── lastJoinedAt: timestamp
└── type: "anonymous" | "email"
```

## Deploy

### Frontend (Vercel)
- Kết nối GitHub repo với Vercel
- Thêm Environment Variables
- Auto-deploy khi push code

### Backend (Firebase)
- Copy `firestore.rules` vào Firebase Console
- Bật các dịch vụ cần thiết

## Ghi chú

- **Anonymous users**: Chỉ có thể vào phòng, không thể tạo phòng mới
- **Email users**: Có thể tạo phòng mới và quản lý
- **Persistence**: Tên và phòng cuối cùng được lưu vào localStorage + Firestore
- **Security**: Firestore rules đảm bảo users chỉ có thể sửa dữ liệu của mình

## Live Demo

App được deploy tại: [gpac-2025.vercel.app](https://gpac-2025.vercel.app)

## Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request
