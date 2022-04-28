/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUnauthenticatedMap = /* GraphQL */ `
  query GetUnauthenticatedMap($id: ID!) {
    getUnauthenticatedMap(id: $id) {
      id
      mapText
      name
      imageData
      mapIterations
      createdAt
      updatedAt
    }
  }
`;
export const listUnauthenticatedMaps = /* GraphQL */ `
  query ListUnauthenticatedMaps(
    $filter: ModelUnauthenticatedMapFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUnauthenticatedMaps(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        mapText
        name
        imageData
        mapIterations
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getPublicMap = /* GraphQL */ `
  query GetPublicMap($id: ID!) {
    getPublicMap(id: $id) {
      id
      mapText
      readOnly
      name
      imageData
      mapIterations
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listPublicMaps = /* GraphQL */ `
  query ListPublicMaps(
    $filter: ModelPublicMapFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPublicMaps(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        mapText
        readOnly
        name
        imageData
        mapIterations
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const getMap = /* GraphQL */ `
  query GetMap($id: ID!) {
    getMap(id: $id) {
      id
      mapText
      private
      name
      imageData
      mapIterations
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listMaps = /* GraphQL */ `
  query ListMaps(
    $filter: ModelMapFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMaps(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        mapText
        private
        name
        imageData
        mapIterations
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
