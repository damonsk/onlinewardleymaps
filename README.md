# OnlineWardleyMaps

[![Mentioned in Awesome Wardley Maps](https://awesome.re/mentioned-badge-flat.svg)](https://github.com/wardley-maps-community/awesome-wardley-maps#apps)


The source code that runs www.OnlineWardleyMaps.com.

Developed by  [@damonsk](https://twitter.com/damonsk).

Wardley Mapping courtesy of Simon Wardley, CC BY-SA 4.0. To learn more, see  [Simon's book](https://medium.com/wardleymaps/on-being-lost-2ef5f05eb1ec).


## Running locally

Dependancies for running locally. NodeJS and Yarn.

    npm install yarn -g

Install dependencies

    yarn install

Commands:

To run locally, develop/edit. Open web browser @ http://localhost:8080

     yarn start

To create minified scripts/styling. 

    yarn dist

To run all tests.

    yarn test

## Running in Docker & Kubernetes

Build the Docker image

    docker build -t luebken/onlinewardleymaps -f Dockerfile dist/

Run the Docker container to test locally

    docker run -p 8080:80 luebken/onlinewardleymaps

Push the Docker image

    docker push luebken/onlinewardleymaps

Create Kubernetes Deployment and Service

    kubectl create -f kubernetes.yaml

Grab the EXTERNAL-IP from `kubectl get svc onlinewardleymaps`
