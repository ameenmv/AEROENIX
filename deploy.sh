set -e

echo "🚀 Starting deployment..."

# Merge latest changes (RunCloud webhook automatically fetches)
echo "📥 Merging latest from develop branch..."
git merge origin/develop

# Install dependencies
echo "📦 Installing dependencies..."
bun i

# Build the project
echo "🔨 Building project..."
bun run build

# Restart/Start with PM2
echo "🔄 Starting with PM2..."
pm2 restart ecosystem.config.cjs || pm2 start ecosystem.config.cjs

echo "✅ Deployment complete!"
