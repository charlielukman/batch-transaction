FROM node:14 as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Step 2: Serve the app from an nginx server
FROM nginx:1.19.0-alpine as production

COPY --from=build /app/dist /usr/share/nginx/html

# Copy the default nginx.conf provided by tiangolo/node-frontend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]