/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUnauthenticatedMap = /* GraphQL */ `
  subscription OnCreateUnauthenticatedMap {
    onCreateUnauthenticatedMap {
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
export const onUpdateUnauthenticatedMap = /* GraphQL */ `
  subscription OnUpdateUnauthenticatedMap {
    onUpdateUnauthenticatedMap {
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
export const onDeleteUnauthenticatedMap = /* GraphQL */ `
  subscription OnDeleteUnauthenticatedMap {
    onDeleteUnauthenticatedMap {
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
export const onCreatePublicMap = /* GraphQL */ `
  subscription OnCreatePublicMap($owner: String) {
    onCreatePublicMap(owner: $owner) {
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
export const onUpdatePublicMap = /* GraphQL */ `
  subscription OnUpdatePublicMap($owner: String) {
    onUpdatePublicMap(owner: $owner) {
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
export const onDeletePublicMap = /* GraphQL */ `
  subscription OnDeletePublicMap($owner: String) {
    onDeletePublicMap(owner: $owner) {
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
export const onCreateMap = /* GraphQL */ `
  subscription OnCreateMap($owner: String) {
    onCreateMap(owner: $owner) {
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
export const onUpdateMap = /* GraphQL */ `
  subscription OnUpdateMap($owner: String) {
    onUpdateMap(owner: $owner) {
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
export const onDeleteMap = /* GraphQL */ `
  subscription OnDeleteMap($owner: String) {
    onDeleteMap(owner: $owner) {
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
