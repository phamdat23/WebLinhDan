# Standard Scalable Web Project Architecture

Dự án này được tổ chức theo cấu trúc **Feature-First / Modular Architecture**, tối ưu cho việc bảo trì, mở rộng và dễ đọc cho lập trình viên (Clean Code & Maintainability).

---

## 📁 Cấu Trúc Thư Mục (Folder Structure)

```text
project_product_web_Dan/
├── public/                     # Tài nguyên tĩnh public không qua build (favicon, robots.txt, manifests)
│   ├── favicon.ico
│   └── robots.txt
├── src/                        # Mã nguồn chính của ứng dụng
│   ├── assets/                 # Tài nguyên tĩnh nội bộ (images, icons, fonts, media)
│   │   ├── fonts/
│   │   ├── icons/
│   │   └── images/
│   ├── components/             # Các UI components dùng chung toàn hệ thống (Shared Components)
│   │   ├── ui/                 # Atomic UI base components (Button, Input, Modal, Badge, Card, Spinner)
│   │   ├── common/             # Business UI components dùng chung (DataTable, SearchBar, Notification)
│   │   └── layout/             # Các phần khung trang (Header, Footer, Sidebar, Navbar)
│   ├── features/               # Quản lý theo từng tính năng/nghiệp vụ (Feature-First Architecture)
│   │   ├── auth/               # Ví dụ: Tính năng Đăng nhập / Đăng ký
│   │   │   ├── components/     # Components riêng cho Auth (LoginForm, RegisterForm)
│   │   │   ├── hooks/          # Custom hooks riêng cho Auth (useAuth, useLogin)
│   │   │   ├── services/       # Call API riêng cho Auth (authApi.js)
│   │   │   ├── types/          # TypeScript types riêng cho Auth
│   │   │   └── index.js        # Barrel export public interface của feature
│   │   ├── products/           # Ví dụ: Tính năng Quản lý Sản phẩm
│   │   └── cart/               # Ví dụ: Tính năng Giỏ hàng
│   ├── hooks/                  # Custom Hooks toàn cục dùng chung (useDebounce, useMediaQuery, useLocalStorage)
│   ├── layouts/                # Wrapper layouts cho các trang khác nhau (MainLayout, AuthLayout, AdminLayout)
│   ├── pages/                  # Route Views / Page Controllers (Home, ProductDetail, CartPage, NotFound)
│   ├── services/               # Cấu hình HTTP Client & Global API services
│   │   ├── api/                # Endpoints definition & Axios/Fetch instance configuration
│   │   └── client.js           # Base HTTP Client (Interceptors, Auth Headers, Error handling)
│   ├── store/                  # State Management (Zustand, Redux Toolkit, hoặc Context API)
│   ├── styles/                 # Global styles, Design System CSS Tokens, Theme, Tailwind config
│   │   ├── variables.css       # CSS Variables (Colors, Spacing, Typography)
│   │   ├── reset.css           # CSS Reset
│   │   └── global.css          # Styles chung toàn ứng dụng
│   ├── types/                  # TypeScript Types / Interfaces chung cho toàn ứng dụng (User, Pagination, Response)
│   ├── utils/                  # Helper functions / Utility utilities (formatCurrency, formatDate, validateEmail)
│   ├── constants/              # Các hằng số cố định (routes, storage keys, HTTP status codes, config constants)
│   ├── App.jsx / App.js        # Root App Component
│   └── main.jsx / index.js     # Entry point chính của ứng dụng
├── .env.example                # File mẫu các biến môi trường (Environment Variables)
├── .gitignore                  # Cấu hình bỏ qua git tracking (node_modules, build outputs, secret env)
├── README.md                   # Tài liệu hướng dẫn dự án
└── package.json                # Quản lý dependencies & scripts
```

---

## 🎯 Nguyên Tắc Thiết Kế Cấu Trúc (Core Principles)

### 1. **Feature-First Architecture (Ưu tiên quản lý theo Tính năng)**
- **Tại sao?** Khi dự án phát triển lớn (hàng trăm files), việc sắp xếp theo tính năng (`features/auth`, `features/products`) giúp bạn mở 1 thư mục là thấy ngay toàn bộ code liên quan tới tính năng đó (UI, API, State, Types), tránh việc phải di chuyển qua lại giữa các thư mục nằm cách xa nhau.

### 2. **Phân biệt Rõ ràng giữa `components/ui` và `components/common`**
- **`components/ui`**: Chứa các component nguyên tử (Atoms) không dính tới logic business (VD: Button, Input, Modal, Dropdown). Có thể tái sử dụng ở bất kỳ dự án nào.
- **`components/common`**: Chứa các component kết hợp có logic business nhẹ (VD: HeaderUserMenu, SearchProductBar, OrderSummaryCard).

### 3. **Tách biệt Logic và UI (Separations of Concerns)**
- View/UI (`components`, `pages`) chỉ tập trung hiển thị giao diện.
- Logic gọi API và xử lý dữ liệu được đẩy vào `services/` hoặc `hooks/`.
- Helper xử lý chuỗi/ngày tháng/tiền tệ đẩy vào `utils/`.

### 4. **Barrel Export (`index.js` / `index.ts`)**
- Ở mỗi thư mục feature (VD: `features/auth/index.js`), export ra những gì cần dùng ra bên ngoài để khi import gọn gàng hơn:
  ```js
  import { LoginForm, useAuth } from '@/features/auth';
  ```

---

## 🚀 Quy Chuẩn Đặt Tên (Naming Conventions)

1. **Components / Pages / Layouts**: Dùng `PascalCase`
   - `Header.jsx`, `LoginForm.jsx`, `ProductCard.jsx`
2. **Hooks**: Dùng `camelCase` bắt đầu bằng `use`
   - `useAuth.js`, `useDebounce.js`, `useFetch.js`
3. **Services / Utils / Constants**: Dùng `camelCase`
   - `formatCurrency.js`, `authService.js`, `apiEndpoints.js`
4. **CSS / Style Files**: Dùng `kebab-case` hoặc `camelCase` (với CSS Modules)
   - `global.css`, `button.module.css`
5. **Types / Interfaces**: Dùng `PascalCase`
   - `User.ts`, `Product.ts`, `ApiResponse.ts`
