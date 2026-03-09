import { useTranslation } from 'react-i18next'
import { Pagination as MuiPagination } from '@mui/material'
import { useTheme } from 'next-themes'
import { cn } from '../../utils/cn'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  limit?: number
  total?: number
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  limit,
  total,
}: PaginationProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const handleChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page)
  }

  return (
    <div
      className={cn(
        'flex',
        'justify-center',
        'items-center',
        'mt-8',
        'gap-2.5',
        'flex-wrap'
      )}
    >
      {total !== undefined && limit !== undefined && (
        <span
          className={cn(
            'text-gray-600',
            'dark:text-gray-300',
            'text-sm',
            'mr-2.5'
          )}
        >
          {t('pagination.showing')} {(currentPage - 1) * limit + 1} -{' '}
          {Math.min(currentPage * limit, total)} {t('home.of')} {total}
        </span>
      )}
      <MuiPagination
        count={totalPages}
        page={currentPage}
        onChange={handleChange}
        shape="rounded"
        color="primary"
        size="large"
        showFirstButton
        showLastButton
        sx={{
          '& .MuiPaginationItem-root': {
            color: isDark ? 'rgb(209, 213, 219)' : 'rgb(107, 114, 128)',
            '&.Mui-selected': {
              backgroundColor: 'rgb(59, 130, 246)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgb(37, 99, 235)',
              },
            },
            '&:hover': {
              backgroundColor: isDark
                ? 'rgba(209, 213, 219, 0.1)'
                : 'rgba(107, 114, 128, 0.1)',
            },
          },
          '& .MuiPaginationItem-root.Mui-disabled': {
            color: 'rgb(156, 163, 175)',
          },
        }}
      />
    </div>
  )
}

export default Pagination
