import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';

function PageLayout() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default PageLayout;
