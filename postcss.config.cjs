module.exports = {
  plugins: {
    'postcss-preset-env': {
      stage: 0,
      features: {
        'nesting-rules': true,
        'custom-media-queries': true,
      },
      autoprefixer: {
        flexbox: 'no-2009',
      },
    },
  },
};
