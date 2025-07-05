// src/layouts/components/helper.jsx - UPDATED
import { BiSolidCategory } from 'react-icons/bi';
import { FaFileAlt, FaFileArchive, FaUserFriends, FaVideo } from 'react-icons/fa';
import { FaAlignLeft, FaMoneyBill, FaNewspaper, FaProductHunt } from 'react-icons/fa6';
import { useLocation } from 'react-router-dom';

const getMenuItem = (label, key, icon, children, type) => {
  return {
    key,
    icon,
    children,
    label,
    type
  };
};

export const getMenuList = (userRoles) => {
  const currentWebsite = localStorage.getItem('website') || 'lermao';

  const menuItemsSuperAdmin = [
    getMenuItem('Đơn hàng', 'orders', <FaMoneyBill />),
    getMenuItem('Sản phẩm', 'products', <FaProductHunt />),
    getMenuItem('Công thức', 'recipes', <FaAlignLeft />),
    getMenuItem('Danh mục', 'categories', <BiSolidCategory />),
    getMenuItem('Người dùng', 'users', <FaUserFriends />),
    getMenuItem('Tin tức', 'news', <FaNewspaper />),
    getMenuItem('Video', 'videos', <FaVideo />)
  ];

  const menuItemsAdmin = [
    getMenuItem('Đơn hàng', 'orders', <FaMoneyBill />),
    getMenuItem('Sản phẩm', 'products', <FaProductHunt />),
    getMenuItem('Công thức', 'recipes', <FaAlignLeft />),
    getMenuItem('Danh mục', 'categories', <BiSolidCategory />),
    getMenuItem('Người dùng', 'users', <FaUserFriends />),
    getMenuItem('Tin tức', 'news', <FaNewspaper />),
    getMenuItem('Video', 'videos', <FaVideo />)
  ];

  if (userRoles?.includes('ROLE_SUPER_ADMIN')) {
    if (currentWebsite === 'lermao') {
      return menuItemsSuperAdmin;
    }
    return [
      ...menuItemsSuperAdmin,
      getMenuItem('Việc làm', 'recruitment', <FaFileAlt />),
      getMenuItem('Bài viết văn hoá', 'blog-culture', <FaFileArchive />),
      getMenuItem('Quản lý trang', 'pages', <FaFilePen />) // THÊM MENU PAGES
    ];
  } else {
    if (currentWebsite === 'lermao') {
      return menuItemsAdmin;
    }
    return [
      ...menuItemsAdmin,
      getMenuItem('Việc làm', 'recruitment', <FaFileAlt />),
      getMenuItem('Bài viết văn hoá', 'blog-culture', <FaFileArchive />),
      getMenuItem('Quản lý trang', 'pages', <FaFilePen />) // THÊM MENU PAGES
    ];
  }
};

