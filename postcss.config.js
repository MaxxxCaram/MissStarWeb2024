module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    'tailwindcss': {},
    'autoprefixer': {
      overrideBrowserslist: ['last 2 versions', '> 1%'],
      grid: true
    },
    'postcss-preset-env': {
      features: {
        'nesting-rules': false
      }
    }
  }
} 