FROM node:8.11.1

# Create app directory
RUN mkdir -p /usr/src/onlinecinema
WORKDIR /usr/src/onlinecinema

# Install app dependencies
COPY package.json /usr/src/onlinecinema
RUN yarn

# Bundle app source
COPY . /usr/src/onlinecinema

# Build arguments
ARG NODE_VERSION=8.11.1

# Environment
ENV NODE_VERSION $NODE_VERSION