export const MENU_ROUTES = [
  {
    key: 'dashboard',
    route: '/',
    breadcrumb: [
      {
        title: 'Bảng điều khiển',
        route: '/'
      }
    ],
    section: 'Bảng điều khiển'
  },
  {
    key: 'orders',
    route: '/orders',
    breadcrumb: [
      {
        title: 'Đơn hàng',
        route: '/orders'
      }
    ],
    section: 'Đơn hàng'
  },
  {
    key: 'completed-orders',
    route: '/completed-orders',
    breadcrumb: [
      {
        title: 'Đơn hàng đã hoàn thành',
        route: '/completed-orders'
      }
    ],
    section: 'Đơn hàng đã hoàn thành'
  },
  {
    key: 'products',
    route: '/products',
    breadcrumb: [
      {
        title: 'Sản phẩm',
        route: '/products'
      }
    ],
    section: 'Danh sách sản phẩm'
  },
  {
    key: 'products/:id/edit',
    route: '/products/:id/edit',
    breadcrumb: [
      {
        title: 'Sản phẩm',
        route: '/products'
      },
      {
        title: 'Cập nhật sản phẩm',
        route: '/products/:id/edit'
      }
    ],
    section: 'Cập nhật sản phẩm'
  },

  // =================================
  // PAGES ROUTES - THÊM MỚI
  // =================================
  {
    key: 'pages',
    route: '/pages',
    breadcrumb: [
      {
        title: 'Quản lý trang',
        route: '/pages'
      }
    ],
    section: 'Danh sách trang'
  },
  {
    key: 'pages/create',
    route: '/pages/create',
    breadcrumb: [
      {
        title: 'Quản lý trang',
        route: '/pages'
      },
      {
        title: 'Tạo trang mới',
        route: '/pages/create'
      }
    ],
    section: 'Tạo trang mới'
  },
  {
    key: 'pages/:id/edit',
    route: '/pages/:id/edit',
    breadcrumb: [
      {
        title: 'Quản lý trang',
        route: '/pages'
      },
      {
        title: 'Cập nhật trang',
        route: '/pages/:id/edit'
      }
    ],
    section: 'Cập nhật trang'
  },
  {
    key: 'pages/:id/detail',
    route: '/pages/:id/detail',
    breadcrumb: [
      {
        title: 'Quản lý trang',
        route: '/pages'
      },
      {
        title: 'Chi tiết trang',
        route: '/pages/:id/detail'
      }
    ],
    section: 'Chi tiết trang'
  },

  // =================================
  // EXISTING ROUTES (giữ nguyên)
  // =================================
  {
    key: 'recruitment',
    route: '/recruitment',
    breadcrumb: [
      {
        title: 'Việc làm',
        route: '/recruitment'
      }
    ],
    section: 'Danh sách việc làm'
  },
  {
    key: 'recruitment/:id/edit',
    route: '/recruitment/:id/edit',
    breadcrumb: [
      {
        title: 'Việc làm',
        route: '/recruitment'
      },
      {
        title: 'Cập nhật việc làm',
        route: '/recruitment/:id/edit'
      }
    ],
    section: 'Cập nhật việc làm'
  },
  {
    key: 'recruitment/:id/applies',
    route: '/recruitment/:id/applies',
    breadcrumb: [
      {
        title: 'Việc làm',
        route: '/recruitment'
      },
      {
        title: 'Hồ sơ ứng tuyển',
        route: '/recruitment/:id/applies'
      }
    ],
    section: 'Hồ sơ ứng tuyển'
  },
  {
    key: 'recruitment/create',
    route: '/recruitment/create',
    breadcrumb: [
      {
        title: 'Việc làm',
        route: '/recruitment'
      },
      {
        title: 'Tạo việc làm',
        route: '/recruitment/create'
      }
    ],
    section: 'Tạo việc làm'
  },
  {
    key: 'recipes',
    route: '/recipes',
    breadcrumb: [
      {
        title: 'Công thức',
        route: '/recipes'
      }
    ],
    section: 'Danh sách công thức'
  },
  {
    key: 'recipes/create',
    route: '/recipes/create',
    breadcrumb: [
      {
        title: 'Công thức',
        route: '/recipes'
      },
      {
        title: 'Tạo công thức',
        route: '/recipes/create'
      }
    ],
    section: 'Tạo công thức'
  },
  {
    key: 'recipes/:id/edit',
    route: '/recipes/:id/edit',
    breadcrumb: [
      {
        title: 'Công thức',
        route: '/recipes'
      },
      {
        title: 'Cập nhật công thức',
        route: '/recipes/:id/edit'
      }
    ],
    section: 'Cập nhật công thức'
  },
  {
    key: 'backgrounds',
    route: '/backgrounds',
    breadcrumb: [
      {
        title: 'Background',
        route: '/backgrounds'
      }
    ],
    section: 'Danh sách background'
  },
  {
    key: 'stickers',
    route: '/stickers',
    breadcrumb: [
      {
        title: 'Sticker',
        route: '/stickers'
      }
    ],
    section: 'Danh sách sticker'
  },
  {
    key: 'categories',
    route: '/categories',
    breadcrumb: [
      {
        title: 'Danh mục',
        route: '/categories'
      }
    ],
    section: 'Danh sách danh mục'
  },
  {
    key: 'categories/sort',
    route: '/categories/sort',
    breadcrumb: [
      {
        title: 'Danh mục',
        route: '/categories'
      },
      {
        title: 'Sắp xếp danh mục',
        route: '/categories/sort'
      }
    ],
    section: 'Sắp xếp danh mục'
  },
  {
    key: 'categories/create',
    route: '/categories/create',
    breadcrumb: [
      {
        title: 'Danh mục',
        route: '/categories'
      },
      {
        title: 'Tạo danh mục',
        route: '/categories/create'
      }
    ],
    section: 'Tạo danh mục'
  },
  {
    key: 'categories/:id/edit',
    route: '/categories/:id/edit',
    breadcrumb: [
      {
        title: 'Danh mục',
        route: '/categories'
      },
      {
        title: 'Cập nhật danh mục',
        route: '/categories/:id/edit'
      }
    ],
    section: 'Cập nhật danh mục'
  },
  {
    key: 'categories/:id/detail',
    route: '/categories/:id/detail',
    breadcrumb: [
      {
        title: 'Danh mục',
        route: '/categories'
      },
      {
        title: 'Chi tiết danh mục',
        route: '/categories/:id/detail'
      }
    ],
    section: 'Chi tiết danh mục'
  },
  {
    key: 'users',
    route: '/users',
    breadcrumb: [
      {
        title: 'Người dùng',
        route: '/users'
      }
    ],
    section: 'Danh sách người dùng'
  },
  {
    key: 'users/create',
    route: '/users/create',
    breadcrumb: [
      {
        title: 'Người dùng',
        route: '/users'
      },
      {
        title: 'Tạo người dùng',
        route: '/users/create'
      }
    ],
    section: 'Tạo người dùng'
  },
  {
    key: 'users/:id/edit',
    route: '/users/:id/edit',
    breadcrumb: [
      {
        title: 'Người dùng',
        route: '/users'
      },
      {
        title: 'Cập nhật người dùng',
        route: '/users/:id/edit'
      }
    ],
    section: 'Cập nhật người dùng'
  },
  {
    key: 'users/:id/detail',
    route: '/users/:id/detail',
    breadcrumb: [
      {
        title: 'Người dùng',
        route: '/users'
      },
      {
        title: 'Chi tiết người dùng',
        route: '/users/:id/detail'
      }
    ],
    section: 'Chi tiết người dùng'
  },
  {
    key: 'videos',
    route: '/videos',
    breadcrumb: [
      {
        title: 'Video',
        route: '/videos'
      }
    ],
    section: 'Danh sách video'
  },
  {
    key: 'videos/create',
    route: '/videos/create',
    breadcrumb: [
      {
        title: 'Video',
        route: '/videos'
      },
      {
        title: 'Tạo video',
        route: '/videos/create'
      }
    ],
    section: 'Tạo video'
  },
  {
    key: 'videos/:id/edit',
    route: '/videos/:id/edit',
    breadcrumb: [
      {
        title: 'Video',
        route: '/videos'
      },
      {
        title: 'Cập nhật video',
        route: '/videos/:id/edit'
      }
    ],
    section: 'Cập nhật video'
  },
  {
    key: 'news',
    route: '/news',
    breadcrumb: [
      {
        title: 'Tin tức',
        route: '/news'
      }
    ],
    section: 'Danh sách tin tức'
  },
  {
    key: 'news/create',
    route: '/news/create',
    breadcrumb: [
      {
        title: 'Tin tức',
        route: '/news'
      },
      {
        title: 'Tạo tin tức',
        route: '/news/create'
      }
    ],
    section: 'Tạo tin tức'
  },
  {
    key: 'news/:id/edit',
    route: '/news/:id/edit',
    breadcrumb: [
      {
        title: 'Tin tức',
        route: '/news'
      },
      {
        title: 'Cập nhật tin tức',
        route: '/news/:id/edit'
      }
    ],
    section: 'Cập nhật tin tức'
  },
  {
    key: 'news/:id/detail',
    route: '/news/:id/detail',
    breadcrumb: [
      {
        title: 'Tin tức',
        route: '/news'
      },
      {
        title: 'Chi tiết tin tức',
        route: '/news/:id/detail'
      }
    ],
    section: 'Chi tiết tin tức'
  },
  {
    key: 'blog-culture',
    route: '/blog-culture',
    breadcrumb: [
      {
        title: 'Bài viết văn hoá',
        route: '/blog-culture'
      }
    ],
    section: 'Danh sách bài viết văn hoá'
  },
  {
    key: 'blog-culture/create',
    route: '/blog-culture/create',
    breadcrumb: [
      {
        title: 'Danh sách bài viết văn hoá',
        route: '/blog-culture'
      },
      {
        title: 'Tạo bài viết',
        route: '/blog-culture/create'
      }
    ],
    section: 'Tạo bài viết'
  },
  {
    key: 'blog-culture/:id/edit',
    route: '/blog-culture/:id/edit',
    breadcrumb: [
      {
        title: 'Danh sách bài viết văn hoá',
        route: '/blog-culture'
      },
      {
        title: 'Cập nhật bài viết',
        route: '/blog-culture/:id/edit'
      }
    ],
    section: 'Cập nhật bài viết'
  },
  {
    key: 'feedbacks',
    route: '/feedbacks',
    breadcrumb: [
      {
        title: 'Feedback',
        route: '/feedbacks'
      }
    ],
    section: 'Danh sách feedback'
  }
];

export const useGetCurrentRoute = () => {
  const { pathname } = useLocation();

  if (pathname.includes('/edit') || pathname.includes('/detail') || pathname.includes('/applies')) {
    const route = pathname.split('/')[1];
    const type = pathname.split('/')[3];
    const newPathname = `/${route}/:id/${type}`;
    const currentRoute = MENU_ROUTES.find((i) => i.route === newPathname);
    if (currentRoute) {
      const { breadcrumb } = currentRoute;
      const newBreadcrumb = breadcrumb.map((item) => {
        if (item.route === newPathname) {
          return { title: item.title, route: pathname };
        }
        return item;
      });
      return { ...currentRoute, breadcrumb: newBreadcrumb };
    }
    return MENU_ROUTES.find((i) => i.route === newPathname);
  }

  return MENU_ROUTES.find((i) => i.route === pathname);
};
