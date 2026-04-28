# Use official Bun image
FROM jarredsumner/bun:latest

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN bun install

# Expose port (for local dev; Vercel ignores it)
EXPOSE 5000

# Start Hono app
CMD ["bun", "run", "index.ts"]