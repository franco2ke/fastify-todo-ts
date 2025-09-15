# Getting Started with [Fastify-CLI](https://www.npmjs.com/package/fastify-cli)

This project was bootstrapped with Fastify-CLI.

## Available Scripts

In the project directory, you can run:

### `npm run dev`

To start the app in dev mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm start`

For production mode

### `npm run test`

Run the test cases.

## Setting up the database

### Pull Latest Docker image

`docker pull postgres`

### Run PostgreSQL in a Docker container

`docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=p@ssword123 \
  -e POSTGRES_USER=francis \
  -e POSTGRES_DB=fastify_todo \
  -p 5432:5432 \
  -v postgres-dev-data:/var/lib/postgresql/data \
  -d postgres`

### Stopping Container

`docker stop postgres-db`

### Starting Container

`docker start postgres-db`

### Removing Container

`docker rm postgres-db`

### Verify Container is running

`docker ps`

### Enabling Persistent Storage

By default data in a container is lost when the container is removed. With databases we usually want to keep the data

Solution: Use docker volumes to store data outside the container file system

- Inspecting a volume

`docker volume inspect postgres-data`

- Creating a volume

`docker volume create postgres-data`

- Check if a volume exists

`docker volume ls`

- Remove existing volume

`docker volume rm postgres-data`

- List volumes

`docker volume ls`

- List all containers with their volumes

`docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Mounts}}"`

- Show volume usage

`docker system df -v`

### Connecting to Database running in the container

To connect to the PostgreSQL database running in the container from your host machine

`docker exec -it <container_name> psql -U youruser -d yourdatabase`

## Learn More

To learn Fastify, check out the [Fastify documentation](https://fastify.dev/docs/latest/).
