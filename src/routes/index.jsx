import { ErrorScreen } from '@/components/effect-screen';
import MainLayout from '@/layouts/main';
import NotFound404 from '@/pages/404';
import { ApplyList } from '@/pages/apply';
import { CategoryCreate, CategoryList, CategorySort, CategoryEdit } from '@/pages/category';
import { BlogCultureCreate, BlogCultureList } from '@/pages/culture-blog';
import Dashboard from '@/pages/dashboard';
import Login from '@/pages/login';
import { NewsCreate, NewsList } from '@/pages/news';
import { AllOrder } from '@/pages/order';
import { PagesCreate, PagesList, PagesDetail } from '@/pages/pages'; // THÊM PAGES IMPORTS
import { ProductsCreate, ProductsList } from '@/pages/products';
import { RecipeCreate, RecipeList } from '@/pages/recipe';
import { RecruitmentCreate, RecruitmentList } from '@/pages/recruitment';
import { UserCreate, UserList } from '@/pages/user';
import { VideoCreate, VideoList } from '@/pages/video';
import { ErrorBoundary } from 'react-error-boundary';
import { Route, Routes } from 'react-router-dom';

const AppRoute = () => {
  return (
    <ErrorBoundary FallbackComponent={({ error }) => <ErrorScreen className="mt-20" message={error?.message} />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<MainLayout />}>
          <Route index element={<Dashboard />} />

          <Route path="orders">
            <Route path="" element={<AllOrder />} />
          </Route>

          <Route path="categories">
            <Route path="" element={<CategoryList />} />
            <Route path="sort" element={<CategorySort />} />
            <Route path="create" element={<CategoryCreate />} />
            <Route path=":id/edit" element={<CategoryEdit />} />
          </Route>

          <Route path="news">
            <Route path="" element={<NewsList />} />
            <Route path="create" element={<NewsCreate />} />
            <Route path=":id/edit" element={<NewsCreate />} />
            <Route path=":id/detail" element={<NewsCreate />} />
          </Route>

          <Route path="blog-culture">
            <Route path="" element={<BlogCultureList />} />
            <Route path="create" element={<BlogCultureCreate />} />
            <Route path=":id/edit" element={<BlogCultureCreate />} />
            <Route path=":id/detail" element={<BlogCultureCreate />} />
          </Route>

          {/* THÊM PAGES ROUTES */}
          <Route path="pages">
            <Route path="" element={<PagesList />} />
            <Route path="create" element={<PagesCreate />} />
            <Route path=":id/edit" element={<PagesCreate />} />
            <Route path=":id/detail" element={<PagesDetail />} />
          </Route>

          <Route path="recruitment">
            <Route path="" element={<RecruitmentList />} />
            <Route path="create" element={<RecruitmentCreate />} />
            <Route path=":id/edit" element={<RecruitmentCreate />} />
            <Route path=":id/detail" element={<RecruitmentCreate />} />
            <Route path=":id/applies" element={<ApplyList />} />
          </Route>

          <Route path="users">
            <Route path="" element={<UserList />} />
            <Route path="create" element={<UserCreate />} />
            <Route path=":id/edit" element={<UserCreate />} />
          </Route>

          <Route path="videos">
            <Route path="" element={<VideoList />} />
            <Route path="create" element={<VideoCreate />} />
            <Route path=":id/edit" element={<VideoCreate />} />
          </Route>

          <Route path="products">
            <Route path="" element={<ProductsList />} />
            <Route path="create" element={<ProductsCreate />} />
            <Route path=":id/edit" element={<ProductsCreate />} />
          </Route>

          <Route path="recipes">
            <Route path="" element={<RecipeList />} />
            <Route path="create" element={<RecipeCreate />} />
            <Route path=":id/edit" element={<RecipeCreate />} />
          </Route>

          <Route path="*" element={<NotFound404 />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoute;
