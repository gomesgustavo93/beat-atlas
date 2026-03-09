import { useTranslation } from 'react-i18next'
import { useTheme } from 'next-themes'
import { Select, MenuItem, FormControl } from '@mui/material'

function LanguageSelector() {
  const { i18n } = useTranslation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const handleLanguageChange = (event: { target: { value: string } }) => {
    const newLanguage = event.target.value
    i18n.changeLanguage(newLanguage)
  }

  return (
    <FormControl size="small" sx={{ minWidth: 80 }}>
      <Select
        value={i18n.language}
        onChange={handleLanguageChange}
        sx={{
          color: isDark ? 'rgb(209, 213, 219)' : 'rgb(107, 114, 128)',
          fontSize: '14px',
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.3)'
              : 'rgba(0, 0, 0, 0.23)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1DB954',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1DB954',
          },
          '& .MuiSelect-icon': {
            color: isDark ? 'rgb(209, 213, 219)' : 'rgb(107, 114, 128)',
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: isDark ? 'rgb(17, 24, 39)' : 'white',
              '& .MuiMenuItem-root': {
                color: isDark ? 'rgb(209, 213, 219)' : 'rgb(17, 24, 39)',
                '&:hover': {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.04)',
                },
                '&.Mui-selected': {
                  backgroundColor: isDark
                    ? 'rgba(29, 185, 84, 0.2)'
                    : 'rgba(29, 185, 84, 0.1)',
                  color: '#1DB954',
                  '&:hover': {
                    backgroundColor: isDark
                      ? 'rgba(29, 185, 84, 0.3)'
                      : 'rgba(29, 185, 84, 0.15)',
                  },
                },
              },
            },
          },
        }}
      >
        <MenuItem value="pt">PT</MenuItem>
        <MenuItem value="en">EN</MenuItem>
      </Select>
    </FormControl>
  )
}

export default LanguageSelector
