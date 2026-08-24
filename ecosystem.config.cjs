module.exports = {
  apps: [
    {
      name: 'neop-front',
      script: 'node_modules/vite/bin/vite.js',
      args: 'preview --port 3000 --host',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
