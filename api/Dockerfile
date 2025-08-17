FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create directory for documentation
RUN mkdir -p /usr/share/nginx/html/docs

# Copy unified documentation page
COPY docs/index.html /usr/share/nginx/html/docs/index.html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
